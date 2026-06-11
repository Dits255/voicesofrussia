// Общие данные кабинета автора: ключи localStorage, демо-профиль и материалы

export const LS = { profile: 'golosa-profile-v2', content: 'golosa-mycontent' }

export const DEFAULT_PROFILE = {
  name: 'Автор платформы',
  handle: 'author.platform',
  cultureSlug: null,
  region: 'Россия',
  bio: 'Демонстрационный аккаунт платформы «Голоса России». Здесь будут ваши публикации, статистика и настройки профиля.',
  avatar: '',
  followers: 1240,
}

export const DEFAULT_CONTENT = [
  { id: 'm1', title: 'Как я храню якутский дома', subtitle: 'Язык в обычной городской семье', format: 'Лонгрид', cultureSlug: 'yakuty', topics: ['Язык', 'Идентичность'], status: 'published', views: 12300, likes: 840, cover: '' },
  { id: 'm2', title: 'Ысыах в большом городе', subtitle: 'Праздник солнца вдали от дома', format: 'Короткое', cultureSlug: 'yakuty', topics: ['Традиции'], status: 'moderation', views: 0, likes: 0, cover: '' },
  { id: 'm3', title: 'Строганина: рецепт от бабушки', subtitle: 'Как готовят на родине', format: 'Подборка', cultureSlug: 'yakuty', topics: ['Еда'], status: 'published', views: 5100, likes: 320, cover: '' },
]

export const fmtNum = (n) => {
  if (!n) return '0'
  if (n >= 1000) { const v = n / 1000; return `${v.toFixed(v < 10 ? 1 : 0).replace('.', ',')} тыс.` }
  return String(n)
}
