import * as yup from 'yup';

const createSchema = (existingFeeds) => yup.object().shape({
  url: yup.string()
    .trim()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(existingFeeds, 'RSS уже существует'),
});

const validateUrl = (url, existingFeeds = []) => {
  const schema = createSchema(existingFeeds);

  return new Promise((resolve) => {
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        resolve({
          isValid: true,
          errors: {},
        });
      })
      .catch((error) => {
        const errors = {};

        if (error.inner && error.inner.length > 0) {
          error.inner.forEach((err) => {
            errors[err.path] = err.message;
          });
        } else {
          errors.url = error.message;
        }

        resolve({
          isValid: false,
          errors,
        });
      });
  });
};

export default validateUrl;
