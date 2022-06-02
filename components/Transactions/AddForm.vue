<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('transaction.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('transaction.add.amount')" required v-model="model.amount"
                    v-validate="modelValidations.amount" :error="getError('amount')" name="amount" type="text"
                    autofocus>
                </base-input>

                <base-input :label="$t('transaction.add.description')" required v-model="model.description"
                    v-validate="modelValidations.description" :error="getError('description')" name="description"
                    type="description">
                </base-input>

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
export default {
    data() {
        return {
            model: {
                amount: null,
                description: '',
            },
            modelValidations: {
                amount: {
                    required: true,
                    min_value: 1,
                },
                description: {
                    required: true,
                    min: 4
                }
            }
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
        }
    }
};
</script>
<style>
</style>
