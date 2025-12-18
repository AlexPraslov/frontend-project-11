const parseRSS = (xmlString) => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        reject(new Error('Invalid RSS format'))
        return
      }

      const channel = xmlDoc.querySelector('channel')
      if (!channel) {
        reject(new Error('No channel found in RSS'))
        return
      }

      // Парсим фид
      const feedTitle = channel.querySelector('title')?.textContent || 'No title'
      const feedDescription = channel.querySelector('description')?.textContent || 'No description'
      const feedLink = channel.querySelector('link')?.textContent || ''

      // Генерируем ID для фида
      const feedId = `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Парсим посты
      const items = xmlDoc.querySelectorAll('item')
      const posts = Array.from(items).map((item, index) => {
        const postTitle = item.querySelector('title')?.textContent || 'No title'
        const postLink = item.querySelector('link')?.textContent || ''
        const postDescription = item.querySelector('description')?.textContent || ''

        return {
          id: `post_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          feedId,
          title: postTitle,
          link: postLink,
          description: postDescription,
        }
      })

      const feed = {
        id: feedId,
        title: feedTitle,
        description: feedDescription,
        link: feedLink,
      }

      resolve({
        feed,
        posts,
      })
    } catch (error) {
      reject(new Error(`Parsing error: ${error.message}`))
    }
  })
}

export default parseRSS
