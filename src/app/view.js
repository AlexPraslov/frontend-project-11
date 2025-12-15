// eslint-disable-next-line import/no-unresolved
import onChange from 'on-change';

const renderFormError = (elements, error) => {
  const { input, feedback } = elements;

  if (error) {
    input.classList.add('is-invalid');
    feedback.textContent = error;
    feedback.style.display = 'block';
  } else {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    feedback.style.display = 'none';
  }
};

const renderFormStatus = (elements, status, i18n) => {
  const { button, input } = elements;

  switch (status) {
    case 'sending':
      button.disabled = true;
      button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${i18n.t('loadingButton')}`;
      input.readOnly = true;
      break;

    case 'success':
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
      input.value = '';
      input.focus();
      break;

    case 'error':
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
      break;

    default:
      button.disabled = false;
      button.textContent = i18n.t('submitButton');
      input.readOnly = false;
  }
};

const renderFormUrl = (elms, url) => {
  const newElms = { ...elms };
  newElms.input.value = url;
};

const renderFeeds = (elms, feeds, i18n) => {
  const { feedsContainer } = elms;

  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${i18n.t('feedsTitle')}</h5>
          <p class="card-text text-muted">${i18n.t('noFeeds')}</p>
        </div>
      </div>
    `;
    return;
  }

  const feedsHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${i18n.t('feedsTitle')}</h5>
        <div class="list-group">
          ${feeds.map((feed) => `
            <div class="list-group-item">
              <h6 class="mb-1">${feed.title}</h6>
              <p class="mb-1 small text-muted">${feed.description}</p>
              <small class="text-muted">${feed.link}</small>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  feedsContainer.innerHTML = feedsHTML;
};

const renderPosts = (elms, posts, i18n, state) => {
  const { postsContainer } = elms;

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="card mt-4">
        <div class="card-body">
          <h5 class="card-title">${i18n.t('postsTitle', 'Посты')}</h5>
          <p class="card-text text-muted">${i18n.t('noPosts', 'Пока нет постов')}</p>
        </div>
      </div>
    `;
    return;
  }

  const postsHTML = `
    <div class="card mt-4">
      <div class="card-body">
        <h5 class="card-title">${i18n.t('postsTitle', 'Посты')}</h5>
        <div class="list-group">
          ${posts.map((post) => {
    const isRead = state.ui.readPostIds.has(post.id);
    const titleClass = isRead ? 'fw-normal' : 'fw-bold';

    return `
              <div class="list-group-item d-flex justify-content-between align-items-start">
                <div class="me-auto">
                  <div class="${titleClass} mb-1">${post.title}</div>
                  <small class="text-muted">${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}</small>
                </div>
                <div class="btn-group" role="group">
                  <a href="${post.link}" 
                     class="btn btn-outline-primary btn-sm" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     title="Открыть в новой вкладке">
                    <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                  <button type="button" 
                          class="btn btn-outline-secondary btn-sm" 
                          data-post-id="${post.id}"
                          title="Предпросмотр"
                          data-post-preview>
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>
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
        renderFeeds(elements, state.feeds, i18n);
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
