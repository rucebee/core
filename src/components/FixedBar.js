import mergeWith from 'lodash/mergeWith'
import defaults from 'lodash/defaults'

import './fixed-bar.scss'
import clientHeight from '../utils/clientHeight'

function beforeCreate () {
  let placeholder, dock

  let el, shortEl
  let doc// = document.documentElement

  const onScroll = (ev) => {
    const scrollTop = scrollY
    const heightDelta = el.offsetHeight - shortEl.offsetHeight

    if (scrollTop > heightDelta) {
      el.classList.add('collapsed')
    } else {
      el.classList.remove('collapsed')
    }
  }

  const onResize = (ev) => {
    placeholder.style.height = el.offsetHeight + 'px'

    if (shortEl) {
      onScroll(ev)
    }
  }

  const mixin = {
    mounted () {
      doc = document.documentElement
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
      document.body.prepend(dock)

      el = this.$el
      el.after(placeholder)
      dock.append(el)

      if (el.classList.contains('collapse')) {
        shortEl = el.children[0]
        if (shortEl) {
          addEventListener('scroll', onScroll)
        }
      }

      addEventListener('resize', onResize)
      onResize()
    },

    updated () {
      onResize()
    },

    beforeDestroy () {
      // placeholder.before(el)

      placeholder.remove()
      dock.remove()

      removeEventListener('resize', onResize)
      removeEventListener('scroll', onScroll)
    },
  }

  mergeWith(this.$options, mixin, (objValue, srcValue) =>
    Array.isArray(objValue) ? objValue.concat([srcValue]) : (objValue ? undefined : [srcValue]))

  this.$options.methods = defaults({
    getHeight: () => el.offsetHeight,
    getShortHeight: () => shortEl.offsetHeight,
    getMargin: () => shortEl
      ? (
        (document.documentElement.offsetHeight - clientHeight()) > (el.offsetHeight - shortEl.offsetHeight)
          ? shortEl.offsetHeight
          : el.offsetHeight
      )
      : el.offsetHeight,
  }, this.$options.methods)

  this.$options.computed = defaults({}, this.$options.computed)
}

export default {
  props: {
    bottom: {
      type: Boolean,
    },
  },

  render (h) {
    const list = this.$slots.default?.slice() ?? []
    return h('div', list)
  },

  beforeCreate,
}
