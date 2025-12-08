import initView from './view';
import validateUrl from './validator';

const initApp = () => {
  console.log('initApp called');

  const elements = {
    form: document.querySelector('[data-rss-form]'),
    input: document.querySelector('[data-rss-input]'),
    feedback: document.querySelector('[data-rss-feedback]'),
    button: document.querySelector('[data-rss-submit]'),
    feedsContainer: document.querySelector('[data-rss-feeds]'),
  };

  console.log('Elements found:', elements);

  if (!elements.form || !elements.input) {
    console.error('Form or input not found!');
    return;
  }

  const initialState = {
    feeds: [],
    form: {
      error: null,
      status: 'idle',
      url: '',
    },
  };

  const state = initView(elements, initialState);
  console.log('State initialized:', state);

  const handleFormSubmit = (e) => {
    console.log('Form submitted');
    e.preventDefault();

    const url = elements.input.value.trim();
    console.log('URL submitted:', url);

    if (!url) {
      state.form.error = 'Не должно быть пустым';
      state.form.status = 'error';
      return;
    }

    state.form.url = url;
    state.form.status = 'sending';
    state.form.error = null;

    console.log('Starting validation...');
    validateUrl(url, state.feeds)
      .then((validationResult) => {
        console.log('Validation result:', validationResult);
        if (validationResult.isValid) {
          console.log('URL is valid, adding to feeds');
          state.feeds.push(url);
          state.form.status = 'success';
          state.form.error = null;
          state.form.url = '';
        } else {
          console.log('URL is invalid:', validationResult.errors.url);
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
  console.log('Event listener attached');

  elements.input.addEventListener('input', () => {
    console.log('Input changed');
    if (state.form.error) {
      state.form.error = null;
    }
  });

  return state;
};

export default initApp;
