<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <category-link-add-form @on-submit="addCategoryLink"></category-link-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import CategoryLinkAddForm from '@/components/Categories/Link/AddForm.vue';

export default {
    name: 'category-links-add-form',
    layout: 'plain',
    components: {
        CategoryLinkAddForm,
    },
    data() {
        return {
            categoryModel: {}
        };
    },
    methods: {
        async addCategoryLink(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.categoryModel = model;
            await this.$axios.$put(process.env.api.rules.category, {
                pk: walletId,
                transaction_name: model.transactionDescription,
                category_id: model.categoryId
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('category.link.add.success') });
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    }
};
</script>
