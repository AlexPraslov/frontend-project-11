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
    feedsContainer.innerHTML = `<p class="text-muted">${i18n.t('noFeeds')}</p>`;
    return;
  }

  const feedsHTML = `
    <h3>${i18n.t('feedsTitle')}</h3>
    <ul class="list-group">
      ${feeds.map((feed, index) => `
        <li class="list-group-item">
          ${index + 1}. ${feed}
        </li>
      `).join('')}
    </ul>
  `;

  feedsContainer.innerHTML = feedsHTML;
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
      default:
        break;
    }
  });

  return state;
};

export default initView;
