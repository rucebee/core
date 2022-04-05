import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import makeHash from 'shorthash2'
import toSource from 'tosource'
import readline from 'readline'

let _dir

const packs = {}
const origin = {}
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
          '- ' + touched[hash] + '\n\n', {
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
    packs[id] = i18nPack(id)
  }

  fs.mkdirSync(path.resolve(_dir), { recursive: true })

  let text = 'origin'
  for (const { id } of locales) {
    text += '\t' + id
  }

  text += '\n'

  for (const key in origin) {
    text += origin[key]?.replace(/[\t\n]+/g, ' ')

    for (const { id } of locales) {
      text += '\t' + (packs[id]?.[key]?.replace(/[\t\n]+/g, ' ') || '')
    }

    text += '\n'
  }

  //console.log(text)

  fs.writeFileSync(path.resolve(_dir, 'index.tsv'), text)
}

export async function i18nUntable (dir) {
  _dir = dir

  const rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(_dir, 'index.tsv')),
    crlfDelay: Infinity
  })

  const packs = {}

  let locales
  for await (const line of rl) {
    if (!locales) {
      locales = line.split('\t').slice(1)

      for (const locale of locales) {
        packs[locale] = ''
      }

      continue
    }

    const texts = line.split('\t')
    for (let i = 1; i < texts.length; i++) {
      if (texts[i]) {
        const locale = locales[i - 1]
        if (!locale) {
          break
        }
        packs[locale] += '- ' + texts[0] + '\n\n= ' + texts[i].replaceAll(/(?<!\\)'/g, '\\\'') + '\n\n'
      }
    }
  }

  for (const key in packs) {
    if (packs[key]) {
      fs.writeFileSync(path.resolve(_dir, key + '.txt'), packs[key])
    }
  }
}

const exec = {
  i18nUntable
}

if(exec[process.argv[2]]) {
  exec[process.argv[2]].apply(null, process.argv.slice(3))

  console.log(process.argv[2], process.argv.slice(3), 'complete')
}
