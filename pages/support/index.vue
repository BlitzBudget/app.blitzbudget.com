<template>
    <div class="row">
        <div class="col-md-12">
            {{ data }}
        </div>
    </div>
</template>
<script>
import EmailForm from '@/components/ValidationForms/Support/EmailForm.vue';

export default {
    name: 'validation-forms',
    components: {
        EmailForm,
    },
    data() {
        return {
            data: '',
        };
    },
    mounted() {
        this.$axios.$get(process.env.help.invokeUrl).then((response) => {
            this.data = response;
        }).catch(({ error }) => {
            this.$notify({ type: 'danger', message: error });
        });
    }
};
</script>
<style>
</style>
