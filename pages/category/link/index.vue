<template>
    <card class="card">
        <div class="row">
            <div class="col-sm-6">
                <h3 slot="header" class="card-title">{{ $t('category.link.get.title') }}</h3>
            </div>
            <div class="col-sm-6">
                <nuxt-link to="/category/add" class="btn btn-link btn-primary float-right">Add Category
                </nuxt-link>
            </div>
        </div>
        <div class="table-responsive">
            <base-table :data="expenseCategories" thead-classes="text-primary">
                <template slot="columns" slot-scope="{ columns }">
                    <th>{{ $t('category.link.get.table.header.description') }}</th>
                    <th>{{ $t('category.link.get.table.header.category') }}</th>
                    <th class="text-right">{{ $t('category.link.get.table.header.action') }}</th>
                </template>

                <template slot-scope="{ row, index }">
                    <td>{{ row.transaction_name }}</td>
                    <td>{{ row.category_id }}</td>
                    <td class="text-right">
                        <el-tooltip :content="$t('category.link.get.table.link')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link :to="{ path: '/category/link/add', query: { category_id: row.category_id } }"
                                :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link">
                                <i class="tim-icons icon-link-72"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('category.link.get.table.delete')" effect="light" :open-delay="300"
                            placement="top">
                            <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link">
                                <i class="tim-icons icon-simple-remove"></i>
                            </base-button>
                        </el-tooltip>
                    </td>
                </template>
            </base-table>
        </div>
    </card>
</template>
<script>
import { BaseTable, BaseProgress } from '@/components';

export default {
    components: {
        BaseTable,
        BaseProgress
    },
    data() {
        return {
            incomeCategories: [],
            expenseCategories: []
        };
    },
    methods: {
        async getCategoryRules(walletId, categoryId) {
            await this.$axios.$post(process.env.api.categoryRules, {
                wallet_id: walletId,
                category_id: categoryId
            }).then((response) => {
                this.expenseCategories = response;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    },
    async mounted() {
        // Fetch the current user ID
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Fetch Category ID from parameter
        let selectedCategoryId = this.$route.query.category_id;
        // Fetch Data from API
        await this.getCategoryRules(wallet.WalletId, selectedCategoryId);
    }
};
</script>
<style>
</style>
