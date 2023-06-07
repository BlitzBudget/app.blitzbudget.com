<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('investment.link.add.title') }}</h4>
            </div>
            <div>
                <el-tooltip :content="$t('investment.link.add.tooltip')" effect="light" :open-delay="300" placement="top">
                    <base-input :label="$t('investment.link.add.transactionDescription')" required
                        v-model="model.transactionDescription" v-validate="modelValidations.transactionDescription"
                        :error="getError('transactionDescription')" name="transactionDescription" autofocus>
                    </base-input>
                </el-tooltip>

                <base-input :label="$t('investment.link.add.investmentId')" required :error="getError('investmentId')"
                    name="investmentId">
                    <el-select v-model="model.investmentId" class="select-primary" name="investmentId"
                        v-validate="modelValidations.investmentId" :loading="loadingDataForSelect" :clearable="clearable"
                        autocomplete="on" :filterable="filterable">
                        <el-option v-for="investment in investments" class="select-primary"
                            :label="getInvestmentValue(investment)" :value="investment.sk" :key="investment.sk"
                            :selected="isSelected(investment)">
                        </el-option>
                    </el-select>
                </base-input>

                <div class="small form-investment">{{ $t('investment.link.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                    $t('investment.link.add.submit')
                }}</base-button>
                <nuxt-link class="float-right"
                    :to="{ path: '/investment/investment-link', query: { investment_id: this.selectedInvestmentId } }">
                    {{
                        $t('investment.link.add.viewInvestmentRule')
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
            selectedInvestmentId: '',
            filterable: true,
            clearable: true,
            model: {
                transactionDescription: null,
                investmentId: null,
            },
            modelValidations: {
                transactionDescription: {
                    required: true
                },
                investmentId: {
                    required: true
                }
            },
            investments: [],
            loadingDataForSelect: true
        };
    },
    methods: {
        getInvestmentValue(investment) {
            return investment.investment_name
        },
        isSelected(investment) {
            return (investment.sk === this.selectedInvestmentId);
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
        async getInvestments(walletId) {
            await this.$axios.$post(process.env.api.investments, {
                wallet_id: walletId,
            }).then((response) => {
                this.investments = response;
                // Change loading to false
                this.loadingDataForSelect = false
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    },
    async mounted() {
        // Set the selcted investment ID
        this.selectedInvestmentId = this.$route.query.investment_id;
        this.model.investmentId = this.selectedInvestmentId;
        // Set Transaction Description to input
        this.model.transactionDescription = this.$route.query.transaction_description;
        // Fetch the wallet ID
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Fetch Data from API
        await this.getInvestments(wallet.WalletId);
    }
};
</script>
<style></style>