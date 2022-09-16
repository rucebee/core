let scrollTime = 0

if(typeof window !== 'undefined')
  window.addEventListener('scroll', () => {
    scrollTime = Date.now()
  })

const DELAY = 500

export default function (delay = DELAY) {
  if(delay < 0) {
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
