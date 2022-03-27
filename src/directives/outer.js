import Vue from 'vue'

let outers

function outerHandler (ev) {
  // eslint-disable-next-line no-labels
  main:
    for (const {
      el,
      binding,
      vnode
    } of outers) {
      let p = ev.target
      while (p) {
        if (p === el)
          // eslint-disable-next-line no-labels
        {
          continue main
        }

        p = p.parentElement
      }

      if (binding.value) {
        setTimeout(() => {
          binding.value(ev)
        }, 100)
      }
    }
}

export default {
  bind (el, binding, vnode) {
    // console.log('outer bind', {
    //   el,
    //   binding,
    //   vnode,
    // })

    if (!outers) {
      outers = []

      addEventListener('wheel', outerHandler)
      addEventListener('touchstart', outerHandler)
      addEventListener('mousedown', outerHandler)
    }

    const index = outers.findIndex(o => o.el === el)
    if (index > -1) {
      outers.splice(index, 1)
    }

    outers.push({
      el,
      binding,
      vnode
    })
  },

  unbind (el, binding, vnode) {
    // console.log('outer unbind', {
    //   el,
    //   binding,
    //   vnode,
    // })

    const index = outers.findIndex(o => o.el === el)
    if (index > -1) {
      outers.splice(index, 1)
    }

    // removeEventListener('wheel', outerHandler)
    // removeEventListener('touchstart', outerHandler)
    // removeEventListener('mousedown', outerHandler)
  },
}
