import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import makeHash from 'shorthash2'
import toSource from 'tosource'

let _dir

const packs = {}
const touched = {}
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

  for (const locale in packs) {
    const pack = packs[locale]

    fs.writeFileSync(path.resolve(_dir, locale + '.js'), 'module.exports = ' + toSource(pack, undefined, false))

    const notFound = []

    for (const hash in touched) {
      if (!pack[hash]) {
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

function i18nId (pack, text, toDo) {
  text = text.trim()
  const hash = makeHash(text)

  if (toDo) {
    touched[hash] = text
    if (todoTimer) {
      clearTimeout(todoTimer)
    }
    todoTimer = setTimeout(i18nToDo, 5000)
  }

  return pack[hash] ? hash : undefined
}

export function i18nReplace (dir, locale, isDev) {
  _dir = dir

  if (!packs[locale]) {
    packs[locale] = i18nPack(locale)
  }

  return {
    // regex: /\/\*\s*(?:.*?)\s*\*\/\s*((['"`])(?:(?=(\\?))\3.)*?\2)/g,
    regex: /\/\*\s*i18n\s*\*\/\s*((['"`])(?:(?=(\\?))\3.)*?\2)/g,
    replacement (match, p1, p2, p3, offset, string) {
      // console.log('xxx', JSON.stringify({ p1, p2 }))

      const pack = packs[locale]
      const id = i18nId(pack, p1.slice(1, -1), !isDev)
      if (!id) {
        return match
      }
      //if (!isDev)
      return p2 + pack[id] + p2

      if (p2 === '`' && match.indexOf('${')) {
        return '_x(\'`\' + _t(\'' + id + '\') + \'`\')'
      }

      return '_t(\'' + id + '\')'
    },
  }
}

export function i18nHash (dir, locale) {
  const fileBuffer = fs.readFileSync(path.resolve(dir, locale + '.txt'))
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)

  return hashSum.digest('hex')
}

export async function i18nTable (dir) {
  _dir = dir

  const locales = (await import(dir + '/index.js')).default
  //console.log({locales: locales.map(item => item.id)})

  for (const { id } of locales) {
    console.log(i18nPack(id))
  }
}

i18nTable('/Users/ilya-mbp/Devel/chatliker-web/locales')
