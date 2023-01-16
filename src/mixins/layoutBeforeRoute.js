export default (layout) => ({
  beforeRouteEnter (to, from, next) {
    if(layout.beforeRouteEnter)
      layout.beforeRouteEnter(to, from, next)
    else next()
  },

  beforeRouteUpdate (to, from, next) {
    if(layout.beforeRouteUpdate)
      layout.beforeRouteUpdate.call(this.$parent, to, from, next)
    else next()
  },
})
