export default {
  translation: {
    // Интерфейс
    appTitle: 'RSS агрегатор',
    inputPlaceholder: 'Введите RSS-ссылку',
    submitButton: 'Добавить',
    loadingButton: 'Отправка...',
    noFeeds: 'Пока нет добавленных RSS',
    feedsTitle: 'Добавленные RSS',

    // Посты
    postsTitle: 'Посты',
    noPosts: 'Пока нет постов',

    // Ошибки валидации
    errors: {
      required: 'Не должно быть пустым',
      url: 'Ссылка должна быть валидным URL',
      duplicate: 'RSS уже существует',
      network: 'Ошибка сети',
      parsing: 'Ошибка парсинга RSS',
      unknown: 'Неизвестная ошибка',
    },

    // Успешные сообщения
    success: {
      rssAdded: 'RSS успешно добавлен',
    },

    // Состояния загрузки
    loading: {
      network: 'Загрузка RSS...',
      parsing: 'Парсинг данных...',
    },
  },
};
