<template>
  <div v-layout="['resize scroll wheel mouseup touchend touchcancel', onLayout]" class="component-list">
    <component
        :is="itemRenderer(item)"
        v-for="(item, index) in listData"
        :key="item.id"
        :item="item"
        :position="index"
        :source="source"
    />
  </div>
</template>

<script>
import Vue from 'vue'

import noop from 'lodash/noop'
import findLast from 'lodash/findLast'
import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import { v4 as uuidv4 } from 'uuid'

import timeout from '../utils/timeout'
import windowEventDirective from '../directives/windowEvent'


document.documentElement.style.scrollBehavior = 'auto'

function doLayout (ev) {
  let position = 0
  let count = 0
  for (const el of this.$el.children) {
    const rect = el.getBoundingClientRect()

    if (rect.bottom < 0) {
      position++
      continue
    }
    if (rect.top > innerHeight) {
      break
    }

    count++
  }

  if (!count) {
    position = 0
  }

  this.position = position
  this.count = count

  // console.log({
  //   position,
  //   count,
  //   ev,
  //   src: this.source,
  // })

  if (this.source) {
    if (this.bottom) {
      const doc = document.documentElement
      const el = this.$el.children[this.$el.children.length - 1]

      // console.log({
      //   ev, bottomOverflow: this.bottomOverflow,
      // })

      if (!el) {
        this.bottomOverflow = 0
      } else if (!ev && this.bottomOverflow < 10) {
        this.bottomOverflow = 0
        window.scroll(0, el.offsetTop + el.offsetHeight - doc.clientHeight + (doc.offsetHeight - this.$el.offsetTop - this.$el.offsetHeight) - .9)
      } else {
        this.bottomOverflow = el.offsetTop + el.offsetHeight - window.scrollY - doc.clientHeight + (doc.offsetHeight - this.$el.offsetTop - this.$el.offsetHeight)

        // console.log({
        //   bottomOverflow: this.bottomOverflow,
        // })
      }
    }

    this.source.layout(position, count)
  }
}

export default {
  directives: {
    layout: windowEventDirective,
  },

  props: {
    list: Array,
    source: Object,
    bottom: Boolean,
  },

  data () {
    this.position = 0
    this.count = 0
    this.layoutTimer = 0
    this.bottomOverflow = 0

    return {
      listData: this.list,
    }
  },

  watch: {
    source (source, oldSource) {
      if (oldSource) {
        oldSource.detach(this)
      }
      if (source) {
        source.attach(this)
      }
    },

    list (list) {
      this.listData = list
    },

    listData: {
      handler () {
        this.$nextTick(this.onLayout)
      },
      deep: true,
    },
  },

  mounted () {
    if (this.source) {
      this.source.attach(this)
      this.$nextTick(this.onLayout)
    }
  },

  beforeDestroy () {
    if (this.source) {
      this.source.detach(this)
    }
  },

  methods: {
    positionSmooth (position) {
    },

    onLayout (ev) {
      if (this.layoutTimer) {
        clearTimeout(this.layoutTimer)
        this.layoutTimer = 0
      }

      if (!ev || ['mouseup', 'touchend', 'touchcancel'].indexOf(ev.type) > -1) {
        doLayout.apply(this, [ev])
      } else {
        this.layoutTimer = setTimeout(() => {
          if (!this._isDestroyed) {
            doLayout.apply(this, [ev])
          }
        }, 1000)
      }
    },

    itemRenderer (item) {
      const type = item.type || 'default'
      // console.log(this.$slots[type])
      // return

      if (!this.$slots[type]?.[0]) {
        return
      }

      if (this.$slots[type][0].componentOptions)
          // console.log(item, this.$slots[item.type][0].componentOptions.Ctor.options)
      {
        return this.$slots[type][0].componentOptions.Ctor.options
      }

      // console.log(item, this.$slots[item.type])
      return Vue.extend({
        render: () => {
          return this.$slots[type]
        },
      })
    },
  },
}

