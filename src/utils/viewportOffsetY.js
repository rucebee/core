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
    }

    const offsetBottom = Math.max(0, innerHeight - visualViewport.height - Math.max(0, visualViewport.offsetTop))
    if (vpOffsetBottom !== offsetBottom) {
      vpOffsetBottom = offsetBottom
      doc.style.setProperty('--vp-offset-bottom', offsetBottom + 'px')
    }

    // console.log('vpDeltaY', {
    //   scrollY,
    //   offsetTop,
    //   offsetBottom,
    //   ev
    // })
  }

  visualViewport.addEventListener('resize', updateViewportVars)
  addEventListener('scroll', (ev) => {
    updateViewportVars(ev)
    setTimeout(updateViewportVars, 100)
  })

  updateViewportVars()
}
