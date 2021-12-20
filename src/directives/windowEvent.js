export default {
  bind (el, binding) {
    for (const type of binding.value[0].split(' '))
      addEventListener(type, binding.value[1])
  },

  unbind (el, binding) {
    for (const type of binding.value[0].split(' '))
      removeEventListener(type, binding.value[1])
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
