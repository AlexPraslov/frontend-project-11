export default {
  translation: {
    // Интерфейс
    appTitle: 'RSS агрегатор',
    inputPlaceholder: 'Ссылка RSS',
    submitButton: 'Добавить',
    loadingButton: 'Добавление...',
    noFeeds: 'Пока нет RSS',
    feedsTitle: 'Фиды',

    // Посты
    postsTitle: 'Посты',
    noPosts: 'Пока нет постов',

    // Ошибки валидации - ВАЖНО: именно такие тексты ждут тесты!
    errors: {
      required: 'Не должно быть пустым',
      url: 'Ссылка должна быть валидным URL',
      duplicate: 'RSS уже существует',
      network: 'Ошибка сети',
      parsing: 'Ресурс не содержит валидный RSS',
      unknown: 'Неизвестная ошибка',
      timeout: 'Ошибка сети',
      empty: 'Ресурс не содержит валидный RSS',
    },

    // Успешные сообщения
    success: {
      rssAdded: 'RSS успешно загружен',
    },

    // Состояния загрузки
    loading: {
      network: 'Загрузка RSS...',
      parsing: 'Парсинг данных...',
    },

    // Кнопки
    buttons: {
      preview: 'Просмотр',
      open: 'Открыть',
    },
  },
}
