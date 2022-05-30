<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('category.link.add.title') }}</h4>
            </div>
            <div>
                <el-tooltip :content="$t('category.link.add.tooltip')" effect="light" :open-delay="300" placement="top">
                    <base-input :label="$t('category.link.add.transactionDescription')" required
                        v-model="model.transactionDescription" v-validate="modelValidations.transactionDescription"
                        :error="getError('transactionDescription')" name="transactionDescription">
                    </base-input>
                </el-tooltip>

                <base-input :label="$t('category.link.add.categoryId')" required :error="getError('categoryId')"
                    name="categoryId">
                    <el-select v-model="model.categoryId" class="select-primary" name="categoryId"
                        v-validate="modelValidations.categoryId" :loading="loadingDataForSelect" :clearable="clearable"
                        autocomplete="on" :filterable="filterable">
                        <el-option v-for="category in categories" class="select-primary"
                            :label="getCategoryValue(category)" :value="category.sk" :key="category.sk"
                            :selected="isSelected(category)">
                        </el-option>
                    </el-select>
                </base-input>

                <div class="small form-category">{{ $t('category.link.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('category.link.add.submit')
                }}</base-button>
                <nuxt-link class="float-right"
                    :to="{ path: '/category/link/', query: { category_id: this.selectedCategoryId } }">{{
                            $t('category.link.add.viewCategoryRule')
                    }}</nuxt-link>
            </template>
        </card>
    </form>
</template>
<script>
import { Select, Option } from 'element-ui';

export default {
    components: {
        [Select.name]: Select,
        [Option.name]: Option
    },
    data() {
        return {
            selectedCategoryId: '',
            filterable: true,
            clearable: true,
            model: {
                transactionDescription: null,
                categoryId: null,
            },
            modelValidations: {
                transactionDescription: {
                    required: true
                },
                categoryId: {
                    required: true
                }
            },
            categories: [],
            loadingDataForSelect: true
        };
    },
    methods: {
        getCategoryValue(category) {
            return category.category_type + " : " + category.category_name
        },
        isSelected(category) {
            return (category.sk === this.selectedCategoryId);
        },
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        async validate() {
            // Fetch the current wallet Id
            let wallet = await this.$wallet.setCurrentWallet(this);

            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, wallet.WalletId);
            });
        },
        async getCategories(userId) {
            await this.$axios.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                this.categories = response;
                // Change loading to false
                this.loadingDataForSelect = false
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    },
    async mounted() {
        // Set the selcted category ID
        this.selectedCategoryId = this.$route.query.category_id;
        this.model.categoryId = this.selectedCategoryId;
        // Fetch the current user ID
        let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
        // Fetch Data from API
        await this.getCategories(userId);
    }
};
</script>
<style>
</style>