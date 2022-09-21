export default {
  bind (el, binding) {
    for (const type of binding.value[0].split(' ')) {
      const t = type.split('.')
      t.length > 1
        ? window[t[0]].addEventListener(t[1], binding.value[1])
        : addEventListener(type, binding.value[1])
    }
  },

  unbind (el, binding) {
    for (const type of binding.value[0].split(' ')) {
      const t = type.split('.')
      t.length > 1
        ? window[t[0]].removeEventListener(t[1], binding.value[1])
        : removeEventListener(type, binding.value[1])
    }
  },
}

export const windowScroll = {
  bind (el, binding) {
    addEventListener('scroll', binding.value)
    addEventListener('wheel', binding.value)
  },

  unbind (el, binding) {
    removeEventListener('scroll', binding.value)
    removeEventListener('wheel', binding.value)
  },
}

export const windowResize = {
  bind (el, binding) {
    addEventListener('resize', binding.value)
  },

  unbind (el, binding) {
    removeEventListener('resize', binding.value)
  },
}

export const windowMousedowm = {
  bind (el, binding) {
    addEventListener('mousedown', binding.value)
  },

  unbind (el, binding) {
    removeEventListener('mousedown', binding.value)
  },
}
