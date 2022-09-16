<template>
  <div v-layout="['resize scroll', onLayout]" class="component-list">
    <component
        v-for="(item, index) in listData"
        :is="itemRenderer(item)"
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
import findLastIndex from 'lodash/findLastIndex'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import { v4 as uuidv4 } from 'uuid'

import timeout from '../utils/timeout'
import windowEventDirective from '../directives/windowEvent'
import completeScroll from '../utils/completeScroll'

document.documentElement.style.scrollBehavior = 'auto'
export const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize)

export default {
  directives: {
    layout: windowEventDirective,
  },

  props: {
    list: Array,
    source: Object,
    bottom: Boolean,
    anchor: {
      type: Function,
      default: item => item && item.type !== 'loading',
    }
  },

  data () {
    const doc = document.documentElement

    this.position = -1
    this.count = 0
    this.key = null
    this.offset = 0
    this.layoutTimer = 0
    this.scrollBottom = doc.offsetHeight - visualViewport.height - scrollY

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
        //console.log('onLayout handler')

        //this.onLayout()
        this.$nextTick(this.onLayout)
      },
      deep: true,
    },
  },

  mounted () {
    if (this.source) {
      this.source.attach(this)
      //this.onLayout()
      this.$nextTick(this.onLayout)
    }
  },

  beforeDestroy () {
    if (this.source) {
      this.source.detach(this)
    }
  },

  methods: {
    positionSmooth (position, offset = 0, _align) {
      if (position > -1) {
        this.$nextTick(() => {
          const b0 = this.$el.children[position]?.getBoundingClientRect()
          if (!b0) {
            return
          }

          const b1 = document.body.getBoundingClientRect()
          const b2 = this.$el.getBoundingClientRect()

          const top = b2.top - b1.top
          const bottom = visualViewport.height - b1.bottom + b2.bottom

          let align = _align
          if (!align) {
            if (b0.top >= top && b0.bottom <= bottom) {
              return
            }

            align = Math.abs(b0.top - top) < Math.abs(b0.bottom - bottom) ? 'top' : 'bottom'
          }

          let to = 0
          if (align === 'top') {
            to = scrollY + b0.top - top - offset

            const fixedTop = window.$fixedTop?.()
            if (fixedTop && to > fixedTop) {
              if (_align === 'detect' && b0.top >= top - fixedTop) {
                return
              }
              to += fixedTop
            }
          } else {
            to = offset + scrollY + b0.bottom - bottom
          }

          // console.log('positionSmooth', {
          //   position,
          //   _align,
          //   align,
          //   top,
          //   bottom,
          //   offset,
          //   to,
          //   b0,
          //   b1,
          //   b2
          // })

          this.$nextTick(() => scrollTo({
            top: to,
            behavior: 'smooth',
          }))
        })
      }
    },

    layoutLater() {
      this.layoutTimer = setTimeout(() => {
        this.layoutTimer = 0

        if (!this._isDestroyed) {
          this.onLayout({})
        }
      }, 500)
    },

    onLayout (ev) {
      if (this.layoutTimer) {
        clearTimeout(this.layoutTimer)
        this.layoutTimer = 0
      }

      if (!ev || ev.type === 'resize') {
        if (completeScroll(0)) {
          this.layoutLater()

          return
        } else if (this.bottom && this.scrollBottom < oneRem) {

          // console.log('bottom', scrollY, '->', document.documentElement.offsetHeight - visualViewport.height - this.scrollBottom, {
          //   type: ev?.type,
          //   scrollBottom: this.scrollBottom,
          // })

          scrollTo(scrollX, document.documentElement.offsetHeight - visualViewport.height - this.scrollBottom)

          this.layoutLater()

          return
        } else if (this.key) {
          for (const child of this.$el.children) {
            if (child.__vue__.$vnode.key === this.key) {
              const { top } = child.getBoundingClientRect()
              if (this.offset !== top) {

                // console.log('restore', scrollY, '->', scrollY - this.offset + top, {
                //   text: child.__vue__.item?.text?.substr(0, 6),
                //   offset: top - this.offset,
                //   type: ev?.type,
                // })

                scrollTo(scrollX, scrollY - this.offset + top)

                this.layoutLater()

                return
              }

              break
            }
          }
        }
      }

      let position = 0
      let count = 0

      const viewportHeight = visualViewport.height

      for (const el of this.$el.children) {
        const rect = el.getBoundingClientRect()

        if (rect.bottom < 0) {
          position++
          continue
        }

        if (rect.top > viewportHeight) {
          break
        }

        count++
      }

      if (!count) {
        position = -1
      }

      const scrollBottom = document.documentElement.offsetHeight - viewportHeight - scrollY
      this.scrollBottom = Math.max(0, scrollBottom)

      let child

      if (position > -1) {
        for (let i = position; i < position + count; i++) {
          child = this.$el.children[i]
          if (!this.anchor(child.__vue__.item)) {
            child = null
            continue
          }

          this.key = child.__vue__.$vnode.key
          this.offset = child.getBoundingClientRect().top

          // console.log('save', {
          //   text: child.__vue__.item?.text?.substr(0, 6),
          //   offset: this.offset,
          //   type: ev?.type,
          //   scrollBottom,
          //   position,
          //   count,
          // })

          break
        }
      }

      if (!child) {
        this.key = null
        this.offset = 0
      }

      this.position = position
      this.count = count

      if (this.source) {
        this.source.layout(position, count)
      }
    },

    itemRenderer (item) {
      const type = item.type || 'default'
      // console.log(this.$slots[type])
      // return

      if (!this.$slots[type]?.[0]) {
        return
      }

      if (this.$slots[type][0].componentOptions) {
        // console.log(item, this.$slots[item.type][0].componentOptions.Ctor.options)
        return this.$slots[type][0].componentOptions.Ctor.options
      }

      // console.log(item, this.$slots[item.type])
      return Vue.extend({
        render: () => {
          return this.$slots[type]
        },
      })
    },
  }
  ,
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
    return find(this.list, typeof id === 'function' ? id : ['id', id])
  }

  findPosition (id) {
    return findIndex(this.list, typeof id === 'function' ? id : ['id', id])
  }

  findLastItem (id) {
    return findLast(this.list, typeof id === 'function' ? id : ['id', id])
  }

  findLastPosition (id) {
    return findLastIndex(this.list, typeof id === 'function' ? id : ['id', id])
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

    this.refresh = new PeriodicRefresh(async () => {
      const item = list.length > 1 ? list[list.length - 2] : undefined

      const _list = await query.call(this, item, limit)

      await completeScroll()

      if (item?.id !== (list.length > 1 ? list[list.length - 2]?.id : undefined)) {
        return
      }

      if (_list?.length) {
        list.splice(list.length - 1, 0, ..._list)
      }

      if (_list?.length < limit) {
        if (this.loading) {
          this.loading = false
          this.list.splice(list.length - 1, 1)
        }
      } else if (!this.loading) {
        this.loading = true
        this.list.push(loadingItem)
      }
    }, 0)
  }

  layout (position, count) {
    super.layout(position, count)

    if (this.loading && position + count - 1 + this.minFwd >= this.list.length) {
      this.refresh.query()
    }

    // if (position > this.maxBwd) {
    //   this.list.splice(0, position - this.maxBwd)
    // }
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

  constructor (queryNext, queryHistory, limit, period = 0, {
    loadingItem,
    historyItem,
    autoNext = true,
    autoHistory = true
  } = {}) {
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

    let initializing = true
    list.push(loadingItem)

    this.refresh = new PeriodicRefresh(async () => {
      const _list = await queryNext.call(this, list, limit)

      await completeScroll()

      // console.log('refresh', {list, _list})

      if (initializing) {
        list.splice(0, 1, historyItem)
      }

      if (_list.length) {
        list.push(..._list)

        if (list.length > this.firstIndex && !this.historyRefresh.request) {
          this.cutHistory()
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

      this.vm?.$emit('itemsChange', this, initializing)
      initializing = false
    }, this.autoNext ? period : 0)

    this.historyRefresh = new PeriodicRefresh(async () => {
      if (!this.firstIndex || list.length <= this.firstIndex) {
        return
      }

      const item = list[this.firstIndex]
      const _list = await queryHistory.call(this, list, limit)

      await completeScroll()

      if (!_list ||
          !this.firstIndex ||
          list.length <= this.firstIndex ||
          item.id !== list[this.firstIndex].id) {
        return
      }

      if (!this.cutHistory()) {
        if (_list.length) {
          list.splice(this.firstIndex, 0, ..._list)
        }

        if (_list.length < limit) {
          this.firstIndex = 0
          list.splice(0, 1)
        }
      }

      this.vm?.$emit('itemsChange', this, false)
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
    // console.log('layout', {position, count, firstIndex: this.firstIndex, list: this.list, autoHistory: this.autoHistory, autoNext: this.autoNext})

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
