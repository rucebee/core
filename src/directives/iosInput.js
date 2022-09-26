import isIOS from '../utils/isIOS'

let directive = {}

if (isIOS) {
  const inp = document.createElement('input')
  inp.style.position = 'absolute'
  inp.style.right = '100%'
  inp.style.height = '10px'
  inp.style.outline = 'none'
  inp.style.top = '0'
  document.body.append(inp)

  let currentEl, visualViewportHeight

  addEventListener('focus', (ev) => {
    setTimeout(() => {
      if (visualViewport.height < outerHeight) {
        visualViewportHeight = visualViewport.height
      }
    }, 100)
  }, true)

  function onFocus (ev) {
    if (visualViewport.height < outerHeight) {
      return
    }

    if (currentEl === ev.target) {
      currentEl = null
      return
    }

    const bottom = document.documentElement.offsetHeight - scrollY - outerHeight
    if (bottom < 0) {
      const h = visualViewportHeight || outerHeight / 2
      const b = document.documentElement.offsetHeight - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--keyboard-sab')) || 0)

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

    inp.focus()

    setTimeout(() => {
      const el = currentEl = ev.target

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

  directive = {
    bind (el, binding) {
      el.addEventListener('focus', onFocus)
    },

    unbind (el, binding) {
      el.removeEventListener('focus', onFocus)
    },
  }
}

export default directive

