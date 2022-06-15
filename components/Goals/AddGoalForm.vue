<template>
    <form class="extended-forms">
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('goal.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('goal.add.targetAmount')" required v-model="model.targetAmount"
                    v-validate="modelValidations.targetAmount" :error="getError('targetAmount')" name="targetAmount"
                    type="number" autofocus :placeholder="currency">
                </base-input>

                <base-input :label="$t('goal.add.goalName')" required v-model="model.goalName"
                    v-validate="modelValidations.goalName" :error="getError('goalName')" name="goalName" type="text">
                </base-input>

                <base-input :label="$t('goal.add.targetDate')" required v-validate="modelValidations.targetDate"
                    :error="getError('targetDate')" name="targetDate" v-model="model.targetDate" type="datetime">
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
                <nuxt-link class="float-right" to="/goals">{{
                        $t('goal.add.to')
                }}</nuxt-link>
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
                goalName: null,
                targetDate: null
            },
            modelValidations: {
                targetAmount: {
                    required: true,
                    min_value: 1,
                },
                goalName: {
                    required: true
                },
                targetDate: {
                    required: true
                }
            },
            currency: null
        };
    },
    methods: {
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        async validate() {
            let wallet = await this.$wallet.setCurrentWallet(this);
            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, wallet.WalletId);
            });
        },
    },
    async mounted() {
        // Wallet Currency
        let wallet = await this.$wallet.setCurrentWallet(this);
        this.currency = wallet.WalletCurrency;
    }
};
</script>
<style>
</style>
