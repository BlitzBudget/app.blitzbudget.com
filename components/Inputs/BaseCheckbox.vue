<template>
  <div class="form-group" :class="{
    'has-danger': error,
    'has-success': !error && touched,
  }">
    <div class="form-check" :class="[{
      disabled: disabled
    }, inlineClass]">
      <label :for="cbId" class="form-check-label">
        <input :id="cbId" class="form-check-input" type="checkbox" :disabled="disabled" v-model="model" />
        <span class="form-check-sign"></span>
        <slot> <span v-if="inline">&nbsp;</span> </slot>
      </label>
    </div>
    <slot name="error" v-if="error || $slots.error">
      <label class="error">{{ error }}</label>
    </slot>
  </div>
</template>
<script>
export default {
  name: 'base-checkbox',
  model: {
    prop: 'checked'
  },
  props: {
    checked: [Array, Boolean],
    disabled: Boolean,
    inline: Boolean,
    hasError: Boolean,
    error: {
      type: String,
      description: 'Input error',
      default: ''
    },
  },
  data() {
    return {
      cbId: '',
      touched: false
    };
  },
  computed: {
    model: {
      get() {
        return this.checked;
      },
      set(check) {
        if (!this.touched) {
          this.touched = true;
        }
        this.$emit('input', check);
      }
    },
    inlineClass() {
      if (this.inline) {
        return `form-check-inline`;
      }

      return '';
    }
  },
  mounted() {
    this.cbId = Math.random()
      .toString(16)
      .slice(2);
  }
};
</script>