export function PeriodicRefresh (query, period) {
  let before = 0
  let nextTimeout = timeout(0)
  let attached = false

  const next = () => {
    const now = Date.now()

    if (before <= now) {
      this.query()
    } else if (period && !this.request) {
      nextTimeout.stop()

      nextTimeout = timeout(before - now + 1000)
      nextTimeout.then(() => {
        if (attached) {
          this.query()
        }
      }, noop)
    }
  }

  this.request = null

  this.attach = () => {
    if (!attached) {
      attached = true

      next()
    }
  }

  this.detach = () => {
    if (attached) {
      attached = false

      nextTimeout.stop()
    }
  }

  this.period = (_period) => {
    period = _period
    if (period) {
      before = Date.now() + period
      next()
    } else {
      nextTimeout.stop()
    }
  }

  this.query = (dirty, forced) => {
    if (this.request) {
      if (dirty) {
        before = 0
      }
    } else if (!attached && !forced) {
      before = 0
    } else {
      before = period ? Date.now() + period : Number.MAX_SAFE_INTEGER

      nextTimeout.stop(true)

      this.request = query().then(() => {
        this.request = null

        if (attached) {
          next()
        }
      }).catch((err) => {
        console.error(err)

        if (attached) {
          nextTimeout = timeout(5000, () => {
            this.request = null
          })
          nextTimeout.then(() => {
            if (attached) {
              this.query()
            }
          }, noop)
        } else {
          this.request = null

          before = 0
        }

        throw err
      })
    }
  }
}

export class DataSource {
  list = []
  vm = null
  position = 0
  count = 0
  refresh

  attach (vm) {
    this.vm = vm
    if (this.refresh) {
      this.refresh.attach()
    }
  }

  detach (vm) {
    if (this.vm === vm) {
      this.vm = null
    }
    if (this.refresh) {
      this.refresh.detach()
    }
  }

  layout (position, count) {
    this.position = position
    this.count = count
  }

  findItem (id) {
    return find(this.list, ['id', id])
  }

  findPosition (id) {
    return findIndex(this.list, ['id', id])
  }

  remove (positionOrItem, count = 1) {
    const position = typeof positionOrItem === 'number' ? positionOrItem : this.list.indexOf(positionOrItem)
    if (position > -1) {
      this.list.splice(position, count)
    }
  }

  updateAll () {
    for (const item of this.list) {
      const id = item.id
      delete item.id
      Vue.set(item, 'id', id)
    }
  }

  update (...args) {
    let i = 0

    const position = typeof args[0] === 'number' ? args[i++] : this.list.indexOf(args[i])
    const _item = args[i]
    if (position > -1 && _item !== this.list[position]) {
      Vue.set(this.list, position, _item)
    }

    for (const key in _item) {
      const val = _item[key]
      delete _item[key]
      Vue.set(_item, key, val)
    }

    return _item
  }

  findLast (fn) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      if (fn(this.list[i])) {
        return this.list[i]
      }
    }
  }
}

export const LOADING_ITEM = { type: 'loading' }
export const EMPTY_ITEM = { type: 'empty' }

export class ListSource extends DataSource {
  constructor (query, period) {
    super()
    const list = this.list

    this.refresh = new PeriodicRefresh(() =>
        query.call(this).then((_list) => {
          list.splice(0, list.length, ..._list)
        }), period)
  }
}

export class WaterfallSource extends DataSource {
  limit
  loadingItem

  loading
  maxBwd
  minFwd

  constructor (query, limit, loadingItem) {
    super()
    const list = this.list

    this.limit = limit
    this.maxBwd = limit << 1
    this.minFwd = limit >> 1

    this.loadingItem = loadingItem = loadingItem || Object.assign({}, LOADING_ITEM)
    this.loadingItem.id = uuidv4()
    this.loading = true
    list.push(loadingItem)

    this.refresh = new PeriodicRefresh(() => {
      const item = list.length > 1 ? list[list.length - 2] : undefined

      return query.call(this, item, limit).then((_list) => {
        if (item?.id !== (list.length > 1 ? list[list.length - 2]?.id : undefined)) {
          return
        }

        if (_list?.length) {
          list.splice(list.length - 1, 0, ..._list)

          if (!this.loading) {
            this.loading = true
            this.list.push(loadingItem)
          }
        } else if (this.loading) {
          this.loading = false
          this.list.splice(list.length - 1, 1)
        }
      })
    }, 0)
  }

  layout (position, count) {
    super.layout(position, count)

    if (this.loading && position + count - 1 + this.minFwd >= this.list.length) {
      this.refresh.query()
    }

    if (position > this.maxBwd) {
      this.list.splice(0, position - this.maxBwd)
    }
  }

  reset (position = -1) {
    const len = this.list.length - position - 1
    if (len > 0) {
      this.list.splice(position + 1, len)
    }

    this.loading = true
    this.list.push(this.loadingItem)

    this.refresh.query(true, true)
  }
}

