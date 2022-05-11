<template>
  <div>
    <h5 class="info-text">
      {{ $t("user.forgot-password.step-one.info") }}
    </h5>
    <div class="row justify-content-center mt-5">
      <div class="col-sm-5">
        <base-input name="email" required :placeholder="$t('user.forgot-password.step-one.email')" v-model="model.email"
          v-validate="modelValidations.email" :error="getError('email')" addon-left-icon="tim-icons icon-email-85">
        </base-input>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      model: {
        email: '',
      },
      modelValidations: {
        email: {
          required: true,
          email: true
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
