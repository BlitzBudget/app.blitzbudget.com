<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <category-add-form @on-submit="addCategory"></category-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import CategoryAddForm from '@/components/Categories/AddForm.vue';

export default {
    name: 'add-category',
    layout: 'plain',
    components: {
        CategoryAddForm,
    },
    data() {
        return {
            categoryModel: {}
        };
    },
    methods: {
        async addCategory(model, isValid, userId) {
            if (!isValid) {
                return;
            }

            this.categoryModel = model;
            await this.$axios.$put(process.env.api.categories, {
                pk: userId,
                category_type: model.type,
                category_name: model.name
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('category.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
