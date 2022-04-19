let el

export default function () {
  if (!el) {
    el = document.createElement('div')
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.position = 'fixed'
    el.style.bottom = 0
    el.style.left = 0
    document.body.appendChild(el)
  }

  return el.getBoundingClientRect().bottom
}
