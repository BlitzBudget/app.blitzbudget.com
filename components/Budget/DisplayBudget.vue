<template>
    <div class="table-responsive">
        <base-table :data="tableData" thead-classes="text-primary">
            <template slot="columns" slot-scope="{ columns }">
                <th>Category</th>
                <th>Used</th>
                <th class="text-right">Planned</th>
                <th class="text-right">Actions</th>
            </template>

            <template slot-scope="{ row, index }">
                <td :class="row.category"></td>
                <td class="text-center">
                    <base-progress :value="50" />
                </td>
                <td class="text-right">{{ row.planned }} {{ currency }}</td>
                <td class="text-right">
                    <el-tooltip :content="$t('budget.get.edit')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'warning' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleEdit(index, row)">
                            <i class="tim-icons icon-pencil"></i>
                        </base-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('budget.get.delete')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleDelete(index, row)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </el-tooltip>
                </td>
            </template>
        </base-table>
        <div :class="[
        { 'show d-block text-center': noData },
        { 'd-none': !noData }]">
            No Data
        </div>
        <div :class="[
        { 'show d-block text-center': loading },
        { 'd-none': !loading }]">
            Loading...
        </div>
    </div>
</template>
<script>
import { BaseTable, BaseProgress } from '@/components';
import Swal from 'sweetalert2';

export default {
    components: {
        BaseTable,
        BaseProgress
    },
    data() {
        return {
            tableData: [],
            currency: null,
            categories: [],
            startsWithDate: null,
            endsWithDate: null,
            noData: false,
            loading: true
        };
    },
    methods: {
        async getBudgets(walletId) {
            await this.$axios.$post(process.env.api.budgets, {
                wallet_id: walletId,
                starts_with_date: this.startsWithDate,
                ends_with_date: this.endsWithDate
            }).then((response) => {
                this.tableData = response;
                // Fetch Category information and populate it
                this.fetchCategoryLink();
                // if No Data populate no data
                this.noDataInResponse(response);
                // Loading False
                this.loading = false
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getCategories(userId) {
            await this.$axios.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                // Assign Categories name to the categories
                this.assignCategoriesToTable(response);
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        assignCategoriesToTable(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let category = response[i];
                let elements = document.getElementsByClassName(category.sk);

                if (this.$isEmpty(elements)) {
                    continue;
                }

                for (let j = 0, len = elements.length; j < len; j++) {
                    let element = elements[j];
                    element.textContent = category.category_type + " : " + category.category_name
                }
            }
        },
        async fetchCategoryLink() {
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            // Fetch Data from API
            await this.getCategories(userId);
        },
        setDatesToFetchBudget() {
            let date = new Date();

            let startsWithDate = new Date(date.getFullYear(), date.getMonth(), 1);
            this.startsWithDate = new Intl.DateTimeFormat('en-GB').format(startsWithDate);

            let endsWithDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            this.endsWithDate = new Intl.DateTimeFormat('en-GB').format(endsWithDate);
        },
        handleEdit(index, row) {
            Swal.fire({
                title: `You want to edit ${row.description}`,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-info btn-fill'
            });
        },
        handleDelete(index, row) {
            Swal.fire({
                title: this.$nuxt.$t('budget.delete.confirm'),
                text: this.$nuxt.$t('budget.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('budget.delete.button'),
                buttonsStyling: false
            }).then(async result => {
                if (result.value) {
                    await this.deleteItem(row);
                }
            });
        },
        async deleteItem(row) {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$axios.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: row.sk
            }).then(async () => {
                this.deleteRow(row);
                let deleteDescription = this.$nuxt.$t('budget.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
                this.closeModal();
            });
        },
        deleteRow(row) {
            let indexToDelete = this.tableData.findIndex(
                tableRow => tableRow.id === row.id
            );
            if (indexToDelete >= 0) {
                this.tableData.splice(indexToDelete, 1);
            }
        },
        noDataInResponse(response) {
            if (this.$isEmpty(response)) {
                this.noData = true;
            }
        },
    },
    async mounted() {
        // Set Date for Fetching Budgets
        this.setDatesToFetchBudget();
        // Get Budgets
        let wallet = await this.$wallet.setCurrentWallet(this);
        await this.getBudgets(wallet.WalletId);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;
    }
};
</script>
<style>
</style>
