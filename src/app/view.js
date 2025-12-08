import onChange from 'on-change';

const initView = (elements, initialState) => {
  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'form.error':
        renderFormError(elements, state.form.error);
        break;
      case 'form.status':
        renderFormStatus(elements, state.form.status);
        break;
      case 'form.url':
        renderFormUrl(elements, state.form.url);
        break;
      case 'feeds':
        renderFeeds(elements, state.feeds);
        break;
      default:
        break;
    }
  });

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

  const renderFormStatus = (elements, status) => {
    const { button, input } = elements;
    
    switch (status) {
      case 'sending':
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Отправка...';
        input.readOnly = true;
        break;
        
      case 'success':
        button.disabled = false;
        button.textContent = 'Добавить';
        input.readOnly = false;
        input.value = '';
        input.focus();
        break;
        
      case 'error':
        button.disabled = false;
        button.textContent = 'Добавить';
        input.readOnly = false;
        break;
        
      default:
        button.disabled = false;
        button.textContent = 'Добавить';
        input.readOnly = false;
    }
  };

  const renderFormUrl = (elements, url) => {
    elements.input.value = url;
  };

  const renderFeeds = (elements, feeds) => {
    const { feedsContainer } = elements;
    
    if (feeds.length === 0) {
      feedsContainer.innerHTML = '<p class="text-muted">Пока нет добавленных RSS</p>';
      return;
    }
    
    const feedsHTML = `
      <h3>Добавленные RSS:</h3>
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

  return state;
};

export default initView;
