// Мягкие переносы для русского текста: вставляем символ U+00AD (&shy;) в местах
// допустимых переносов. В отличие от CSS `hyphens: auto` (требует словарь и работает
// не во всех браузерах), мягкий перенос рисует дефис «-» при переносе ВЕЗДЕ.
// Алгоритм Христова в модификации Дымченко–Варсанофьева.
const SHY = '­'
const X = '[йьъЙЬЪ]'
const G = '[аеёиоуыэюяАЕЁИОУЫЭЮЯ]'
const S = '[бвгджзклмнпрстфхцчшщБВГДЖЗКЛМНПРСТФХЦЧШЩ]'

const RULES = [
  new RegExp(`(${X})(${G}|${S})`, 'g'),
  new RegExp(`(${G})(${S}${G})`, 'g'),
  new RegExp(`(${S}${G})(${S}${G})`, 'g'),
  new RegExp(`(${G}${S})(${S}${G})`, 'g'),
  new RegExp(`(${G}${S})(${S}${S}${G})`, 'g'),
  new RegExp(`(${S}${G}${S})(${S}${G})`, 'g'),
]

export function hyphenate(text = '') {
  return String(text).replace(/[A-Za-zА-Яа-яЁё]{6,}/g, (word) => {
    let w = word
    for (const r of RULES) w = w.replace(r, `$1${SHY}$2`)
    return w
  })
}
