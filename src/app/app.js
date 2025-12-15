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
  };

  console.log('Elements found:', elements);

  if (!elements.form || !elements.input) {
    console.error('Form or input not found!');
    return;
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
    },
  };

  let updateCycleControl = null;

  const state = initView(elements, initialState, i18n);
  console.log('State initialized:', state);

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
    console.log('Input changed');
    if (state.form.error) {
      state.form.error = null;
    }
  });

  // Запускаем цикл обновления если есть фиды при старте
  if (state.feeds.length > 0) {
    restartUpdateCycle();
  }

  // Возвращаем состояние и контроллер
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
