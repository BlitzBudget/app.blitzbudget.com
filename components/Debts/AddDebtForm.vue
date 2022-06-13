<template>
    <form class="extended-forms">
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('debt.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('debt.add.debtAmount')" required v-model="model.debtAmount"
                    v-validate="modelValidations.debtAmount" :error="getError('debtAmount')"
                    name="debtAmount" type="number" autofocus :placeholder="currency">
                </base-input>

                <base-input :label="$t('debt.add.debtName')" required v-model="model.debtName"
                    v-validate="modelValidations.debtName" :error="getError('debtName')"
                    name="debtName" type="text">
                </base-input>

                <base-input :label="$t('debt.add.currentValue')" required v-model="model.currentValue"
                    v-validate="modelValidations.currentValue" :error="getError('currentValue')"
                    name="currentValue" type="number" autofocus :placeholder="currency">
                </base-input>

                <div class="small form-category">{{ $t('debt.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('debt.add.submit')
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
                debtAmount: null,
                debtName: null,
                currentValue: null
            },
            modelValidations: {
                debtAmount: {
                    required: true,
                    min_value: 1,
                },
                debtName: {
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
