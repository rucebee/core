import noop from 'lodash/noop'
import isString from 'lodash/isString'

export default {
  data () {
    return {
      loading: false,
      loadingCount: 0,
    }
  },

  mounted () {
    this.$nextTick(() => {
      if (this.loading)
        this.$nuxt.$loading.start()
    })
  },

  methods: {
    routeQuery (query) {
      return { query: Object.assign({}, this.$route.query, query) }
    },

    routeWhich (...args) {
      let i = 0
      const _view = isString(args[0]) ? args[i++] : undefined
      const query = Array.isArray(args[i])
        ? this.$route.query
        : args[i++]
      const views = args[i]

      if (_view === undefined) {
        for (const view of views)
          if (query[view] !== undefined) return view
        return ''
      } else {
        const _query = Object.assign({}, query)
        for (i = 0; i < views.length; i++)
          views[i] === _view
            ? _query[views[i]] = null
            : delete _query[views[i]]
        return { query: _query }
      }
    },

    setLoading (loading) {
      if (loading) {
        this.loadingCount++
      } else if (loading !== false)
        this.loadingCount = 0
      else if (this.loadingCount > 0) {
        this.loadingCount--
      }

      if (this.$nuxt.$loading.start)
        if (this.loadingCount) {
          if (!this.loading)
            this.$nuxt.$loading.start()
        } else if (this.loading)
          this.$nuxt.$loading.finish()

      this.loading = !!this.loadingCount
    },

    back (home) {
      if (this.$nuxt.context.from.fullPath !== this.$route.fullPath)
        this.$router.back()
      else
        this.$router.replace(home || '/').catch(noop)
    },

    up () {
      scroll({top: 0})
    },
  },
}
