<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('debt.link.add.title') }}</h4>
            </div>
            <div>
                <el-tooltip :content="$t('debt.link.add.tooltip')" effect="light" :open-delay="300" placement="top">
                    <base-input :label="$t('debt.link.add.transactionDescription')" required
                        v-model="model.transactionDescription" v-validate="modelValidations.transactionDescription"
                        :error="getError('transactionDescription')" name="transactionDescription" autofocus>
                    </base-input>
                </el-tooltip>

                <base-input :label="$t('debt.link.add.debtId')" required :error="getError('debtId')" name="debtId">
                    <el-select v-model="model.debtId" class="select-primary" name="debtId"
                        v-validate="modelValidations.debtId" :loading="loadingDataForSelect" :clearable="clearable"
                        autocomplete="on" :filterable="filterable">
                        <el-option v-for="debt in debts" class="select-primary" :label="getDebtValue(debt)" :value="debt.sk"
                            :key="debt.sk" :selected="isSelected(debt)">
                        </el-option>
                    </el-select>
                </base-input>

                <div class="small form-debt">{{ $t('debt.link.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                                    $t('debt.link.add.submit')
                                    }}</base-button>
                <nuxt-link class="float-right" :to="{ path: '/debt/debt-link', query: { debt_id: this.selectedDebtId } }">{{
                                    $t('debt.link.add.viewDebtRule')
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
            selectedDebtId: '',
            filterable: true,
            clearable: true,
            model: {
                transactionDescription: null,
                debtId: null,
            },
            modelValidations: {
                transactionDescription: {
                    required: true
                },
                debtId: {
                    required: true
                }
            },
            debts: [],
            loadingDataForSelect: true
        };
    },
    methods: {
        getDebtValue(debt) {
            return debt.debt_name
        },
        isSelected(debt) {
            return (debt.sk === this.selectedDebtId);
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
        async getDebts(walletId) {
            await this.$post(process.env.api.debts, {
                wallet_id: walletId,
            }).then((response) => {
                this.debts = response;
                // Change loading to false
                this.loadingDataForSelect = false
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    },
    async mounted() {
        // Set the selcted debt ID
        this.selectedDebtId = this.$route.query.debt_id;
        this.model.debtId = this.selectedDebtId;
        // Set Transaction Description to input
        this.model.transactionDescription = this.$route.query.transaction_description;
        // Fetch the wallet ID
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Fetch Data from API
        await this.getDebts(wallet.WalletId);
    }
};
</script>
<style></style>