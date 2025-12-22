import fetchRSS from './api'
import parseRSS from './parser'

const updateFeed = (feed, existingPostIds) => {
  return new Promise((resolve) => {
    fetchRSS(feed.url)
      .then((xmlData) => {
        return parseRSS(xmlData)
      })
      .then((parsedData) => {
        const newPosts = parsedData.posts.filter((post) => {
          const isNew = !existingPostIds.has(post.link) && post.link !== ''
          return isNew
        })

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
      .catch((error) => {
        resolve({
          success: false,
          feedId: feed.id,
          newPosts: [],
          error: error.message,
        })
      })
  })
}

const updateAllFeeds = (feeds, existingPostIds) => {
  return new Promise((resolve) => {
    if (feeds.length === 0) {
      resolve({ updated: false, newPosts: [], errors: [] })
      return
    }

    const updatePromises = feeds.map(feed => updateFeed(feed, existingPostIds))

    Promise.allSettled(updatePromises)
      .then((results) => {
        const allNewPosts = []
        const errors = []

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const {
              success, feedId, newPosts, error,
            } = result.value

            if (success && newPosts.length > 0) {
              allNewPosts.push(...newPosts)
            }

            if (error) {
              errors.push({ feedId, error })
            }
          }
          else {
            errors.push({ feedId: 'unknown', error: result.reason.message })
          }
        })

        resolve({
          updated: allNewPosts.length > 0,
          newPosts: allNewPosts,
          errors,
        })
      })
      .catch((error) => {
        resolve({
          updated: false,
          newPosts: [],
          errors: [{ feedId: 'all', error: error.message }],
        })
      })
  })
}

const startUpdateCycle = (getState, updateState, interval = 5000) => {
  let isRunning = true

  const update = () => {
    if (!isRunning) {
      return
    }

    const state = getState()
    const { feeds } = state

    const existingPostIds = new Set(state.posts.map(post => post.link))

    updateAllFeeds(feeds, existingPostIds)
      .then((result) => {
        if (result.updated && result.newPosts.length > 0) {
          updateState(prevState => ({
            ...prevState,
            posts: [...result.newPosts, ...prevState.posts],
          }))
        }

        setTimeout(update, interval)
      })
      .catch((error) => {
        setTimeout(update, interval)
      })
  }

  setTimeout(update, interval)

  const stop = () => {
    isRunning = false
  }

  return { stop }
}

export { updateFeed, updateAllFeeds, startUpdateCycle }