const inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']

addEventListener('focus', (ev) => {
  if ((ev.target.tagName !== 'INPUT' || inputTypes.indexOf(ev.target.type) < 0) && ev.target.tagName !== 'TEXTAREA') {
    return
  }
  document.documentElement.classList.add('inp-focus')
  const removeFocus = () => {
    document.documentElement.classList.remove('inp-focus')
    ev.target.removeEventListener('blur', removeFocus)
  }
  ev.target.addEventListener('blur', removeFocus)
}, true)
