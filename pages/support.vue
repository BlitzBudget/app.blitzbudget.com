<template>
    <div class="row">
        <notifications></notifications>
        <div class="col-md-12">
            {{ data }}
        </div>
    </div>
</template>
<script>
import EmailForm from '@/components/ValidationForms/Support/EmailForm.vue';

export default {
    name: 'support',
    layout: 'plain',
    components: {
        EmailForm,
    },
    data() {
        return {
            data: '',
        };
    },
    mounted() {
        this.$get(process.env.help.invokeUrl).then((response) => {
            this.data = response;
        }).catch((error) => {
            this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: error });
        });
    }
};
</script>
<style></style>
