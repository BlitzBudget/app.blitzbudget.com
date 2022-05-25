<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <email-form @on-submit="sendEmail" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]"></email-form>
            </div>
            <div class="col-md-12 ml-auto-mr-auto">
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': hasSucceeded },
                { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('support.ask-us-directly.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/" class="btn btn-primary">
                            {{ $t('support.ask-us-directly.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import EmailForm from '@/components/ValidationForms/Support/EmailForm.vue';

export default {
    name: 'ask-us-directly',
    layout: 'plain',
    components: {
        EmailForm,
    },
    data() {
        return {
            emailModel: {},
            hasSucceeded: false
        };
    },
    methods: {
        async sendEmail(model, isValid, email) {
            if (!isValid) {
                return;
            }

            this.emailModel = model;
            await this.$axios.$post(process.env.api.sendEmailUrl, {
                email: email,
                message: model.message,
                subject: model.subject
            }).then(() => {
                this.hasSucceeded = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', message: errorMessage });
            });
        }
    }
};
</script>
<style>
</style>
