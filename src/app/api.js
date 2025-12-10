import axios from 'axios';

const ALL_ORIGINS_URL = 'https://allorigins.hexlet.app/get';

const fetchRSS = (url) => {
  const encodedUrl = encodeURIComponent(url);
  const proxyUrl = `${ALL_ORIGINS_URL}?url=${encodedUrl}&disableCache=true`;

  console.log('Fetching from proxy:', proxyUrl);

  return new Promise((resolve, reject) => {
    axios.get(proxyUrl, {
      timeout: 45000, // 45 секунд для медленных RSS
      responseType: 'json',
    })
      .then((response) => {
        console.log('Proxy response status:', response.status, 'data:', response.data);

        if (response.status !== 200) {
          reject(new Error(`HTTP error! status: ${response.status}`));
          return;
        }

        const { data } = response;

        // Проверяем разные форматы ответа
        if (!data) {
          reject(new Error('Empty response from proxy'));
          return;
        }

        // Проверяем наличие содержимого
        if (data.contents === undefined && data.contents !== '') {
          reject(new Error('Invalid response format from proxy'));
          return;
        }

        // Проверяем не пустой ли контент
        if (data.contents === '') {
          reject(new Error('RSS feed returned empty content. The feed might be blocked or unavailable.'));
          return;
        }

        // Проверяем статус
        if (data.status && data.status.http_code !== 200) {
          reject(new Error(`Feed error: ${data.status.http_code} - ${data.status.content_type || 'Unknown error'}`));
          return;
        }

        resolve(data.contents);
      })
      .catch((error) => {
        console.error('Axios error details:', error);
        if (error.code === 'ECONNABORTED') {
          reject(new Error('Network timeout. The feed might be too slow or unavailable.'));
        } else if (error.response) {
          const { status, statusText } = error.response;
          reject(new Error(`Server error: ${status} ${statusText}`));
        } else if (error.request) {
          reject(new Error('Network error. Please check your internet connection.'));
        } else {
          reject(new Error(`Request error: ${error.message}`));
        }
      });
  });
};

export default fetchRSS;
