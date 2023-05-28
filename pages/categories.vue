<template>
    <div class="row">
        <div class="col-md-6">
            <card class="card">
                <div class="row">
                    <div class="col-sm-6">
                        <h3 slot="header" class="card-title">{{ $t('category.get.expense.title') }}</h3>
                    </div>
                    <div class="col-sm-6">
                        <nuxt-link to="/category/add" class="btn btn-link btn-primary float-right">{{
                                                    $t('category.get.add')
                                                    }}
                        </nuxt-link>
                    </div>
                </div>
                <div class="table-responsive">
                    <base-table :data="expenseCategories" thead-classes="text-primary">
                        <template slot="columns" slot-scope="{ columns }">
                            <th>{{ $t('category.get.table.header.name') }}</th>
                            <th>{{ $t('category.get.table.header.type') }}</th>
                            <th class="text-right">{{ $t('category.get.table.header.action') }}</th>
                        </template>

                        <template slot-scope="{ row, index }" :class="[
                                                { 'show d-block text-center': !noExpenseData },
                                                { 'd-none': noExpenseData }]">
                            <td>{{ row.category_name }}</td>
                            <td>{{ row.category_type }}</td>
                            <td class="text-right">
                                <el-tooltip :content="$t('category.get.table.link')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link :to="{ path: '/category/link/add', query: { category_id: row.sk } }"
                                        :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                        class="btn-link btn-neutral">
                                        <i class="tim-icons icon-link-72"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.transaction')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link :to="{ path: '/transactions', query: { category_id: row.sk } }"
                                        :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                        class="btn-link btn-neutral">
                                        <i class="tim-icons icon-coins"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.delete')" effect="light" :open-delay="300"
                                    placement="top">
                                    <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link"
                                        @click.native="handleDelete(row, expenseType)">
                                        <i class="tim-icons icon-simple-remove"></i>
                                    </base-button>
                                </el-tooltip>
                            </td>
                        </template>
                    </base-table>
                    <div :class="[
                                        { 'show d-block text-center': noExpenseData },
                                        { 'd-none': !noExpenseData }]">
                        {{ $t('category.link.get.no-data') }}
                    </div>
                </div>
            </card>
        </div>
        <div class="col-md-6">
            <card class="card">
                <div class="row">
                    <div class="col-sm-6">
                        <h3 slot="header" class="card-title">{{ $t('category.get.income.title') }}</h3>
                    </div>
                    <div class="col-sm-6">
                        <nuxt-link to="/category/add" class="btn btn-link btn-primary float-right">{{
                                                    $t('category.get.add')
                                                    }}
                        </nuxt-link>
                    </div>
                </div>
                <div class="table-responsive">
                    <base-table :data="incomeCategories" thead-classes="text-primary">
                        <template slot="columns" slot-scope="{ columns }">
                            <th>{{ $t('category.get.table.header.name') }}</th>
                            <th>{{ $t('category.get.table.header.type') }}</th>
                            <th class="text-right">{{ $t('category.get.table.header.action') }}</th>
                        </template>

                        <template slot-scope="{ row, index }" :class="[
                                                { 'show d-block text-center': !noIncomeData },
                                                { 'd-none': noIncomeData }]">
                            <td>{{ row.category_name }}</td>
                            <td>{{ row.category_type }}</td>
                            <td class="text-right">
                                <el-tooltip :content="$t('category.get.table.link')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link to="/category/link/add" :type="index > 2 ? 'success' : 'neutral'" icon
                                        size="sm" class="btn-link btn-neutral">
                                        <i class="tim-icons icon-link-72"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.transaction')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link :to="{ path: '/transactions', query: { category_id: row.sk } }"
                                        :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                        class="btn-link btn-neutral">
                                        <i class="tim-icons icon-coins"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.delete')" effect="light" :open-delay="300"
                                    placement="top">
                                    <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm"
                                        class="btn-link btn-neutral" @click.native="handleDelete(row, incomeType)">
                                        <i class="tim-icons icon-simple-remove"></i>
                                    </base-button>
                                </el-tooltip>
                            </td>
                        </template>
                    </base-table>
                    <div :class="[
                                        { 'show d-block text-center': noIncomeData },
                                        { 'd-none': !noIncomeData }]">
                        {{ $t('category.link.get.no-data') }}
                    </div>
                </div>
            </card>
        </div>
    </div>
</template>
<script>
import { BaseTable, BaseProgress } from '@/components';
import Swal from 'sweetalert2';

export default {
    name: 'category',
    components: {
        BaseTable,
        BaseProgress
    },
    data() {
        return {
            incomeCategories: [],
            expenseCategories: [],
            noIncomeData: false,
            noExpenseData: false,
            incomeType: 'Income',
            expenseType: 'Expense'
        };
    },
    methods: {
        async getCategories(userId) {
            await this.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                this.assignCategoriesToTable(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        assignCategoriesToTable(response) {
            if (this.$isNotEmpty(response)) {
                for (let i = 0, len = response.length; i < len; i++) {
                    let category = response[i];
                    if (category.category_type == "Income") {
                        this.incomeCategories.push(category);
                    } else {
                        this.expenseCategories.push(category);
                    }
                }
            }

            if (this.$isEmpty(this.incomeCategories)) {
                this.noIncomeData = true;
            }

            if (this.$isEmpty(this.expenseCategories)) {
                this.noExpenseData = true;
            }
        },
        handleDelete(row, type) {
            Swal.fire({
                title: this.$nuxt.$t('debt.delete.confirm'),
                text: this.$nuxt.$t('debt.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('debt.delete.button'),
                buttonsStyling: false
            }).then(async result => {
                if (result.value) {
                    await this.deleteItem(row, type);
                }
            });
        },
        async deleteItem(row, type) {
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;

            await this.$post(process.env.api.deleteItem, {
                pk: userId,
                sk: row.sk
            }).then(async () => {
                this.deleteRow(row, type);
                let deleteDescription = this.$nuxt.$t('debt.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription + `${row.category_name}` });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
                this.closeModal();
            });
        },
        deleteRow(row, type) {
            // Switch between income and expense categories
            let tableData = this.$isEqual(type, this.incomeType) ? this.incomeCategories : this.expenseCategories;
            let indexToDelete = tableData.findIndex(
                tableRow => tableRow.id === row.id
            );
            if (indexToDelete >= 0) {
                tableData.splice(indexToDelete, 1);
            }
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
<style></style>
