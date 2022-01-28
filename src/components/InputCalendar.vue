<template>
  <div
    class="input-calendar"
    :class="{ 'is-valid': valid === true, 'is-invalid': valid === false}"
  >
    <select
      v-model="year"
      class="form-select"
      :disabled="disabled"
      :class="{ 'is-valid': valid === true, 'is-invalid': valid === false, active: year !== null}"
    >
      <option :value="null" disabled>
        {{ i18n.year }}
      </option>
      <option v-for="year in years" :key="year" :value="year">
        {{ year }}
      </option>
    </select>

    <select
      v-if="year !== null"
      v-model="month"
      class="form-select"
      :disabled="disabled"
      :class="{ 'is-valid': valid === true, 'is-invalid': valid === false, active: month !== null}"
    >
      <option :value="null" disabled>
        {{ i18n.month }}
      </option>
      <option v-for="month in months" :key="month.value" :value="month.value">
        {{ month.text }}
      </option>
    </select>

    <select
      v-if="month !== null"
      v-model="day"
      class="form-select"
      :disabled="disabled"
      :class="{ 'is-valid': valid === true, 'is-invalid': valid === false, active: day !== null}"
    >
      <option :value="null" disabled>
        {{ i18n.day }}
      </option>
      <option v-for="day in days" :key="day" :value="day">
        {{ day }}
      </option>
    </select>
  </div>
</template>

<script>

function checkDay () {
  if (this.month !== null && this.month >= this.months.length) {
    this.month = null
    this.day = null
  } else if (this.day !== null && this.day >= this.days.length + 1)
    this.day = null

  if (this.day === null)
    this.$emit('input', null)
  else {
    const date = new Date(this.year, this.month, this.day)
    // console.log(date, this.toDate)
    this.$emit('input', this.toDate && date > this.toDate ? null : date)
  }
}

export default {
  props: {
    value: Date,
    valid: Boolean,
    disabled: Boolean,
    locale: {
      type: String,
      default: 'default',
    },
    toDate: Date,
    i18n: {
      type: Object,
      default: Object.freeze({
        year: 'Select year…',
        month: 'Select month…',
        day: 'Select day…',
      }),
    },
  },

  data () {
    return {
      year: this.value?.getFullYear() ?? null,
      month: this.value?.getMonth() ?? null,
      day: this.value?.getDate() ?? null,
    }
  },

  computed: {
    years () {
      const years = []
      const year = (this.toDate || new Date()).getFullYear()
      for (let i = 0; i < 100; i++)
        years.push(year - i)
      return years
    },

    months () {
      const months = []
      if(!this.year) return months

      for (let i = 0; i < 12; i++) {
        const date = new Date(this.year, i, 1)
        if (!this.toDate || date <= this.toDate) months.push({
          text: date.toLocaleString(this.locale, { month: 'long' }),
          value: i,
        })
      }

      return months
    },

    days () {
      const days = []
      if (this.year != null && this.month != null) {
        const maxDate = new Date(this.year, this.month + 1, 0)
        const maxDay = maxDate.getDate()

        if (this.toDate && maxDate > this.toDate) for (let i = 1; i <= maxDay; i++) {
          maxDate.setDate(i)
          if (maxDate > this.toDate) break

          days.push(i)
        } else for (let i = 1; i <= maxDay; i++)
          days.push(i)
      }

      return days
    },
  },

  watch: {
    year: checkDay,
    month: checkDay,
    day: checkDay,
  },
}
</script>

<style lang="scss">
.input-calendar:not(.input-group) {
  display: flex;
  gap: map_get($spacers, 2);
}

.input-calendar > select.is-invalid:not(:last-child) {
  background-image: escape-svg($form-select-indicator) !important;
}

</style>
