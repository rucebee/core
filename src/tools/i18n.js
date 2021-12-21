import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import makeHash from 'shorthash2'
import toSource from 'tosource'

let _locales, _dir

const packs = {}
const origin = {}
const touched = {}

let origins
let todoTimer = 0

function i18nPack (locale) {
  try {
    let hash

    const texts = fs.readFileSync(path.resolve(_dir, locale + '.txt'), {
      encoding: 'utf8',
      flag: 'r',
    }).split(/\n{2,}/).reduce((acc, text) => {
      if (text[0] === '-') {
        text = text.substr(1).trim()
        hash = makeHash(text)

        origin[hash] = text

        if (!acc[hash]) {
          acc[hash] = text
        }
      } else if (hash && text[0] === '=') {
        acc[hash] = text.substr(1).trim()

        hash = undefined
      }

      return acc
    }, {})

    return texts
  } catch (err) {
  }

  return {}
}

function i18nToDo () {
  if (todoTimer) {
    clearTimeout(todoTimer)
    todoTimer = 0
  }

  fs.mkdirSync(path.resolve(_dir), { recursive: true })

  for (const locale of _locales) {
    const localeOrigin = origins[locale]

    fs.writeFileSync(path.resolve(_dir, locale + '.js'), 'module.exports = ' + toSource(Object.assign({}, origin, localeOrigin), undefined, false))

    const notFound = []

    for (const hash in touched) {
      if (!localeOrigin[hash]) {
        notFound.push(hash)
      }
    }

    notFound.sort((a, b) => touched[a].toLowerCase().localeCompare(touched[b].toLowerCase()))

    const inFile = path.resolve(_dir, locale + '.todo.txt')
    try {
      fs.writeFileSync(inFile, '', {
        encoding: 'utf8',
      })

      for (const hash of notFound) {
        fs.writeFileSync(inFile,
          '- ' + touched[hash] + '\n\n',
          {
            encoding: 'utf8',
            flag: 'a+',
          })
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function i18nPacks (dir, locales, locale) {
  _dir = dir
  _locales = locales

  if (!origins) {
    origins = locales.reduce((acc, locale) => {
      acc[locale] = i18nPack(locale)
      return acc
    }, {})

    for (const key in origins) {
      packs[key] = Object.assign({}, origin, origins[key])
    }
  }

  if (locale) {
    return packs[locale]
  }
}

function i18nId (text, isDev) {
  text = text.trim()
  const hash = makeHash(text)

  if(!isDev) {
    touched[hash] = text
    if (todoTimer) {
      clearTimeout(todoTimer)
    }
    todoTimer = setTimeout(i18nToDo, 5000)
  }

  return origin[hash] ? hash : undefined
}

export function i18nReplace (dir, locales, locale, isDev) {
  return {
    // regex: /\/\*\s*(?:.*?)\s*\*\/\s*((['"`])(?:(?=(\\?))\3.)*?\2)/g,
    regex: /\/\*\s*i18n\s*\*\/\s*((['"`])(?:(?=(\\?))\3.)*?\2)/g,
    replacement (match, p1, p2, p3, offset, string) {
      // console.log('xxx', JSON.stringify({ p1, p2 }))

      const pack = i18nPacks(dir, locales, locale)
      const id = i18nId(p1.slice(1, -1), isDev)
      if(!id) return match
      if(!isDev) return p2 + pack[id] + p2

      if(p2 === '`' && match.indexOf('${'))
        return '_x(\'`\' + _t(\'' + id + '\') + \'`\')'

      return '_t(\'' + id + '\')'
    },
  }
}

export function i18nHash (locale) {
  const fileBuffer = fs.readFileSync(path.resolve(_dir, locale + '.txt'))
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)

  return hashSum.digest('hex')
}
