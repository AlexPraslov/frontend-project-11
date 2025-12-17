import fetchRSS from './api'
import parseRSS from './parser'

// Функция для обновления одного фида и получения новых постов
const updateFeed = (feed, existingPostIds) => {
  return new Promise(resolve => {
    console.log(`Updating feed: ${feed.title}`)

    fetchRSS(feed.url)
      .then(xmlData => {
        return parseRSS(xmlData)
      })
      .then(parsedData => {
        // Фильтруем только новые посты
        const newPosts = parsedData.posts.filter(post => {
          // Проверяем по link (уникальный идентификатор поста)
          const isNew = !existingPostIds.has(post.link) && post.link !== ''
          return isNew
        })

        console.log(`Found ${newPosts.length} new posts in ${feed.title}`)

        // Генерируем новые ID для новых постов
        const postsWithIds = newPosts.map(post => ({
          ...post,
          id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          feedId: feed.id,
        }))

        resolve({
          success: true,
          feedId: feed.id,
          newPosts: postsWithIds,
          error: null,
        })
      })
      .catch(error => {
        console.error(`Error updating feed ${feed.title}:`, error.message)
        resolve({
          success: false,
          feedId: feed.id,
          newPosts: [],
          error: error.message,
        })
      })
  })
}

// Функция для обновления всех фидов
const updateAllFeeds = (feeds, existingPostIds) => {
  return new Promise(resolve => {
    if (feeds.length === 0) {
      console.log('No feeds to update')
      resolve({ updated: false, newPosts: [], errors: [] })
      return
    }

    console.log(`Starting update for ${feeds.length} feeds`)

    // Создаем промисы для каждого фида
    const updatePromises = feeds.map(feed => updateFeed(feed, existingPostIds))

    // Используем allSettled чтобы не прерываться при ошибках
    Promise.allSettled(updatePromises)
      .then(results => {
        const allNewPosts = []
        const errors = []

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const {
              success, feedId, newPosts, error,
            } = result.value

            if (success && newPosts.length > 0) {
              allNewPosts.push(...newPosts)
              console.log(`Added ${newPosts.length} new posts from feed ${feedId}`)
            }

            if (error) {
              errors.push({ feedId, error })
            }
          }
          else {
            errors.push({ feedId: 'unknown', error: result.reason.message })
          }
        })

        console.log(`Update complete. New posts: ${allNewPosts.length}, Errors: ${errors.length}`)

        resolve({
          updated: allNewPosts.length > 0,
          newPosts: allNewPosts,
          errors,
        })
      })
      .catch(error => {
        console.error('Error in update cycle:', error)
        resolve({
          updated: false,
          newPosts: [],
          errors: [{ feedId: 'all', error: error.message }],
        })
      })
  })
}

// Рекурсивный цикл обновления
const startUpdateCycle = (getState, updateState, interval = 5000) => {
  let isRunning = true

  const update = () => {
    if (!isRunning) {
      console.log('Update cycle stopped')
      return
    }

    const state = getState()
    const { feeds } = state

    // Создаем Set из существующих ссылок постов для быстрой проверки
    const existingPostIds = new Set(state.posts.map(post => post.link))

    updateAllFeeds(feeds, existingPostIds)
      .then(result => {
        if (result.updated && result.newPosts.length > 0) {
          // Обновляем состояние с новыми постами
          updateState(prevState => ({
            ...prevState,
            posts: [...result.newPosts, ...prevState.posts], // Новые посты в начале
          }))
        }

        // Рекурсивный вызов через interval
        setTimeout(update, interval)
      })
      .catch(error => {
        console.error('Update cycle error:', error)
        // Даже при ошибке продолжаем цикл
        setTimeout(update, interval)
      })
  }

  // Запускаем первый раз
  console.log('Starting update cycle')
  setTimeout(update, interval)

  // Функция для остановки цикла
  const stop = () => {
    isRunning = false
    console.log('Stopping update cycle')
  }

  return { stop }
}

export { updateFeed, updateAllFeeds, startUpdateCycle }
