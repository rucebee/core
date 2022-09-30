const inp = document.createElement('input')
inp.style.position = 'absolute'
inp.style.right = '100%'
inp.style.height = '10px'
inp.style.outline = 'none'
inp.style.top = '0'
document.body.append(inp)

let currentEl, visualViewportHeight, focusTimeout, isFocusing

function onFocus (ev) {
  if (visualViewport.height < outerHeight) {
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

  const bottom = document.documentElement.offsetHeight - Math.max(0, scrollY) - outerHeight
  if (bottom < 0) {
    const h = visualViewportHeight || outerHeight / 2
    const b = document.documentElement.offsetHeight

    inp.style.top = `${b - h}px`
    inp.style.bottom = ''
    inp.style.height = `${h}px`
  } else if (bottom < 16) {
    inp.style.top = ''
    inp.style.bottom = bottom + 'px'
    inp.style.height = `10px`
  } else {
    inp.style.top = scrollY + 'px'
    inp.style.bottom = ''
    inp.style.height = '100vh'
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

    inp.style.top = '0'
    inp.style.height = '0'
    inp.style.bottom = ''

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

addEventListener('focus', (ev) => {
  setTimeout(() => {
    if (visualViewport.height < outerHeight) {
      visualViewportHeight = visualViewport.height
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
  }
}, true)
