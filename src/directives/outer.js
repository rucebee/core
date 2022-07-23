// Usage:
// 1. <div v-outer[.children][.click][.wheel]="callbackFunction" ... - callbackFunction(ev) is called on an outer event
// 2. <a v-outer[.children] ... - This element events are not outer

// Modifiers
// children - self event is outer
// click - only 'touchstart', 'mousedown' events
// wheel - only 'wheel' event

// Value
// The callbackFunction is called when defined and
// the event matches the directive events
//
// NOT "callbackFunction()"

const bindingEvents = {
  wheel: { wheel: handlerOuterAbs },
  click: {
    touchstart: ({ target }) => handleOuter({
      type: 'click',
      target
    }),
    mousedown: ({ target }) => handleOuter({
      type: 'click',
      target,
    }),
  },
  swipe: {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove,
  },
}

const outers = []

function handleOuter (ev) {
  let p = ev.target
  while (p) {
    for (const {
      el,
      binding
    } of outers) {
      if ((binding.modifiers.children ? p.parentElement : p) === el) {
        return
      }
    }

    p = p.parentElement
  }

  handlerOuterAbs(ev)
}

function handlerOuterAbs (ev) {
  //console.log('outer', ev.type)

  for (const {
    el,
    binding,
    events
  } of outers) {
    switch (typeof binding.value) {
      case 'function':
        if (events.includes(ev.type)) {
          binding.value(ev)
        }
        break

      case 'undefined':
        break

      default:
        console.warn('outer directive value is not a function', el)
    }
  }
}

let xDown = null
let yDown = null

function handleTouchStart (ev) {
  const firstTouch = ev.touches[0]
  xDown = firstTouch.clientX
  yDown = firstTouch.clientY
}

function handleTouchMove (ev) {
  if (!xDown || !yDown) {
    return
  }

  let xUp = ev.touches[0].clientX
  let yUp = ev.touches[0].clientY

  let xDiff = xDown - xUp
  let yDiff = yDown - yUp

  if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
    if (xDiff > 0) {
      /* right swipe */
      handlerOuterAbs({ type: 'swipe' })
    } else {
      /* left swipe */
      handlerOuterAbs({ type: 'swipe' })
    }
  } else {
    if (yDiff > 0) {
      /* down swipe */
      handlerOuterAbs({ type: 'swipe' })
    } else {
      /* up swipe */
      handlerOuterAbs({ type: 'swipe' })
    }
  }
  /* reset values */
  xDown = null
  yDown = null
}

export default {
  bind (el, binding) {
    const index = outers.findIndex((o) => o.el === el)
    if (index > -1) {
      outers.splice(index, 1)
    }

    const events = []
    for (const name in bindingEvents) {
      if (binding[name]) {
        events.push(name)
      }
    }

    if (!events.length) {
      events.push(...Object.keys(bindingEvents))
    }

    if (!outers.length) {
      for (const name in bindingEvents) {
        for (const type in bindingEvents[name]) {
          addEventListener(type, bindingEvents[name][type])
        }
      }
    }

    outers.push({
      el,
      binding,
      events,
    })
  },

  unbind (el) {
    const index = outers.findIndex((o) => o.el === el)
    if (index > -1) {
      outers.splice(index, 1)
    }

    if (!outers.length) {
      for (const name in bindingEvents) {
        for (const type in bindingEvents[name]) {
          removeEventListener(type, bindingEvents[name][type])
        }
      }
    }
  },
}
