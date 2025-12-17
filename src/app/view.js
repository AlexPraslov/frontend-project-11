// eslint-disable-next-line import/no-unresolved
import onChange from 'on-change';

const renderFormError = (elements, error) => {
  const { input, feedback } = elements;

  if (error) {
    input.classList.add('is-invalid');
    feedback.textContent = error;
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.style.display = 'block';
  } else {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    feedback.style.display = 'none';
  }
};

const renderFormStatus = (elements, status, i18n) => {
  const { button, input, feedback } = elements;

  switch (status) {
    case 'sending':
      button.disabled = true;
      button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${i18n.t('loadingButton')}`;
      input.readOnly = true;
      feedback.style.display = 'none';
      break;

    case 'success':
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
      input.value = '';
      input.focus();

      feedback.textContent = i18n.t('success.rssAdded');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.style.display = 'block';

      setTimeout(() => {
        if (feedback.style.display === 'block' && feedback.classList.contains('text-success')) {
          feedback.style.display = 'none';
          feedback.textContent = '';
        }
      }, 3000);
      break;

    case 'error':
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    default:
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
      feedback.style.display = 'none';
  }
};

const renderFormUrl = (elms, url) => {
  const newElms = { ...elms };
  newElms.input.value = url;
};

const renderFeeds = (elms, feeds) => {
  const { feedsContainer } = elms;

  if (feeds.length === 0) {
    feedsContainer.innerHTML = '<p class="text-muted">Пока нет RSS</p>';
    return;
  }

  const feedsHTML = `
    <div class="list-group">
      ${feeds.map((feed) => `
        <div class="list-group-item">
          <h6 class="mb-1 text-truncate">${feed.title}</h6>
          <p class="mb-1 small text-muted text-truncate">${feed.description}</p>
          <small class="text-muted text-truncate d-block">${feed.link}</small>
        </div>
      `).join('')}
    </div>
  `;

  feedsContainer.innerHTML = feedsHTML;
};

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Заголовки постов теперь имеют ТОЛЬКО класс fw-bold/fw-normal
const renderPosts = (elms, posts, i18n, state) => {
  const { postsContainer } = elms;

  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="text-muted">Пока нет постов</p>';
    return;
  }

  const postsHTML = `
    <div class="list-group">
      ${posts.map((post) => {
    const isRead = state.ui.readPostIds.has(post.id);
    const titleClass = isRead ? 'fw-normal' : 'fw-bold';

    let shortDescription = '';
    if (post.description) {
      shortDescription = post.description.length > 80
        ? `${post.description.substring(0, 80)}...`
        : post.description;
    }

    return `
          <div class="list-group-item d-flex justify-content-between align-items-start">
            <div class="me-auto" style="min-width: 0; overflow: hidden;">
              <!-- ВАЖНО: У ссылки теперь ТОЛЬКО класс fw-bold/fw-normal -->
              <a href="${post.link}" 
                 class="${titleClass}" 
                 title="${post.title}"
                 target="_blank" 
                 rel="noopener noreferrer">
                <span class="d-block mb-1 text-truncate">${post.title}</span>
              </a>
              <small class="text-muted text-truncate d-block" title="${post.description || ''}">
                ${shortDescription}
              </small>
            </div>
            <div class="btn-group ms-2 flex-shrink-0" role="group">
              <a href="${post.link}" 
                 class="btn btn-outline-primary btn-sm d-flex align-items-center" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 title="Открыть в новой вкладке">
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <button type="button" 
                      class="btn btn-outline-secondary btn-sm" 
                      data-post-id="${post.id}"
                      title="${i18n.t('buttons.preview')}"
                      data-post-preview
                      style="min-width: 75px;">
                ${i18n.t('buttons.preview')}
              </button>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  postsContainer.innerHTML = postsHTML;

  // Навешиваем обработчики на кнопки предпросмотра
  const previewButtons = postsContainer.querySelectorAll('[data-post-preview]');
  previewButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = button.getAttribute('data-post-id');
      const post = posts.find((p) => p.id === postId);
      if (post && state.ui.openPostModal) {
        state.ui.openPostModal(post);
      }
    });
  });
};

const initView = (elements, initialState, i18n) => {
  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'form.error':
        renderFormError(elements, state.form.error);
        break;
      case 'form.status':
        renderFormStatus(elements, state.form.status, i18n);
        break;
      case 'form.url':
        renderFormUrl(elements, state.form.url);
        break;
      case 'feeds':
        renderFeeds(elements, state.feeds);
        break;
      case 'posts':
      case 'ui.readPostIds':
        renderPosts(elements, state.posts, i18n, state);
        break;
      case 'loading.processState':
        console.log('Loading state changed:', state.loading.processState);
        break;
      case 'ui.updateInProgress':
        console.log('Update in progress:', state.ui.updateInProgress);
        break;
      case 'ui.lastUpdate':
        console.log('Last update:', state.ui.lastUpdate);
        break;
      default:
        break;
    }
  });

  return state;
};

export default initView;
