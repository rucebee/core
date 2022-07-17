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

const bindingEvents = { wheel: null, click: ['touchstart', 'mousedown'] };
const allEvents = [];
for (const name in bindingEvents) allEvents.push(...(bindingEvents[name] || [name]));
const outers = [];

function outerHandler(ev) {
  let p = ev.target;
  while (p) {
    for (const { el, binding } of outers)
      if ((binding.modifiers.children ? p.parentElement : p) === el) return;

    p = p.parentElement;
  }

  for (const { el, binding, events } of outers)
    switch (typeof binding.value) {
      case 'function':
        if (events.includes(ev.type)) binding.value(ev);
        break;

      case 'undefined':
        break;

      default:
        console.warn('outer directive value is not a function', el);
    }
}

export default {
  bind(el, binding) {
    const index = outers.findIndex((o) => o.el === el);
    if (index > -1) outers.splice(index, 1);

    const events = [];
    for (const name in bindingEvents)
      if (binding[name]) events.push(...(bindingEvents[name] || [name]));
    if (!events.length) events.push(...allEvents);

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
