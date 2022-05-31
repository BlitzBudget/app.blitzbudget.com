<template>
    <card class="card">
        <div class="row">
            <div class="col-sm-6">
                <h3 slot="header" class="card-title">{{ $t('category.link.get.title') }}</h3>
            </div>
            <div class="col-sm-6">
                <nuxt-link to="/category/link/add" class="btn btn-link btn-primary float-right">Add Category Link
                </nuxt-link>
            </div>
        </div>
        <div class="table-responsive">
            <base-table :data="categoryLink" thead-classes="text-primary">
                <template slot="columns" slot-scope="{ columns }">
                    <th>{{ $t('category.link.get.table.header.description') }}</th>
                    <th>{{ $t('category.link.get.table.header.category') }}</th>
                    <th class="text-right">{{ $t('category.link.get.table.header.action') }}</th>
                </template>

                <template slot-scope="{ row, index }" :class="[
                { 'show d-block': !noData },
                { 'd-none': noData }]">
                    <td>{{ row.transaction_name }}</td>
                    <td :class="row.category_id"></td>
                    <td class="text-right">
                        <el-tooltip :content="$t('category.link.get.table.link')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link :to="{ path: '/category/link/add', query: { category_id: row.category_id } }"
                                :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link btn-neutral">
                                <i class="tim-icons icon-link-72"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('category.link.get.table.category')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link to='/categories' :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                class="btn-link btn-neutral">
                                <i class="tim-icons icon-components"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('category.link.get.table.delete')" effect="light" :open-delay="300"
                            placement="top">
                            <base-button @click="openModal(row.sk)" :type="index > 2 ? 'danger' : 'neutral'" icon
                                size="sm" class="btn-link">
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
            <!-- small modal -->
            <modal :show.sync="modals.mini" class="modal-primary" :show-close="true"
                headerClasses="justify-content-center" type="mini">
                <div slot="header" class="modal-profile">
                    <i class="tim-icons icon-single-02"></i>
                </div>
                <p>{{ $t('category.link.delete.description') }}</p>
                <template slot="footer">
                    <base-button type="neutral" link @click.native="modals.mini = false">Back
                    </base-button>
                    <base-button @click="deleteItem()" type="neutral" link>Delete</base-button>
                </template>
            </modal>
        </div>
    </card>
</template>
<script>
import { BaseTable, BaseProgress, Modal } from '@/components';

export default {
    name: 'category-link',
    components: {
        BaseTable,
        BaseProgress,
        Modal
    },
    data() {
        return {
            categoryLink: [],
            modals: {
                mini: false
            },
            categoryRuleId: null,
            noData: false
        };
    },
    methods: {
        openModal(categoryRuleId) {
            this.modals.mini = true;
            this.categoryRuleId = categoryRuleId;
        },
        closeModal() {
            this.modals.mini = false;
            this.categoryRuleId = null;
        },
        async getCategoryRules(walletId, categoryId) {
            await this.$axios.$post(process.env.api.rules.category, {
                wallet_id: walletId,
                category_id: categoryId
            }).then(async (response) => {
                this.categoryLink = response;
                // if No Data populate no data
                this.noDataInResponse(response);
                // Fetch Categories
                await this.getCategories(response);
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        async getCategories(categoryRuleResponse) {
            if (this.$isEmpty(categoryRuleResponse)) {
                return;
            }

            // Fetch all category ids
            let categoryIds = this.getCategoryIds(categoryRuleResponse);
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            await this.$axios.$post(process.env.api.category.batch, {
                user_id: userId,
                category_ids: categoryIds
            }).then((response) => {
                this.assignCategoriesToTable(response);
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        getCategoryIds(categoryRuleResponse) {
            let categoryIds = [];

            for (let i = 0, length = categoryRuleResponse.length; i < length; i++) {
                let categoryRule = categoryRuleResponse[i];
                categoryIds.push(categoryRule.category_id);
            }

            return categoryIds;
        },
        async deleteItem() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$axios.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: this.categoryRuleId
            }).then(async () => {
                this.closeModal();
                await this.fetchCategoryLink();
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
                this.closeModal();
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

                let element = elements[i];
                element.textContent = category.category_type + " : " + category.category_name
            }
        },
        noDataInResponse(response) {
            if (this.$isEmpty(response)) {
                this.noData = true;
            }
        },
        async fetchCategoryLink() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            // Fetch Category ID from parameter
            let selectedCategoryId = this.$route.query.category_id;
            // Fetch Data from API
            await this.getCategoryRules(wallet.WalletId, selectedCategoryId);
        },
    },
    async mounted() {
        await this.fetchCategoryLink();
    }
};
</script>
<style>
</style>
