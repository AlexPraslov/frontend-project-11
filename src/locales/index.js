import i18next from 'i18next'
import ru from './ru.js'

const initI18n = () => {
  return new Promise(resolve => {
    i18next.init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    }, () => {
      resolve(i18next)
    })
  })
}

export default initI18n
