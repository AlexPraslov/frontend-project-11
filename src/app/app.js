import initView from './view'
import validateUrl from './validator'
import fetchRSS from './api'
import parseRSS from './parser'
import { startUpdateCycle } from './updater'

const initApp = (i18n) => {
  const elements = {
    form: document.querySelector('[data-rss-form]'),
    input: document.querySelector('[data-rss-input]'),
    feedback: document.querySelector('[data-rss-feedback]'),
    button: document.querySelector('[data-rss-submit]'),
    feedsContainer: document.querySelector('[data-rss-feeds]'),
    postsContainer: document.querySelector('[data-rss-posts]'),
    modal: document.querySelector('#post-modal'),
    modalTitle: document.querySelector('[data-modal-title]'),
    modalDescription: document.querySelector('[data-modal-description]'),
    modalLink: document.querySelector('[data-modal-link]'),
  }

  if (!elements.form || !elements.input) {
    console.error('Form or input not found!')
    return
  }

  let postModal = null
  if (elements.modal && window.bootstrap) {
    postModal = new window.bootstrap.Modal(elements.modal)
  }

  document.querySelector('h1').textContent = i18n.t('appTitle')
  elements.input.placeholder = i18n.t('inputPlaceholder')
  elements.button.textContent = i18n.t('submitButton')

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      error: null,
      status: 'idle',
      url: '',
    },
    loading: {
      processState: 'idle',
      error: null,
    },
    ui: {
      lastUpdate: null,
      updateInProgress: false,
      readPostIds: new Set(),
      modal: {
        isOpen: false,
        currentPost: null,
      },
    },
  }

  let updateCycleControl = null

  const state = initView(elements, initialState, i18n, null)

  const openPostModal = (post) => {
    if (!postModal || !elements.modalTitle || !elements.modalDescription || !elements.modalLink) {
      console.error('Modal elements not found')
      return
    }

    elements.modalTitle.textContent = post.title
    elements.modalDescription.innerHTML = post.description || 'Нет описания'
    elements.modalLink.href = post.link

    if (!state.ui.readPostIds.has(post.id)) {
      state.ui.readPostIds.add(post.id)
    }

    postModal.show()
    state.ui.modal.isOpen = true
    state.ui.modal.currentPost = post
  }

  state.ui.openPostModal = openPostModal

  const updateState = (updater) => {
    const newState = updater(state)
    Object.keys(newState).forEach((key) => {
      state[key] = newState[key]
    })
  }

  const getState = () => ({ ...state })

  const restartUpdateCycle = () => {
    if (updateCycleControl) {
      updateCycleControl.stop()
    }

    if (state.feeds.length > 0) {
      updateCycleControl = startUpdateCycle(getState, updateState, 5000)
    }
  }

  if (elements.modal) {
    elements.modal.addEventListener('hidden.bs.modal', () => {
      state.ui.modal.isOpen = false
      state.ui.modal.currentPost = null
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()

    const url = elements.input.value.trim()

    if (!url) {
      state.form.error = i18n.t('errors.required')
      state.form.status = 'error'
      return
    }

    state.form.url = url
    state.form.status = 'sending'
    state.form.error = null
    state.loading.processState = 'loading'
    state.loading.error = null
    state.ui.updateInProgress = true

    validateUrl(url, i18n, state.feeds.map(feed => feed.url))
      .then((validationResult) => {
        if (!validationResult.isValid) {
          state.form.error = validationResult.errors.url
          state.form.status = 'error'
          state.loading.processState = 'failed'
          state.ui.updateInProgress = false
          return
        }

        return fetchRSS(url)
          .then((xmlData) => {
            return parseRSS(xmlData)
          })
          .then((parsedData) => {
            const feedWithUrl = {
              ...parsedData.feed,
              url,
            }

            const postsWithFeedId = parsedData.posts.map(post => ({
              ...post,
              feedId: feedWithUrl.id,
            }))

            state.feeds.push(feedWithUrl)
            state.posts.push(...postsWithFeedId)
            state.form.status = 'success'
            state.form.error = null
            state.form.url = ''
            state.loading.processState = 'idle'
            state.ui.updateInProgress = false
            state.ui.lastUpdate = new Date().toISOString()

            restartUpdateCycle()
          })
          .catch((error) => {
            let errorMessage = i18n.t('errors.parsing')

            if (error.message.includes('timeout')) {
              errorMessage = i18n.t('errors.timeout')
            }
            else if (error.message.includes('empty content')) {
              errorMessage = i18n.t('errors.empty')
            }
            else if (error.message.includes('Network error')) {
              errorMessage = i18n.t('errors.network')
            }

            state.form.error = errorMessage
            state.form.status = 'error'
            state.loading.processState = 'failed'
            state.ui.updateInProgress = false
            state.loading.error = error.message
          })
      })
      .catch(() => {
        state.form.error = i18n.t('errors.unknown')
        state.form.status = 'error'
        state.loading.processState = 'failed'
        state.ui.updateInProgress = false
      })
  }

  elements.form.addEventListener('submit', handleFormSubmit)

  elements.input.addEventListener('input', () => {
    if (state.form.error) {
      state.form.error = null
    }
  })

  if (state.feeds.length > 0) {
    restartUpdateCycle()
  }

  return {
    state,
    stopUpdateCycle: () => {
      if (updateCycleControl) {
        updateCycleControl.stop()
      }
    },
  }
}

export default initApp
