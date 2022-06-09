<template>
    <div class="container">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
                <change-password-form @on-submit="changePassword" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]">
                </change-password-form>
            </div>
        </div>
        <div class="col-md-12 ml-auto-mr-auto">
            <!-- Success Message Tab -->
            <card type="testimonial" header-classes="card-header-avatar" :class="[
            { 'show d-block': hasSucceeded },
            { 'd-none': !hasSucceeded }]">
                <p class="card-description">
                    {{ $t('user.change-password.success.description') }}
                </p>

                <template slot="footer">
                    <nuxt-link to="/user/profile" class="btn btn-primary">
                        {{ $t('user.change-password.success.button') }}
                    </nuxt-link>
                </template>
            </card>
        </div>
    </div>
</template>
<script>
import ChangePasswordForm from '@/components/UserProfile/ChangePasswordForm.vue';

export default {
    name: 'change-password-page',
    layout: 'plain',
    components: {
        ChangePasswordForm,
    },
    data() {
        return {
            emailModel: {},
            hasSucceeded: false
        };
    },
    methods: {
        async changePassword(isValid, model, accessToken) {
            if (!isValid) {
                return;
            }

            this.emailModel = model;
            await this.$axios.$post(process.env.api.profile.changePassword, {
                previousPassword: model.oldPassword,
                newPassword: model.password,
                accessToken: accessToken
            }).then(() => {
                this.hasSucceeded = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    }
};
</script>
<style>
</style>
