import onChange from 'on-change'

const renderFormError = (elements, error) => {
  const { input, feedback } = elements

  if (error) {
    input.classList.add('is-invalid')
    feedback.textContent = error
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    feedback.style.display = 'block'
  }
  else {
    input.classList.remove('is-invalid')
    feedback.textContent = ''
    feedback.style.display = 'none'
  }
}

const renderFormStatus = (elements, status, i18n) => {
  const { button, input, feedback } = elements

  switch (status) {
    case 'sending':
      button.disabled = true
      button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${i18n.t('loadingButton')}`
      input.readOnly = true
      feedback.style.display = 'none'
      break

    case 'success':
      button.disabled = false
      button.textContent = i18n.t('submitButton')
      input.readOnly = false
      input.value = ''
      input.focus()

      feedback.textContent = i18n.t('success.rssAdded')
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.style.display = 'block'

      setTimeout(() => {
        if (feedback.style.display === 'block' && feedback.classList.contains('text-success')) {
          feedback.style.display = 'none'
          feedback.textContent = ''
        }
      }, 3000)
      break

    case 'error':
      button.disabled = false
      button.textContent = i18n.t('submitButton')
      input.readOnly = false
      feedback.classList.remove('text-success')
      feedback.classList.add('text-danger')
      break

    default:
      button.disabled = false
      button.textContent = i18n.t('submitButton')
      input.readOnly = false
      feedback.style.display = 'none'
  }
}

const renderFormUrl = (elms, url) => {
  const newElms = { ...elms }
  newElms.input.value = url
}

const renderFeeds = (elms, feeds) => {
  const { feedsContainer } = elms

  if (feeds.length === 0) {
    feedsContainer.innerHTML = '<p class="text-muted">Пока нет RSS</p>'
    return
  }

  const feedsHTML = `
  <div class="list-group">
    ${feeds.map(feed => `
      <div class="list-group-item">
        <h6 class="mb-1 text-truncate">${feed.title}</h6>
        <p class="mb-1 small text-muted text-truncate">${feed.description}</p>
        <small class="text-muted text-truncate d-block">${feed.link}</small>
      </div>
    `).join('')}
  </div>
  `

  feedsContainer.innerHTML = feedsHTML
}

const renderPosts = (elms, posts, i18n, state) => {
  const { postsContainer } = elms

  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="text-muted">Пока нет постов</p>'
    return
  }

  const postsHTML = `
  <div class="list-group">
    ${posts.map((post) => {
      const isRead = state.ui.readPostIds.has(post.id)
      const titleClass = isRead ? 'fw-normal' : 'fw-bold'

      let shortDescription = ''
      if (post.description) {
        shortDescription = post.description.length > 50
          ? `${post.description.substring(0, 50)}...`
          : post.description
      }

      return `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <a href="${post.link}"
               class="${titleClass}"
               title="${post.title}"
               target="_blank"
               rel="noopener noreferrer">
              ${post.title}
            </a>
            <button type="button"
                    class="btn btn-outline-secondary btn-sm text-nowrap flex-shrink-0"
                    data-post-id="${post.id}"
                    title="${i18n.t('buttons.preview')}"
                    data-post-preview>
              ${i18n.t('buttons.preview')}
            </button>
          </div>
          <div class="d-flex justify-content-between align-items-end">
            <small class="text-muted text-truncate flex-grow-1">
              ${shortDescription}
            </small>
            <div class="ms-2 flex-shrink-0">
              <a href="${post.link}"
                 class="btn btn-outline-primary btn-sm text-nowrap d-inline-flex align-items-center"
                 target="_blank"
                 rel="noopener noreferrer"
                 title="Открыть в новой вкладке">
                <i class="bi bi-box-arrow-up-right me-1"></i>Открыть
              </a>
            </div>
          </div>
        </div>
      `
    }).join('')}
  </div>
  `

  postsContainer.innerHTML = postsHTML

  const previewButtons = postsContainer.querySelectorAll('[data-post-preview]')
  previewButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const postId = button.getAttribute('data-post-id')
      const post = posts.find(p => p.id === postId)
      if (post && state.ui.openPostModal) {
        state.ui.openPostModal(post)
      }
    })
  })
}

const initView = (elements, initialState, i18n) => {
  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'form.error':
        renderFormError(elements, state.form.error)
        break
      case 'form.status':
        renderFormStatus(elements, state.form.status, i18n)
        break
      case 'form.url':
        renderFormUrl(elements, state.form.url)
        break
      case 'feeds':
        renderFeeds(elements, state.feeds)
        break
      case 'posts':
      case 'ui.readPostIds':
        renderPosts(elements, state.posts, i18n, state)
        break
      default:
        break
    }
  })

  return state
}

export default initView
