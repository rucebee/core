// iOS:
// document.documentElement.clientHeight and innerHeight doesn't reflect
// top/bottom toolbar and keyboards
if (visualViewport) {
  const doc = document.documentElement

  let vpOffsetTop, vpOffsetBottom

  function upd () {
    //const offsetTop = Math.min(doc.clientHeight - visualViewport.height, Math.max(0, visualViewport.offsetTop))
    //const offsetTop = Math.min(innerHeight - visualViewport.height, Math.max(0, visualViewport.offsetTop))
    const offsetTop = Math.max(0, visualViewport.offsetTop) - Math.max(0, Math.round(scrollY) - doc.scrollHeight + innerHeight)
    const offsetBottom = Math.max(0, outerHeight - visualViewport.height - offsetTop)

    if (vpOffsetTop !== offsetTop || vpOffsetBottom !== offsetBottom) {
      // console.log({
      //   offsetTop,
      //   offsetBottom,
      //   vpOffsetTop,
      //   vpOffsetBottom
      // })

      vpOffsetTop = offsetTop
      vpOffsetBottom = offsetBottom

      doc.style.setProperty('--vp-offset-top', offsetTop + 'px')
      doc.style.setProperty('--vp-offset-bottom', offsetBottom + 'px')
      doc.style.setProperty('--vp-height', visualViewport.height + 'px')

      doc.classList[offsetTop + offsetBottom > 1 ? 'add' : 'remove']('has-vp-offset')

      dispatchEvent(new Event('viewport'))
    }

    requestAnimationFrame(upd)
  }

  // visualViewport.addEventListener('resize', upd)
  // addEventListener('scroll', (ev) => {
  //   updateViewportVars(ev)
  //   setTimeout(upd, 100)
  // })

  upd()
}
