<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('support.ask-us-directly.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('support.ask-us-directly.subject')" required v-model="model.subject"
                    v-validate="modelValidations.subject" :error="getError('subject')" name="subject">
                </base-input>

                <base-textarea :label="$t('support.ask-us-directly.message')" required v-model="model.message"
                    v-validate="modelValidations.message" :error="getError('message')" name="message" type="message">
                </base-textarea>

                <div class="category form-category">{{ $t('support.ask-us-directly.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('support.ask-us-directly.send-email')
                }}</base-button>
                <nuxt-link to="/support" class="pull-right">{{ $t('support.ask-us-directly.articles') }}</nuxt-link>
            </template>
        </card>
    </form>
</template>
<script>
export default {
    data() {
        return {
            model: {
                subject: '',
                message: '',
            },
            modelValidations: {
                subject: {
                    required: true,
                    min: 15
                },
                message: {
                    required: true,
                    min: 40
                }
            }
        };
    },
    methods: {
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        validate() {
            let email = this.$authentication.fetchCurrentUser().email;
            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, email);
            });
        }
    }
};
</script>
<style>
</style>