export class HistorySource extends DataSource {
  limit
  minNext
  minHistory
  maxHistory
  firstIndex = 1

  loadingItem
  historyItem
  autoNext
  autoHistory

  constructor (queryNext, queryHistory, limit, period = 0, {loadingItem, historyItem, autoNext = true, autoHistory = true} = {}) {
    super()
    const list = this.list

    this.limit = limit
    this.minNext = limit >> 1
    this.minHistory = limit >> 1
    this.maxHistory = limit << 1

    this.loadingItem = loadingItem = loadingItem || Object.assign({}, LOADING_ITEM)
    this.loadingItem.id = uuidv4()

    this.historyItem = historyItem = historyItem || Object.assign({}, LOADING_ITEM)
    this.historyItem.id = uuidv4()

    this.autoNext = autoNext
    this.autoHistory = autoHistory

    list.push(loadingItem)

    this.refresh = new PeriodicRefresh(() => queryNext.call(this, list, limit).then((_list) => {
      // console.log('refresh', {list, _list})

      if (this.autoNext && this.firstIndex) {
        list.splice(0, 1, historyItem)
      }

      if (_list.length) {
        if (list.length <= this.firstIndex) {
          list.push(..._list)
        } else {
          list.push(..._list)

          if (!this.historyRefresh.request) {
            this.cutHistory()
          }
        }

        if (_list.length >= limit) {
          if (this.autoNext) {
            this.refresh.query(true)
          }
        } else {
          if (this.firstIndex) {
            this.firstIndex = 0
            list.splice(0, 1)
          }

          if (!this.autoNext) {
            this.autoNext = true

            this.refresh.period(period)
          }
        }
      } else if (list.length <= this.firstIndex && this.firstIndex) {
        this.firstIndex = 0
        list.splice(0, 1)
      } else if (!this.historyRefresh.request) {
        this.cutHistory()
      }
    }), this.autoNext ? period : 0)

    this.historyRefresh = new PeriodicRefresh(() => {
      if (!this.firstIndex || list.length <= this.firstIndex) {
        return Promise.resolve()
      }

      const item = list[this.firstIndex]

      return queryHistory.call(this, list[this.firstIndex], limit).then((_list) => {
        if (!_list ||
            !this.firstIndex ||
            list.length <= this.firstIndex ||
            item.id !== list[this.firstIndex].id ||
            this.cutHistory()) {
          return
        }

        if (_list.length) {
          list.splice(this.firstIndex, 0, ..._list)
        }

        if (_list.length < limit) {
          this.firstIndex = 0
          list.splice(0, 1)
        }
      })
    }, 0)
  }

  cutHistory () {
    if (this.position > this.maxHistory && this.position - this.limit < this.list.length - this.firstIndex) {
      this.list.splice(this.firstIndex, this.position - this.limit)

      if (!this.firstIndex) {
        this.firstIndex = 1
        this.list.unshift(this.historyItem)
      }

      // console.log('cutHistory', firstIndex, startPos - viewDistance, list[firstIndex])

      return true
    }
  }

  empty () {
    return this.list.length <= this.firstIndex
  }

  attach (vm) {
    super.attach(vm)
    this.historyRefresh.attach()
  }

  detach (vm) {
    super.detach(vm)
    this.historyRefresh.detach()
  }

  layout (position, count) {
    // console.log('layout', {position, count, firstIndex, list, autoHistory, autoNext})

    if (this.firstIndex && this.list.length > this.firstIndex) {
      if (this.autoHistory && position <= this.minHistory) {
        this.historyRefresh.query()
      }

      if (!this.autoNext && position + count - 1 + this.minNext >= this.list.length) {
        this.refresh.query()
      }
    }
  }
}

export const ProtoView = {
  props: {
    position: Number,
    item: Object,
    source: Object,
  },

  watch: {
    item (item) {
      if (item?.anim) {
        delete item.anim

        this.source.update(this.position, item)
      }
    },
  },

  methods: {
    click () {
      if (this.$listeners.itemClick) {
        this.$emit('itemClick', this.position, this.item)
      }
    },

    hasPromise (name) {
      return !!(name
              ? this.item.promise?.[name]
              : this.item.promise && Object.keys(this.item.promise).length
      )
    },
  },
}

</script>

<style lang="scss">
.component-list {
}
</style>
