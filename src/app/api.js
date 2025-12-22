import axios from 'axios'

const ALL_ORIGINS_URL = 'https://allorigins.hexlet.app/get'

const fetchRSS = (url) => {
  const encodedUrl = encodeURIComponent(url)
  const proxyUrl = `${ALL_ORIGINS_URL}?url=${encodedUrl}&disableCache=true`

  return new Promise((resolve, reject) => {
    axios.get(proxyUrl, {
      timeout: 45000,
      responseType: 'json',
    })
      .then((response) => {
        if (response.status !== 200) {
          reject(new Error(`HTTP error! status: ${response.status}`))
          return
        }

        const { data } = response

        if (!data) {
          reject(new Error('Empty response from proxy'))
          return
        }

        if (data.contents === undefined && data.contents !== '') {
          reject(new Error('Invalid response format from proxy'))
          return
        }

        if (data.contents === '') {
          reject(new Error('RSS feed returned empty content. The feed might be blocked or unavailable.'))
          return
        }

        if (data.status && data.status.http_code !== 200) {
          reject(new Error(`Feed error: ${data.status.http_code} - ${data.status.content_type || 'Unknown error'}`))
          return
        }

        resolve(data.contents)
      })
      .catch((error) => {
        if (error.code === 'ECONNABORTED') {
          reject(new Error('Network timeout. The feed might be too slow or unavailable.'))
        }
        else if (error.response) {
          const { status, statusText } = error.response
          reject(new Error(`Server error: ${status} ${statusText}`))
        }
        else if (error.request) {
          reject(new Error('Network error. Please check your internet connection.'))
        }
        else {
          reject(new Error(`Request error: ${error.message}`))
        }
      })
  })
}

export default fetchRSS