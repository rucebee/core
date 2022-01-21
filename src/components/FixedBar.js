import mergeWith from 'lodash/mergeWith'
import defaults from 'lodash/defaults'
import animate from '../utils/animate'
import range from '../utils/range'
import timeout from '../utils/timeout'

function beforeCreate () {
  let placeholder, dock

  let el; let elStyle; let elHeight; let minHeight; let exHeight
  let shown; let shownStyle; let shownInnerStyle; let shownHeight = 0
  let hidden; let hiddenStyle; let hiddenHeight = 0

  let scrollTimeout

  let prevScrollTop = 0
  let currRatio = 1
  let targetRatio = 1
  let edgeRatio = 1
  let anim
  let before = false

  const scrolls = [0, 0, 0, 0]; let scrollUp = 2; let scrollDown = 2
  let scrollStart = false

  let collapsed

  const
    doc = document.documentElement
  const _scrollTop = () => scrollY
  const _scrollTo = top => scrollTo(scrollX, top)
  const scrollStartAlways = !this.$slots.default && !this.$slots.hidden

  const updateHeaderHeight = (ratio) => {
    currRatio = ratio

    const height = minHeight + currRatio * (shownHeight - hiddenHeight)
    const translateY = height - minHeight - shownHeight + hiddenHeight

    if (shownStyle) {
      shownStyle.opacity = ratio
      shownStyle.display = ratio > 0 ? '' : 'none'
    }
    if (before)
      if (ratio > 0) {
        elStyle.marginTop = translateY + 'px'
        elStyle.height = ''
      } else {
        elStyle.marginTop = ''
        elStyle.height = height + 'px'
      }
    else {
      elStyle.height = height + 'px'
      if (shownInnerStyle)
        shownInnerStyle.transform = 'translate(0, ' + translateY + 'px)'
    }

    el.className = el.className.replace(/\b\s*collapsed\b/g, '')
    if (ratio === 0)
      el.className += ' collapsed'

    if (hiddenStyle) hiddenStyle.display = ratio === 0 ? '' : 'none'

    if ((ratio === 0 || ratio === 1) && edgeRatio !== ratio) {
      edgeRatio = ratio

      this.$emit('collapse', this, ratio)
    }

    // console.log('collapse', ratio)
  }

  const onScrollFinish = () => {
    // console.log('onScrollFinish', {targetRatio})

    if (collapsed && targetRatio) {
      if (anim) anim.stop(true)
      updateHeaderHeight(targetRatio = 0)
    } else
    if (targetRatio < 1 && targetRatio > 0)
      if (scrollUp < scrollDown) {
        // console.log('scrollUp', {scrollUp, scrollDown, targetRatio})
        _scrollTo(shownHeight)

        if (anim) anim.stop(true)
        updateHeaderHeight(targetRatio = 0)
      } else {
        // console.log('scrollDown', {scrollUp, scrollDown, targetRatio})
        _scrollTo(0)

        if (anim) anim.stop(true)
        updateHeaderHeight(targetRatio = 1)
      }
    else {
      // console.log('scrollEnd', {scrollUp, scrollDown, targetRatio}, scrolls)

      scrollUp = 0
      scrollDown = 0
      scrolls.length = 0
    }
  }

  const onScroll = (ev) => {
    const scrollTop = _scrollTop()
    const scrollDelta = scrollTop - prevScrollTop

    if (!scrollDelta) return

    prevScrollTop = scrollTop

    if (scrollTimeout) scrollTimeout.stop(true)

    if (scrollDelta > 0) scrollDown++
    else if (scrollDelta < 0) scrollUp++

    scrolls.push(scrollDelta)
    if (scrolls.length > 10) {
      if (scrolls[0] > 0) scrollDown--
      else if (scrolls[0] < 0) scrollUp--

      scrolls.splice(0, 1)
    }

    if (scrolls.length > 3 || scrollTop < elHeight - minHeight) {
      let ratio = collapsed ? 0 : Math.min(1, (elHeight - minHeight - scrollTop) / (elHeight - minHeight))

      if (ratio >= 0) {
        if (scrollUp < scrollDown || targetRatio !== 1) {
          if (anim) anim.stop(true)
          updateHeaderHeight(targetRatio = ratio)

          // console.log('targetRatio ==', targetRatio, scrollTop)
        }
      } else {
        if ((scrollStart || scrollStartAlways) && scrollUp > scrollDown) ratio = 1
        else if (scrollUp < scrollDown) ratio = 0
        else ratio = targetRatio

        if (targetRatio !== ratio) {
          if (anim) anim.stop(true)

          anim = animate(range(currRatio, targetRatio = ratio, updateHeaderHeight),
            Math.abs(currRatio - targetRatio) * 500)

          // console.log('targetRatio ->', targetRatio, scrollTop)
        }
      }
    }

    scrollTimeout = timeout(300)
    scrollTimeout.then(onScrollFinish)
  }

  const onScrollStart = () => {
    scrollStart = true
    addEventListener('touchend', onScrollEnd)
  }

  const onScrollEnd = () => {
    scrollStart = false
    removeEventListener('touchend', onScrollEnd)
  }

  const onResize = () => {
    // console.log('FixedBar.onResize', {innerHeight})

    if (exHeight !== shownHeight + innerHeight) {
      exHeight = shownHeight - hiddenHeight + innerHeight
      doc.style.minHeight = exHeight + 'px'
    }
  }

  const onMouseOver = () => {
    if (!collapsed && !targetRatio) {
      if (anim) anim.stop(true)

      anim = animate(range(currRatio, targetRatio = 1, updateHeaderHeight),
        Math.abs(currRatio - targetRatio) * 500)
    }
  }

  const updated = () => {
    if (shown) {
      shownStyle.display = ''
      shownInnerStyle.transform = ''
      shownHeight = shown.offsetHeight

      if (hidden) {
        hiddenStyle.display = ''
        hiddenHeight = hidden.offsetHeight
      }
    }

    elStyle.height = ''
    elHeight = el.offsetHeight

    if (shown) {
      placeholder.style.height = collapsed
        ? elHeight - shownHeight + 'px'
        : elHeight - hiddenHeight + 'px'

      minHeight = elHeight - shownHeight

      updateHeaderHeight(currRatio)

      dispatchEvent(new Event('resize'))
    } else
      placeholder.style.height = elHeight - hiddenHeight + 'px'
  }

  const mixin = {
    mounted () {
      placeholder = document.createElement('div')

      dock = document.createElement('div')
      const dockStyle = dock.style
      dockStyle.position = 'fixed'
      dockStyle.zIndex = 1030
      dockStyle.left = 0
      dockStyle.right = 0
      this.bottom
        ? dockStyle.bottom = 0
        : dockStyle.top = 0
      before = this.before
      document.body.prepend(dock)

      el = this.$el
      elStyle = el.style

      // placeholder.className = el.className
      el.after(placeholder)
      dock.append(el)

      shown = this.$refs.shown
      if (shown) {
        shownStyle = shown.style
        shownInnerStyle = shown.children[0].style

        hidden = this.$refs.hidden
        if (hidden)
          hiddenStyle = hidden.style

        prevScrollTop = _scrollTop()
        addEventListener('scroll', onScroll)
        addEventListener('resize', onResize, true)

        el.addEventListener('touchstart', onScrollStart)
        el.addEventListener('mouseover', onMouseOver)
      }

      updated()

      onScroll()
    },

    updated,

    beforeDestroy () {
      // placeholder.before(el)

      placeholder.remove()
      dock.remove()

      if (shown) {
        doc.style.minHeight = ''

        removeEventListener('scroll', onScroll)
        removeEventListener('resize', onResize, true)

        el.removeEventListener('touchstart', onScrollStart)
        el.removeEventListener('mouseover', onMouseOver)
        removeEventListener('touchend', onScrollEnd)

        if (scrollTimeout) scrollTimeout.stop(true)
        if (anim) anim.stop(true)
      }
    },
  }

  mergeWith(this.$options, mixin, (objValue, srcValue) =>
    Array.isArray(objValue) ? objValue.concat([srcValue]) : (objValue ? undefined : [srcValue]))

  this.$options.methods = defaults({
    gap: () => targetRatio === 0 ? shownHeight : 0,
    height: () => targetRatio === 0 ? minHeight : elHeight,
    collapse: (value) => {
      if (value) {
        if (!collapsed) {
          collapsed = true

          if (anim) anim.stop(true)

          anim = animate(range(currRatio, targetRatio = 0, updateHeaderHeight),
            Math.abs(currRatio - targetRatio) * 500)

          updated()
        }
      } else
      if (collapsed) {
        collapsed = false

        if (anim) anim.stop(true)

        anim = animate(range(currRatio, targetRatio = 1, updateHeaderHeight),
          Math.abs(currRatio - targetRatio) * 500)

        updated()
      }
    },
  }, this.$options.methods)

  this.$options.computed = defaults({
    collapsed () {
      return collapsed
    },
  }, this.$options.computed)
}

export default {
  props: {
    bottom: {
      type: Boolean,
    },

    before: {
      type: Boolean,
    },
  },

  render (h) {
    const list = this.$slots.default?.slice() ?? []

    if (this.before) {
      if (this.$slots.hidden)
        list.unshift(h('div', {
          ref: 'hidden',
          attrs: { style: 'overflow:hidden;display:none;' },
        }, this.$slots.hidden))

      if (this.$slots.shown)
        list.unshift(h('div', {
          ref: 'shown',
          attrs: { style: 'overflow:hidden;' },
        }, [h('div', {}, this.$slots.shown)]))
    } else {
      if (this.$slots.shown)
        list.push(h('div', {
          ref: 'shown',
          attrs: { style: 'overflow:hidden;' },
        }, [h('div', {}, this.$slots.shown)]))

      if (this.$slots.hidden)
        list.push(h('div', {
          ref: 'hidden',
          attrs: { style: 'overflow:hidden;display:none;' },
        }, this.$slots.hidden))
    }

    return h('div', list)
  },

  beforeCreate,
}
