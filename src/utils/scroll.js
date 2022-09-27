const DELAY = 500

let scrollTime = 0
let ignoreNext = false
let wnd

const updateDocumentScrollTime = () => {
  if (ignoreNext) {
    ignoreNext = false
  }
  scrollTime = Date.now()
}

const updateScrollTime = () => {
  if (ignoreNext) {
    ignoreNext = false
  }

  dispatchEvent(new Event('scroll'))

  scrollTime = Date.now()
}

export default function scrollInit (selector) {
  const _wnd = selector && document.querySelector(selector) || document.documentElement
  if (wnd !== _wnd) {
    if (wnd) {
      if (wnd !== document.documentElement) {
        wnd.removeEventListener('scroll', updateScrollTime)

        document.body.style.overflow = ''

        Object.assign(wnd.style, {
          position: '',
          top: '',
          width: '',
          height: '',
          overflow: '',
        })
      } else {
        wnd.removeEventListener('scroll', updateDocumentScrollTime)
      }
    }

    wnd = _wnd

    if (wnd) {
      if (wnd !== document.documentElement) {
        wnd.addEventListener('scroll', updateScrollTime)

        document.body.style.overflow = 'hidden'

        Object.assign(wnd.style, {
          position: 'fixed',
          // top: 'var(--vp-offset-top, 0)',
          // bottom: 'var(--vp-offset-bottom, 0)',
          top: '0',
          bottom: '0',
          width: '100%',
          overflow: 'auto',
        })
      } else {
        wnd.addEventListener('scroll', updateDocumentScrollTime)
      }
    }
  }
}

if (typeof document !== 'undefined') {
  scrollInit()
}

export function scrollComplete (delay = DELAY) {
  if (delay < 0) {
    scrollTime = Date.now()
    return
  }

  if (scrollTime + (delay || DELAY) > Date.now()) {
    return delay === 0 ? true : new Promise(resolve => {
      const fn = () => {
        if (scrollTime + delay > Date.now()) {
          setTimeout(fn, delay)
        } else {
          resolve()
        }
      }

      setTimeout(fn, delay)
    })
  }
}

export function scrollHeight () {
  return wnd.scrollHeight
}

export function scrollTop () {
  return wnd.scrollTop
}

export function scrollTo (options, ignore) {
  console.log('scrollTo', options, ignore)

  ignoreNext = !!ignore
  if (!ignoreNext) {
    scrollTime = Date.now()
  }

  if (options) {
    wnd !== document.documentElement
      ? wnd.scrollTo(options)
      : window.scrollTo(options)
  }
}

let ignoreTime = 0

export function scrollIgnore (delay) {
  if (!delay) {
    return ignoreTime > Date.now()
  }

  ignoreTime = Date.now() + delay
}
