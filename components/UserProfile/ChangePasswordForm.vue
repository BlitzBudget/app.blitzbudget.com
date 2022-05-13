<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('user.change-password.title') }}</h4>
            </div>
            <div>
                <base-input v-validate="'required|min:8'" name="oldPassword" :error="getError('oldPassword')"
                    v-model="model.oldPassword" type="password" autocomplete="old-password"
                    addon-left-icon="tim-icons icon-lock-circle" :label="$t('user.change-password.old-password')">
                </base-input>

                <base-input v-validate="'required|min:8'" name="password" :error="getError('password')"
                    v-model="model.password" type="password" autocomplete="current-password"
                    addon-left-icon="tim-icons icon-lock-circle" ref="password"
                    :label="$t('user.change-password.new-password')">
                </base-input>

                <base-input v-validate="'required|confirmed:password'" name="reenterPassword"
                    :error="getError('reenterPassword')" v-model="model.reenterPassword" type="password"
                    autocomplete="reenter-password" addon-left-icon="tim-icons icon-lock-circle" data-vv-as="password"
                    :label="$t('user.change-password.reenter-password')">
                </base-input>

                <div class="small form-category">{{ $t('user.change-password.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('user.change-password.button')
                }}</base-button>
                <nuxt-link to="/support" class="pull-right">{{ $t('user.change-password.forgot-password') }}</nuxt-link>
            </template>
        </card>
    </form>
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
                oldPassword: {
                    required: true,
                    min: 8
                },
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
            let accessToken = this.$authentication.fetchAccessToken();
            return this.$validator.validateAll().then(res => {
                this.$emit('on-submit', res, this.model, accessToken);
                return res;
            });
        }
    }
};
</script>
<style>
</style>
