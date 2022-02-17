export default function (fn, timeout = 10000) {
  let promise = null
  let sleep = null

  const run = async (...args) => {
    while (!await fn(...args)) await new Promise((resolve) => {
      const id = setTimeout(() => {
        sleep = null
        resolve()
      }, timeout)

      sleep = {
        id,
        resolve,
      }
    })

    promise = null
  }

  return (...args) => {
    if (!promise) promise = run(...args)
    else if (sleep) {
      clearTimeout(sleep.id)
      sleep.resolve()
      sleep = null
    }
  }
}
