addEventListener('focus', (ev) => {
  document.documentElement.classList.add('inp-focus')
  const removeFocus = () => {
    document.documentElement.classList.remove('inp-focus')
    ev.target.removeEventListener('blur', removeFocus)
  }
  ev.target.addEventListener('blur', removeFocus)
}, true)
