import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import initI18n from './locales/index'
import initApp from './app/app'

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')

  initI18n()
    .then((i18n) => {
      console.log('i18n initialized')
      try {
        initApp(i18n)
        console.log('App initialized')
      }
      catch (error) {
        console.error('Error initializing app:', error)
      }
    })
    .catch((error) => {
      console.error('Failed to initialize i18n:', error)
    })
})
