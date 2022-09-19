const DELAY = 500

let scrollTime = 0
let wnd

const updateScrollTime = () => {
  if (wnd !== document.documentElement) {
    dispatchEvent(new Event('scroll'))
  }

  scrollTime = Date.now()
}

export default function scrollInit (selector) {
  const _wnd = selector && document.querySelector(selector) || document.documentElement
  if (wnd !== _wnd) {
    if (wnd) {
      wnd.removeEventListener('scroll', updateScrollTime)
    }

    wnd = _wnd

    if (wnd) {
      wnd.addEventListener('scroll', updateScrollTime)
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
