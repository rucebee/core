import isIOS from '../utils/isIOS'

let directive = {}

if (isIOS) {
  const inp = document.createElement('input')
  inp.style.position = 'absolute'
  inp.style.right = '100%'
  inp.style.height = '100vh'
  inp.style.outline = 'none'
  document.body.append(inp)

  let currentEl

  function onFocus (ev) {
    if (currentEl === ev.target) {
      currentEl = null
      return
    }

    inp.style.top = scrollY + 'px'
    inp.focus()

    setTimeout(() => {
      currentEl = ev.target
      currentEl.style.position = 'fixed'
      currentEl.focus()
      ev.target.style.position = ''
    }, 100)
  }

  directive = {
    bind (el, binding, vnode) {
      el.addEventListener('focus', onFocus)
    },

    unbind (el, binding, vnode) {
      el.removeEventListener('focus', onFocus)
    },
  }
}

export default directive

