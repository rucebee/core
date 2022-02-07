import Vue from 'vue'

export default {
  bind (el, binding, vnode) {
    el.style.position =  'fixed'
    el.style.left = '0'
    el.style.right = '0'
    el.style.zIndex = '1029'

    vnode.context.window_scroll = () => {
      el.style.top = -Math.max(0, el.previousElementSibling.getBoundingClientRect().bottom + el.getBoundingClientRect().height)+ 'px'
    }

    addEventListener('scroll', vnode.context.window_scroll)

    Vue.nextTick(vnode.context.window_scroll)
  },

  unbind (el, binding, vnode) {
    removeEventListener('scroll', vnode.context.window_scroll)
  },
}
