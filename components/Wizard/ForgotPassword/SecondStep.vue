<template>
  <div>
    <h5 class="info-text">{{ $t("user.forgot-password.step-two.info") }}</h5>
    <div class="row justify-content-center">
      <div class="col-lg-5">
        <base-input v-validate="'required|min:8'" name="password" :error="getError('password')" v-model="model.password"
          type="password" autocomplete="current-password"
          :placeholder="$t('user.forgot-password.step-two.new-password')" addon-left-icon="tim-icons icon-lock-circle"
          ref="password">
        </base-input>
      </div>
      <div class="col-lg-5">
        <base-input v-validate="'required|confirmed:password'" name="reenterPassword"
          :error="getError('reenterPassword')" v-model="model.reenterPassword" type="password"
          autocomplete="reenter-password" :placeholder="$t('user.forgot-password.step-two.reenter-password')"
          addon-left-icon="tim-icons icon-lock-circle" data-vv-as="password">
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
        password: '',
        reenterPassword: '',
      },
      modelValidations: {
        password: {
          required: true,
          min: 8
        },
        reenterPassword: {
          required: true,
          min: 8
        },
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
