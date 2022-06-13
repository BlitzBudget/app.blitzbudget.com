<template>
    <form class="extended-forms">
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('transaction.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('transaction.add.amount')" required v-model="model.amount"
                    v-validate="modelValidations.amount" :error="getError('amount')" name="amount" type="number"
                    autofocus :placeholder="currency">
                </base-input>

                <base-input :label="$t('transaction.add.description')" required v-model="model.description"
                    v-validate="modelValidations.description" :error="getError('description')" name="description"
                    type="description">
                </base-input>

                <base-input :label="$t('transaction.add.category')" :error="getError('categoryId')" name="categoryId">
                    <el-select v-model="model.categoryId" class="select-primary" name="categoryId"
                        :loading="loadingDataForSelect" :clearable="clearable" autocomplete="on"
                        :filterable="filterable">
                        <el-option v-for="category in categories" class="select-primary"
                            :label="getCategoryValue(category)" :value="category.sk" :key="category.sk">
                        </el-option>
                    </el-select>
                </base-input>

                <base-input :label="$t('transaction.add.creationDate')">
                    <el-date-picker type="datetime" placeholder="Creation Date" v-model="model.creationDate">
                    </el-date-picker>
                </base-input>

                <tags-input v-model="model.tags" :label="$t('transaction.add.tags')"></tags-input>

                <div class="small form-category">{{ $t('transaction.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('transaction.add.submit')
                }}</base-button>
                <nuxt-link to="/transaction/add/advanced" class="pull-right">{{ $t('transaction.add.advanced') }}
                </nuxt-link>
            </template>
        </card>
    </form>
</template>
<script>
import { TagsInput } from '@/components/index';
import { DatePicker, Select, Option } from 'element-ui';

export default {
    components: {
        [DatePicker.name]: DatePicker,
        TagsInput,
        [Select.name]: Select,
        [Option.name]: Option
    },
    data() {
        return {
            filterable: true,
            clearable: true,
            model: {
                amount: null,
                description: '',
                tags: [],
                creationDate: null,
                categoryId: null,
            },
            modelValidations: {
                amount: {
                    required: true,
                    min_value: 1,
                },
                description: {
                    required: true,
                    min: 2
                }
            },
            categories: [],
            loadingDataForSelect: true,
            currency: null
        };
    },
    methods: {
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        getCategoryValue(category) {
            return category.category_type + " : " + category.category_name
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
        },
        async validate() {
            let wallet = await this.$wallet.setCurrentWallet(this);
            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, wallet.WalletId);
            });
        },
    },
    async mounted() {
        // Fetch the current user ID
        let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
        // Fetch Data from API
        await this.getCategories(userId);
        // Wallet Currency
        let wallet = await this.$wallet.setCurrentWallet(this);
        this.currency = wallet.WalletCurrency;
    }
};
</script>
<style>
</style>
