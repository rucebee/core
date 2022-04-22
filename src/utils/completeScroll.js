let scrollTime = 0

if(typeof window !== 'undefined')
  window.addEventListener('scroll', () => {
    scrollTime = Date.now()
  })

export default function (touch) {
  if(touch === false) {
    scrollTime = Date.now()
    return
  }

  if (scrollTime + 500 > Date.now()) {
    return touch === false ? true : new Promise(resolve => {
      const fn = () => {
        if (scrollTime + 500 > Date.now()) {
          setTimeout(fn, 500)
        } else {
          resolve()
        }
      }

      setTimeout(fn, 500)
    })
  }
}
