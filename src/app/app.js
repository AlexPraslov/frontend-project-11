import initView from './view';
import validateUrl from './validator';
import fetchRSS from './api';
import parseRSS from './parser';
import { startUpdateCycle } from './updater';

const initApp = (i18n) => {
  console.log('initApp called');

  const elements = {
    form: document.querySelector('[data-rss-form]'),
    input: document.querySelector('[data-rss-input]'),
    feedback: document.querySelector('[data-rss-feedback]'),
    button: document.querySelector('[data-rss-submit]'),
    feedsContainer: document.querySelector('[data-rss-feeds]'),
    postsContainer: document.querySelector('[data-rss-posts]'),
    // Элементы модального окна
    modal: document.querySelector('#post-modal'),
    modalTitle: document.querySelector('[data-modal-title]'),
    modalDescription: document.querySelector('[data-modal-description]'),
    modalLink: document.querySelector('[data-modal-link]'),
  };

  console.log('Elements found:', elements);

  if (!elements.form || !elements.input) {
    console.error('Form or input not found!');
    return;
  }

  // Инициализация Bootstrap модалки
  let postModal = null;
  if (elements.modal && window.bootstrap) {
    // eslint-disable-next-line no-undef
    postModal = new bootstrap.Modal(elements.modal);
  }

  // Обновляем тексты интерфейса
  document.querySelector('h1').textContent = i18n.t('appTitle');
  elements.input.placeholder = i18n.t('inputPlaceholder');
  elements.button.textContent = i18n.t('submitButton');

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      error: null,
      status: 'idle',
      url: '',
    },
    loading: {
      processState: 'idle',
      error: null,
    },
    ui: {
      lastUpdate: null,
      updateInProgress: false,
      readPostIds: new Set(), // Новое: ID прочитанных постов
      modal: {
        isOpen: false,
        currentPost: null,
      },
    },
  };

  let updateCycleControl = null;

  const state = initView(elements, initialState, i18n, null); // Пока передаем null
  console.log('State initialized:', state);

  // Функция для открытия модалки с постом (теперь state доступен)
  const openPostModal = (post) => {
    if (!postModal || !elements.modalTitle || !elements.modalDescription || !elements.modalLink) {
      console.error('Modal elements not found');
      return;
    }

    // Заполняем модалку данными
    elements.modalTitle.textContent = post.title;
    elements.modalDescription.innerHTML = post.description || 'Нет описания';
    elements.modalLink.href = post.link;

    // Отмечаем пост как прочитанный
    if (!state.ui.readPostIds.has(post.id)) {
      state.ui.readPostIds.add(post.id);
    }

    // Открываем модалку
    postModal.show();
    state.ui.modal.isOpen = true;
    state.ui.modal.currentPost = post;

    console.log('Post modal opened for:', post.title);
  };

  // Теперь обновляем view с правильной функцией
  state.ui.openPostModal = openPostModal;

  // Функция для обновления состояния (для updater)
  const updateState = (updater) => {
    const newState = updater(state);
    Object.keys(newState).forEach((key) => {
      state[key] = newState[key];
    });
  };

  // Функция для получения состояния (для updater)
  const getState = () => ({ ...state });

  // Функция для запуска/перезапуска цикла обновления
  const restartUpdateCycle = () => {
    if (updateCycleControl) {
      updateCycleControl.stop();
    }

    if (state.feeds.length > 0) {
      updateCycleControl = startUpdateCycle(getState, updateState, 5000);
      console.log('Update cycle started/restarted');
    }
  };

  // Закрытие модалки
  if (elements.modal) {
    elements.modal.addEventListener('hidden.bs.modal', () => {
      state.ui.modal.isOpen = false;
      state.ui.modal.currentPost = null;
      console.log('Post modal closed');
    });
  }

  const handleFormSubmit = (e) => {
    console.log('Form submitted');
    e.preventDefault();

    const url = elements.input.value.trim();
    console.log('URL submitted:', url);

    if (!url) {
      state.form.error = i18n.t('errors.required');
      state.form.status = 'error';
      return;
    }

    state.form.url = url;
    state.form.status = 'sending';
    state.form.error = null;
    state.loading.processState = 'loading';
    state.loading.error = null;
    state.ui.updateInProgress = true;

    console.log('Starting validation...');
    validateUrl(url, i18n, state.feeds.map((feed) => feed.url))
      .then((validationResult) => {
        console.log('Validation result:', validationResult);
        if (!validationResult.isValid) {
          state.form.error = validationResult.errors.url;
          state.form.status = 'error';
          state.loading.processState = 'failed';
          state.ui.updateInProgress = false;
          return;
        }

        console.log('Fetching RSS from:', url);
        return fetchRSS(url)
          .then((xmlData) => {
            console.log('RSS fetched successfully, length:', xmlData.length);
            return parseRSS(xmlData);
          })
          .then((parsedData) => {
            console.log('RSS parsed successfully. Feed:', parsedData.feed.title, 'Posts:', parsedData.posts.length);

            // Добавляем URL к фиду для проверки дубликатов
            const feedWithUrl = {
              ...parsedData.feed,
              url,
            };

            // Добавляем новые посты с фидId
            const postsWithFeedId = parsedData.posts.map((post) => ({
              ...post,
              feedId: feedWithUrl.id,
            }));

            state.feeds.push(feedWithUrl);
            state.posts.push(...postsWithFeedId);
            state.form.status = 'success';
            state.form.error = null;
            state.form.url = '';
            state.loading.processState = 'idle';
            state.ui.updateInProgress = false;
            state.ui.lastUpdate = new Date().toISOString();

            // Перезапускаем цикл обновления
            restartUpdateCycle();
          })
          .catch((error) => {
            console.error('Error in RSS pipeline:', error);
            let errorMessage = i18n.t('errors.parsing');

            if (error.message.includes('timeout')) {
              errorMessage = i18n.t('errors.timeout');
            } else if (error.message.includes('empty content')) {
              errorMessage = i18n.t('errors.empty');
            } else if (error.message.includes('Network error')) {
              errorMessage = i18n.t('errors.network');
            }

            state.form.error = errorMessage;
            state.form.status = 'error';
            state.loading.processState = 'failed';
            state.ui.updateInProgress = false;
            state.loading.error = error.message;
          });
      })
      .catch((error) => {
        console.error('Validation error:', error);
        state.form.error = i18n.t('errors.unknown');
        state.form.status = 'error';
        state.loading.processState = 'failed';
        state.ui.updateInProgress = false;
      });
  };

  elements.form.addEventListener('submit', handleFormSubmit);
  console.log('Event listener attached');

  elements.input.addEventListener('input', () => {
    if (state.form.error) {
      state.form.error = null;
    }
  });

  // Запускаем цикл обновления если есть фиды при старте
  if (state.feeds.length > 0) {
    restartUpdateCycle();
  }

  // Возвращаем состояние и функции
  return {
    state,
    stopUpdateCycle: () => {
      if (updateCycleControl) {
        updateCycleControl.stop();
      }
    },
  };
};

export default initApp;
