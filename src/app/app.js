import initView from './view.js';
import validateUrl from './validator.js';

const initApp = () => {
  const elements = {
    form: document.querySelector('[data-rss-form]'),
    input: document.querySelector('[data-rss-input]'),
    feedback: document.querySelector('[data-rss-feedback]'),
    button: document.querySelector('[data-rss-submit]'),
    feedsContainer: document.querySelector('[data-rss-feeds]'),
  };

  const initialState = {
    feeds: [],
    form: {
      error: null,
      status: 'idle',
      url: '',
    },
  };

  const state = initView(elements, initialState);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    
    state.form.url = url;
    state.form.status = 'sending';
    state.form.error = null;

    validateUrl(url, state.feeds)
      .then((validationResult) => {
        if (validationResult.isValid) {
          state.feeds.push(url);
          state.form.status = 'success';
          state.form.error = null;
          state.form.url = '';
        } else {
          state.form.error = validationResult.errors.url;
          state.form.status = 'error';
        }
      })
      .catch((error) => {
        console.error('Validation error:', error);
        state.form.error = 'Произошла ошибка при валидации';
        state.form.status = 'error';
      });
  };

  elements.form.addEventListener('submit', handleFormSubmit);
  
  elements.input.addEventListener('input', () => {
    if (state.form.error) {
      state.form.error = null;
    }
  });

  return state;
};

export default initApp;
