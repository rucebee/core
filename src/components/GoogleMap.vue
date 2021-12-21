<template>
  <div class="google-map" />
</template>

<script>
import loadJs from '../utils/loadJs'

export default {
  props: ['center', 'zoom', 'options', 'gkey'],

  mounted () {
    loadJs('https://maps.googleapis.com/maps/api/js?libraries=geometry&key=' + this.gkey).then(() => {
      if (this._isDestroyed) return

      const { Map, Marker } = google.maps

      const map = new Map(this.$el, Object.assign({
        center: this.center,
        zoom: this.zoom || 17,
        scrollwheel: false,
        disableDefaultUI: true,
      }, this.options))

      // const styles = [{
      //   featureType: 'all',
      //   elementType: 'all',
      //   stylers: [{ saturation: -100 }, { gamma: 0.5 }],
      // }, {
      //   featureType: 'road',
      //   elementType: 'all',
      //   stylers: [{ color: '#e6e6e6' }],
      // }]
      // map.set('styles', this.styles)

      // const icon = {
      //   url: require('~/assets/images/img-marker.png'),
      //   // This marker is 20 pixels wide by 32 pixels high.
      //   size: new Size(51, 62),
      //   // The origin for this image is (0, 0).
      //   origin: new Point(0, 0),
      //   // The anchor for this image is the base of the flagpole at (0, 32).
      //   anchor: new Point(25, 62)
      // }
      // new Marker({ position: this.position, map, icon: this.icon })

      this.map = map
      addEventListener('resize', this.onResize)

      this.$emit('ready', map)
    })
  },

  beforeDestroy () {
    if (this.map) {
      this.map = null
      removeEventListener('resize', this.onResize)
    }
  },

  methods: {
    onResize () {
      if (this.map) {
        google.maps.event.trigger(this.map, 'resize')
        this.map.setCenter(this.map.getCenter())
      }
    },
  },
}
</script>

<style lang="scss">
.google-map {
  background: #e6e6e6;
}
</style>
