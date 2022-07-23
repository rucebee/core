import mergeWith from 'lodash/mergeWith'
import defaults from 'lodash/defaults'

import './fixed-bar.scss'
import '../utils/viewportDeltaY'

let wrapper

function beforeCreate () {
  let placeholder, dock

  let el, shortEl

  const fixedTop = () => shortEl && !el.classList.contains('lock')
    ? el.offsetHeight - shortEl.offsetHeight
    : 0

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
      if (!wrapper) {
        wrapper = document.createElement('div')
        wrapper.style.zIndex = 1030
        wrapper.style.position = 'relative'
        document.body.prepend(wrapper)
      }

      placeholder = document.createElement('div')

      dock = document.createElement('div')
      dock.className = this.bottom ? 'fixed-bar-bottom'  : 'fixed-bar-top'
      wrapper.append(dock)

      el = this.$el
      el.after(placeholder)
      dock.append(el)

      if (el.classList.contains('collapse')) {
        shortEl = el.children[0]
        if (shortEl) {
          addEventListener('scroll', onScroll)
          if(!this.bottom) window.$fixedTop = fixedTop
        }
      }

      addEventListener('resize', onResize)
      onResize()
    },

    updated () {
      onResize()
    },

    beforeDestroy () {
      if(window.$fixedTop === fixedTop)
        delete window.$fixedTop

      placeholder.remove()
      dock.remove()

      removeEventListener('resize', onResize)
      removeEventListener('scroll', onScroll)
    },
  }

  mergeWith(this.$options, mixin, (objValue, srcValue) =>
    Array.isArray(objValue) ? objValue.concat([srcValue]) : (objValue ? undefined : [srcValue]))

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
