import { scrollIgnore } from './scroll'

// iOS:
// document.documentElement.clientHeight and innerHeight doesn't reflect
// top/bottom toolbar and keyboards
if (visualViewport) {
  const doc = document.documentElement

  let vpOffsetTop, vpOffsetBottom

  function updateViewportVars (ev) {
    const offsetTop = Math.min(doc.clientHeight - visualViewport.height, Math.max(0, visualViewport.offsetTop))
    if (vpOffsetTop !== offsetTop) {
      vpOffsetTop = offsetTop
      doc.style.setProperty('--vp-offset-top', offsetTop + 'px')

      scrollIgnore(100)
      console.log('offsetTop', offsetTop)
    }

    const offsetBottom = Math.max(0, innerHeight - visualViewport.height - Math.max(0, visualViewport.offsetTop))
    if (vpOffsetBottom !== offsetBottom) {
      vpOffsetBottom = offsetBottom
      doc.style.setProperty('--vp-offset-bottom', offsetBottom + 'px')

      scrollIgnore(100)
      console.log('offsetBottom', offsetBottom)

      if (!offsetTop) {
        setTimeout(() => {
          dispatchEvent(new Event('resize'))
        }, 1000)
      }
    }

    doc.classList[offsetTop + offsetBottom > 0 ? 'add' : 'remove']('has-vp-offset')

    // console.log('vpDeltaY', {
    //   scrollY,
    //   offsetTop,
    //   offsetBottom,
    //   ev
    // })
  }

  // visualViewport.addEventListener('resize', updateViewportVars)
  // addEventListener('scroll', (ev) => {
  //   updateViewportVars(ev)
  //   setTimeout(updateViewportVars, 100)
  // })
  //
  // updateViewportVars()

  let _vpOffsetTop, _vpOffsetBottom

  function upd () {
    const offsetTop = Math.min(doc.clientHeight - visualViewport.height, Math.max(0, visualViewport.offsetTop))
    const offsetBottom = Math.max(0, innerHeight - visualViewport.height - Math.max(0, visualViewport.offsetTop))

    if (_vpOffsetTop !== offsetTop || _vpOffsetBottom !== offsetBottom) {
      console.log({
        offsetTop,
        offsetBottom,
        _vpOffsetTop,
        _vpOffsetBottom
      })

      _vpOffsetTop = offsetTop
      _vpOffsetBottom = offsetBottom

      doc.style.setProperty('--vp-offset-top', offsetTop + 'px')
      doc.style.setProperty('--vp-offset-bottom', offsetBottom + 'px')
      doc.style.setProperty('--vp-height', visualViewport.height + 'px')

      doc.classList[offsetTop + offsetBottom > 0 ? 'add' : 'remove']('has-vp-offset')

      scrollIgnore(100)

      dispatchEvent(new Event('viewport1'))

      setTimeout(() => {
        dispatchEvent(new Event('viewport'))
      }, 100)
    }

    requestAnimationFrame(upd)
  }

  upd()
}
