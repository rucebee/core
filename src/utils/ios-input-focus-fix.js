const inp = document.createElement('input')
const inpStyle = inp.style

inpStyle.position = 'absolute'
inpStyle.right = '100%'
inpStyle.height = '10px'
inpStyle.outline = 'none'
inpStyle.top = '0'
document.body.append(inp)

let currentEl, focusTimeout, isFocusing
let freeHeight = +localStorage.getItem('free-height-' + outerWidth) || outerHeight / 2

const inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']

function onFocus (ev) {
  if (visualViewport.height < outerHeight) {
    return
  }

  if ((ev.target.tagName !== 'INPUT' || inputTypes.indexOf(ev.type) < 0) && ev.target.tagName !== 'TEXTAREA') {
    return
  }

  if (currentEl === ev.target) {
    return
  } else {
    if (currentEl) {
      currentEl.removeEventListener('blur', onBlur)
    }

    currentEl = ev.target
    currentEl.addEventListener('blur', onBlur)
    document.documentElement.classList.add('inp-focus')
    dispatchEvent(new Event('resize'))
  }

  if (Math.abs(document.documentElement.offsetHeight - outerHeight) < 1) {
    inpStyle.top = `${(outerHeight - freeHeight) / 2}px`
    inpStyle.bottom = ''
    inpStyle.height = `${freeHeight}px`
  } else {
    const bottom = document.documentElement.offsetHeight - Math.max(0, scrollY) - outerHeight
    if (bottom < 0) {
      inpStyle.top = `${document.documentElement.offsetHeight - freeHeight}px`
      inpStyle.bottom = ''
      inpStyle.height = `${freeHeight}px`
    } else if (bottom < 16) {
      inpStyle.top = ''
      inpStyle.bottom = bottom + 'px'
      inpStyle.height = `10px`
    } else {
      inpStyle.top = scrollY + 'px'
      inpStyle.bottom = ''
      inpStyle.height = '100vh'
    }
  }

  isFocusing = true
  inp.focus()
  isFocusing = false

  if (focusTimeout) {
    clearTimeout(focusTimeout)
  }
  focusTimeout = setTimeout(() => {
    focusTimeout = 0

    const el = ev.target

    el.style.position = 'fixed'
    const b0 = inp.getBoundingClientRect()
    const b1 = el.getBoundingClientRect()

    inpStyle.top = '0'
    inpStyle.height = '0'
    inpStyle.bottom = ''

    el.style.transform = `translateY(${b0.top - b1.top}px)`
    el.focus()
    el.style.position = ''
    el.style.transform = ''
  }, 100)
}

function onBlur (ev) {
  if (currentEl === ev.target && currentEl !== document.activeElement && !isFocusing) {
    currentEl.removeEventListener('blur', onBlur)
    currentEl = null

    if (focusTimeout) {
      clearTimeout(focusTimeout)
      focusTimeout = 0
    }

    document.documentElement.classList.remove('inp-focus')
    dispatchEvent(new Event('resize'))
  }
}

addEventListener('resize', (ev) => {
  freeHeight = +localStorage.getItem('free-height-' + outerWidth) || outerHeight / 2
}, false)

addEventListener('focus', (ev) => {
  setTimeout(() => {
    if (visualViewport.height < outerHeight) {
      freeHeight = visualViewport.height
      localStorage.setItem('free-height-' + outerWidth, freeHeight)
    }
  }, 100)

  if (ev.target === inp) {
    return
  }

  let p = ev.target
  while ((p = p.parentElement) && getComputedStyle(p).position !== 'fixed') {
  }

  if (p) {
    onFocus(ev)
  } else {
    document.documentElement.classList.add('inp-focus')
    const removeFocus = () => {
      document.documentElement.classList.remove('inp-focus')
      ev.target.removeEventListener('blur', removeFocus)
    }
    ev.target.addEventListener('blur', removeFocus)
  }
}, true)
