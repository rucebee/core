export default (vnode, name, data) => {
  const handlers = (vnode.data && vnode.data.on) ||
    (vnode.componentOptions && vnode.componentOptions.listeners)

  if (handlers && handlers[name])
    handlers[name].fns(data)
}
