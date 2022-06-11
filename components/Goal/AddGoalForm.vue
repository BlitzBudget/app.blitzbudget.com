<template>
    <form class="extended-forms">
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('goal.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('goal.add.targetAmount')" required v-model="model.targetAmount"
                    v-validate="modelValidations.targetAmount" :error="getError('targetAmount')" name="targetAmount"
                    type="number" autofocus>
                </base-input>

                <base-input :label="$t('goal.add.goalName')" required v-model="model.goalName"
                    v-validate="modelValidations.goalName" :error="getError('goalName')" name="goalName"
                    type="goalName">
                </base-input>

                <base-input :label="$t('goal.add.targetDate')">
                    <el-date-picker type="datetime" :placeholder="$t('goal.add.placeholder.targetDate')"
                        v-model="model.targetDate">
                    </el-date-picker>
                </base-input>

                <div class="small form-category">{{ $t('goal.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('goal.add.submit')
                }}</base-button>
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
                targetAmount: null,
                categoryId: null,
            },
            modelValidations: {
                targetAmount: {
                    required: true,
                    min_value: 1,
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
    }
};
</script>
<style>
</style>
