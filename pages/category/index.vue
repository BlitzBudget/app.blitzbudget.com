<template>
    <div class="row">
        <div class="col-md-6">
            <card class="card">
                <div class="row">
                    <div class="col-sm-6">
                        <h3 slot="header" class="card-title">{{ $t('category.get.expense.title') }}</h3>
                    </div>
                    <div class="col-sm-6">
                        <nuxt-link to="/category/add" class="btn btn-link btn-primary float-right">Add Category
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

                        <template slot-scope="{ row, index }">
                            <td>{{ row.category_name }}</td>
                            <td>{{ row.category_type }}</td>
                            <td class="text-right">
                                <el-tooltip :content="$t('category.get.table.link')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link :to="{ path: '/category/link/add', query: { category_id: row.sk } }"
                                        :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link">
                                        <i class="tim-icons icon-link-72"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.delete')" effect="light" :open-delay="300"
                                    placement="top">
                                    <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm"
                                        class="btn-link">
                                        <i class="tim-icons icon-simple-remove"></i>
                                    </base-button>
                                </el-tooltip>
                            </td>
                        </template>
                    </base-table>
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
                        <nuxt-link to="/category/add" class="btn btn-link btn-primary float-right">Add Category
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

                        <template slot-scope="{ row, index }">
                            <td>{{ row.category_name }}</td>
                            <td>{{ row.category_type }}</td>
                            <td class="text-right">
                                <el-tooltip :content="$t('category.get.table.link')" effect="light" :open-delay="300"
                                    placement="top">
                                    <nuxt-link to="/category/link/add" :type="index > 2 ? 'success' : 'neutral'" icon
                                        size="sm" class="btn-link">
                                        <i class="tim-icons icon-link-72"></i>
                                    </nuxt-link>
                                </el-tooltip>
                                <el-tooltip :content="$t('category.get.table.delete')" effect="light" :open-delay="300"
                                    placement="top">
                                    <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm"
                                        class="btn-link">
                                        <i class="tim-icons icon-simple-remove"></i>
                                    </base-button>
                                </el-tooltip>
                            </td>
                        </template>
                    </base-table>
                </div>
            </card>
        </div>
    </div>
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
        async getCategories(userId) {
            await this.$axios.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                this.assignCategoriesToTable(response);
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        assignCategoriesToTable(response) {
            if (this.$isNotEmpty(response)) {
                for (let i = 0, len = response.length; i < len; i++) {
                    let category = response[i];
                    if (category.type == "Income") {
                        this.incomeCategories.push(category);
                    } else {
                        this.expenseCategories.push(category);
                    }
                }
            }
        }
    },
    async mounted() {
        // Fetch the current user ID
        let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
        // Fetch Data from API
        await this.getCategories(userId);
    }
};
</script>
<style>
</style>
