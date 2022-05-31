<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title mb-0">{{ $t('user.delete-account.title') }}</h4>
                <small class="description">{{ $t('user.delete-account.description') }}</small>
            </div>
            <div>
                <base-input v-validate="'required|min:8'" name="password" :error="getError('password')"
                    v-model="model.password" type="password" autocomplete="current-password"
                    addon-left-icon="tim-icons icon-lock-circle" ref="password"
                    :label="$t('user.delete-account.password')">
                </base-input>

                <div class="small form-category">{{ $t('user.delete-account.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('user.delete-account.button')
                }}</base-button>
            </template>
        </card>
    </form>
</template>
<script>
export default {
    name: 'delete-account-form',
    data() {
        return {
            model: {
                password: '',
            },
            modelValidations: {
                password: {
                    required: true,
                    min: 8
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
                this.$emit('on-submit', res, this.model);
                return res;
            });
        }
    }
};
</script>
<style>
</style>
