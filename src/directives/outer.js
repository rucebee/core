// Usage:
// <div v-outer[.children][.click][.wheel]="fn" ...
// children - self event is outer
// click - only 'touchstart', 'mousedown' events
// wheel - only 'wheel' event
// value - "fn" is a handler function, may be undefined, NOT "fn()"
// the latest directive defined value (matching events) is called

const bindingEvents = { wheel: null, click: ['touchstart', 'mousedown'] };
const allEvents = [];
for (const name in bindingEvents) allEvents.push(...(bindingEvents[name] || [name]));
const outers = [];

function isOuter(p) {
  for (const { el, binding } of outers) {
    if (binding.modifiers.children)
      for (const child of el.children) {
        if (p === child) return true;
      }
    else return p === el;
  }

  return false;
}

function outerHandler(ev) {
  let p = ev.target;
  while (p) {
    if (isOuter(p)) return;

    p = p.parentElement;
  }

  for (let i = outers.length - 1; i >= 0; i--) {
    const { el, binding, events } = outers[i];

    if (binding.value === undefined) continue;
    if (typeof binding.value !== 'function') {
      console.warn('outer directive value is not function', el);
      continue;
    }

    if (events.includes(ev.type)) {
      binding.value();
      return;
    }
  }
}

export default {
  bind(el, binding) {
    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    const events = [];
    if (binding.value) {
      for (const name in bindingEvents)
        if (binding[name]) events.push(...(bindingEvents[name] || [name]));
      if (!events.length) events.push(...allEvents);
    }

    if (!outers.length) for (const event of allEvents) addEventListener(event, outerHandler);

    outers.push({
      el,
      binding,
      events,
    });
  },

  unbind(el) {
    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    if (!outers.length) for (const event of allEvents) removeEventListener(event, outerHandler);
  },
};
