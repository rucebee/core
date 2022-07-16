// Usage:
// <div v-outer[.children][.click][.wheel]="fn" ...
// children - self event is outer
// click - only 'touchstart', 'mousedown' events
// wheel - only 'wheel' event
// fn - handler function, NOT "fn()"

const bindingEvents = { wheel: null, click: ['touchstart', 'mousedown'] };
const allEvents = [];
for (const name in bindingEvents) allEvents.push(...(bindingEvents[name] || [name]));
const outers = [];

function isOuter(p) {
  for (const { el, binding } of outers) {
    if (binding.children) for (const child of el.children) if (p === child) return true;
    return p === el;
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
    const { el, bindings, events } = outers[i];

    if (bindings.value === undefined) continue;
    if (typeof bindings.value !== 'function') {
      console.warn('outer directive value is not function', el);
      continue;
    }

    if (events.includes(ev.type)) {
      bindings.value();
      return;
    }
  }
}

export default {
  bind(el, binding) {
    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    const events = [];
    if (bindingEvents.value) {
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
