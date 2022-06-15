<template>
    <form class="extended-forms">
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('investment.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('investment.add.investedAmount')" required v-model="model.investedAmount"
                    v-validate="modelValidations.investedAmount" :error="getError('investedAmount')"
                    name="investedAmount" type="number" autofocus :placeholder="currency">
                </base-input>

                <base-input :label="$t('investment.add.investmentName')" required v-model="model.investmentName"
                    v-validate="modelValidations.investmentName" :error="getError('investmentName')"
                    name="investmentName" type="text">
                </base-input>

                <base-input :label="$t('investment.add.currentValue')" required v-model="model.currentValue"
                    v-validate="modelValidations.currentValue" :error="getError('currentValue')" name="currentValue"
                    type="number" autofocus :placeholder="currency">
                </base-input>

                <div class="small form-category">{{ $t('investment.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('investment.add.submit')
                }}</base-button>
                <nuxt-link class="float-right" to="/investments">{{
                        $t('investment.add.to')
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
                investedAmount: null,
                investmentName: null,
                currentValue: null
            },
            modelValidations: {
                investedAmount: {
                    required: true,
                    min_value: 1,
                },
                investmentName: {
                    required: true
                },
                currentValue: {
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
