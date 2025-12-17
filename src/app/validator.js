import * as yup from 'yup'

const createSchema = (existingFeeds, i18n) => yup.object().shape({
  url: yup.string()
    .trim()
    .required(i18n.t('errors.required'))
    .url(i18n.t('errors.url'))
    .notOneOf(existingFeeds, i18n.t('errors.duplicate')),
})

const validateUrl = (url, i18n, existingFeeds) => {
  const feeds = existingFeeds || []
  const schema = createSchema(feeds, i18n)

  return new Promise(resolve => {
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        resolve({
          isValid: true,
          errors: {},
        })
      })
      .catch(error => {
        const errors = {}

        if (error.inner && error.inner.length > 0) {
          error.inner.forEach(err => {
            errors[err.path] = err.message
          })
        }
        else {
          errors.url = error.message
        }

        resolve({
          isValid: false,
          errors,
        })
      })
  })
}

export default validateUrl
