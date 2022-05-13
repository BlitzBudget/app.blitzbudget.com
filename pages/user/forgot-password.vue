<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row d-flex justify-content-center">
            <div class="col-md-10">
                <simple-wizard :class="[{ 'show d-block': isOpen }, { 'd-none': !isOpen }]">
                    <template slot="header">
                        <h3 class="card-title">{{ $t('user.forgot-password.title') }}</h3>
                        <h3 class="description">
                            {{ $t('user.forgot-password.description') }}
                        </h3>
                    </template>

                    <wizard-tab :before-change="() => validateStep('step1')">
                        <template slot="label">
                            <i class="tim-icons icon-single-02"></i>
                            <p>{{ $t('user.forgot-password.step-one.title') }}</p>
                        </template>
                        <first-step ref="step1" @on-validated="onFirstStepValidated"></first-step>
                    </wizard-tab>

                    <wizard-tab :before-change="() => validateStep('step2')">
                        <template slot="label">
                            <i class="tim-icons icon-settings-gear-63"></i>
                            <p>{{ $t('user.forgot-password.step-two.title') }}</p>
                        </template>
                        <second-step ref="step2" @on-validated="onStepValidated"></second-step>
                    </wizard-tab>

                    <wizard-tab :before-change="() => validateStep('step3')">
                        <template slot="label">
                            <i class="tim-icons icon-delivery-fast"></i>
                            <p>{{ $t('user.forgot-password.step-three.title') }}</p>
                        </template>
                        <third-step ref="step3" @on-validated="wizardComplete"></third-step>
                    </wizard-tab>
                </simple-wizard>
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': !isOpen },
                { 'd-none': isOpen }]">
                    <p class="card-description">
                        {{ $t('user.forgot-password.success.text') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/login" class="btn btn-primary">
                            {{ $t('user.forgot-password.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import FirstStep from '@/components/Wizard/ForgotPassword/FirstStep.vue';
import SecondStep from '@/components/Wizard/ForgotPassword/SecondStep.vue';
import ThirdStep from '@/components/Wizard/ForgotPassword/ThirdStep.vue';
import { SimpleWizard, WizardTab } from '@/components';

export default {
    name: 'forgot-password-page',
    layout: 'auth',
    auth: 'guest',
    data() {
        return {
            wizardModel: {},
            isOpen: true,
        };
    },
    components: {
        FirstStep,
        SecondStep,
        ThirdStep,
        SimpleWizard,
        WizardTab
    },
    methods: {
        validateStep(ref) {
            return this.$refs[ref].validate();
        },
        onStepValidated(validated, model) {
            this.wizardModel = { ...this.wizardModel, ...model };
        },
        async onFirstStepValidated(validated, model) {
            let ajaxSuccess = false;
            await this.$axios.$post(process.env.api.profile.forgotPassword, {
                username: model.email,
            }).then(() => {
                this.wizardModel = { ...this.wizardModel, ...model };
                ajaxSuccess = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', timeout: 30000, icon: 'tim-icons icon-alert-circle-exc', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
            return ajaxSuccess;
        },
        wizardComplete(validated, model) {
            // Call confirm forgot password scenario
            this.$axios.$post(process.env.api.profile.confirmForgotPassword, {
                username: model.email,
                password: model.password,
                confirmationCode: model.validationCode
            }).then(() => {
                // Change to success model
                this.isOpen = false;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    }
};
</script>
<style>
.navbar-nav .nav-item p {
    line-height: inherit;
    margin-left: 5px;
}
</style>
