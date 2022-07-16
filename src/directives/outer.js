// Usage:
// <div v-outer[.children][.click][.wheel]="fn" ...
// children - self event is outer
// click - only 'touchstart', 'mousedown' events
// wheel - only 'wheel' event
// fn - handler function, NOT "fn()"

const bindingEvents = { wheel: null, click: ['touchstart', 'mousedown'] };
const allEvents = [];
for (const name in bindingEvents) allEvents.push(...(bindingEvents[name] || [name]));
let outers;

function outerHandler(ev) {
  // eslint-disable-next-line no-labels
  main: for (const { el, binding, events } of outers) {
    if (!events.includes(ev.type)) continue;

    const isEl = binding.modifiers.children
      ? (p) => {
          for (const child of el.children) if (p === child) return true;
          return false;
        }
      : (p) => p === el;

    let p = ev.target;
    while (p) {
      if (isEl(p)) {
        // eslint-disable-next-line no-labels
        continue main;
      }

      p = p.parentElement;
    }

    if (binding.value) binding.value(ev);
  }
}

export default {
  bind(el, binding, vnode) {
    if (!outers) {
      outers = [];

      for (const event of allEvents) addEventListener(event, outerHandler);
    }

    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    const events = [];
    for (const name in bindingEvents)
      if (binding[name]) events.push(...(bindingEvents[name] || [name]));
    if (!events.length) events.push(...allEvents);

    outers.push({
      el,
      binding,
      vnode,
      events,
    });
  },

  unbind(el) {
    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    if (!outers.length) {
      outers = null;

      for (const event of allEvents) removeEventListener(event, outerHandler);
    }
  },
};
