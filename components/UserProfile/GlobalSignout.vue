<template>
    <card>
        <h5 slot="header" class="title">{{ $t('user.global-signout.header') }}</h5>
        <div class="row mb-3 px-5">
            <div class="col-6">
                <h4 class="mb-0">{{ $t('user.global-signout.title') }}</h4>
                <p class="small">{{ $t('user.global-signout.description') }}</p>
            </div>
            <div class="col-6">
                <base-button class="float-right" native-type="submit" @click.native.prevent="validate" type="primary">{{
                    $t('user.global-signout.button')
                }}</base-button>
            </div>
        </div>
    </card>
</template>
<script>
export default {
    methods: {
        validate() {
            let accessToken = this.$authentication.fetchAccessToken();
            return this.$validator.validateAll().then(res => {
                this.$emit('on-submit', res, accessToken);
                return res;
            });
        }
    }
};
</script>
<style></style>
