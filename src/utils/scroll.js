const DELAY = 500

let scrollTime = 0
let wnd

const updateDocumentScrollTime = () => {
  scrollTime = Date.now()
}

const updateScrollTime = () => {
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
          top: 'var(--vp-offset-top, 0)',
          width: '100%',
          height: '100%',
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

export function scrollTo (options) {
  scrollTime = Date.now()

  return wnd.scrollTo(options)
}
