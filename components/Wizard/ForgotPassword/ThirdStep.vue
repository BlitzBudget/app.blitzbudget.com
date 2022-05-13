<template>
  <div class="row justify-content-center">
    <div class="col-sm-12">
      <h5 class="info-text">{{ $t('user.forgot-password.step-three.text') }}</h5>
    </div>
    <div class="col-sm-10">
      <base-input :label="$t('user.forgot-password.step-three.label')" name="validation code"
        v-model="model.validationCode" :error="getError('validation code')"
        v-validate="modelValidations.validationCode">
      </base-input>
    </div>
  </div>
</template>
<script>
import { Select, Option } from 'element-ui';

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option
  },
  data() {
    return {
      model: {
        validationCode: '',
      },
      modelValidations: {
        validationCode: {
          required: true,
          min: 6,
          max: 6,
          numeric: true
        }
      }
    };
  },
  methods: {
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    validate() {
      return this.$validator.validateAll().then(res => {
        this.$emit('on-validated', res, this.model);
        return res;
      });
    }
  }
};
</script>
<style>
</style>
