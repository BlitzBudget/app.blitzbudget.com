<template>
    <div>
        <div class="row">
            <div class="col-12">
                <card>
                    <h4 slot="header" class="card-title">{{ $t('transaction.get.filter') }}</h4>
                    <base-input>
                        <el-date-picker type="month" :placeholder="startsWithDate" v-model="searchWithDates">
                        </el-date-picker>
                    </base-input>
                    <base-button @click.native="searchTransaction" class="btn btn-primary pull-right">
                        {{ $t('transaction.get.search') }}
                    </base-button>
                </card>
            </div>
        </div>
        <card card-body-classes="table-full-width">
            <div class="row">
                <div class="col-6">
                    <h4 slot="header" class="card-title">{{ $t('transaction.get.title') }}</h4>
                </div>
                <div class="col-6">
                    <nuxt-link to="/transaction/add" class="btn btn-primary pull-right">
                        {{ $t('transaction.get.add-button') }}
                    </nuxt-link>
                </div>
            </div>
            <div>
                <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
                    <base-input>
                        <el-input type="search" class="mb-3 search-input" clearable prefix-icon="el-icon-search"
                            :placeholder="$t('transaction.get.search-records')" v-model="searchQuery"
                            aria-controls="datatables">
                        </el-input>
                    </base-input>
                </div>
                <el-table :data="queriedData">
                    <el-table-column :min-width="135" :label="$t('transaction.get.creation_date')" sortable
                        prop="creationDate">
                        <div slot-scope="props">
                            {{ new Date(props.row.creation_date).toLocaleDateString(
                                $i18n.locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                            })
                            }}
                        </div>
                    </el-table-column>
                    <el-table-column :min-width="100" :label="$t('transaction.get.amount')" sortable prop="amount">
                        <div slot-scope="props">
                            {{ calculateAmount(props.row.amount) }}
                        </div>
                    </el-table-column>
                    <el-table-column :min-width="100" :label="$t('transaction.get.category')" sortable prop="category">
                        <div slot-scope="props">
                            <nuxt-link :to="{ path: '/budgets#' + props.row.category_id }">
                                <p>{{ props.row.categoryName }}</p>
                            </nuxt-link>
                        </div>
                    </el-table-column>
                    <el-table-column v-for="column in tableColumns" :key="column.label" :min-width="column.minWidth"
                        :prop="column.prop" :label="column.label">
                    </el-table-column>
                    <el-table-column :min-width="100" :label="$t('transaction.get.tags')">
                        <div slot-scope="props">
                            <span v-for="tag in props.row.tags" :key="tag">
                                <el-tag size="small" type="info">{{ tag }}
                                </el-tag>
                            </span>
                        </div>
                    </el-table-column>
                    <el-table-column :min-width="100" align="right" :label="$t('transaction.get.actions')">
                        <div slot-scope="props">
                            <el-tooltip :content="$t('transaction.get.link')" effect="light" :open-delay="300"
                                placement="top">
                                <nuxt-link
                                    :to="{ path: '/transaction/transaction-link', query: { transaction_description: props.row.description, transaction_amount: props.row.amount } }"
                                    class="edit btn-link btn-neutral" type="info" size="sm" icon>
                                    <i class="tim-icons icon-link-72"></i>
                                </nuxt-link>
                            </el-tooltip>
                            <el-tooltip :content="$t('transaction.get.edit')" effect="light" :open-delay="300"
                                placement="top">
                                <nuxt-link
                                    :to="{ name: 'transaction-edit___' + $i18n.locale, params: { transaction_id: props.row.sk, amount: props.row.amount, description: props.row.description, category_id: props.row.category_id, tags: props.row.tags } }"
                                    class="edit btn-link btn-neutral" type="warning" size="sm" icon>
                                    <i class="tim-icons icon-pencil"></i>
                                </nuxt-link>
                            </el-tooltip>
                            <el-tooltip :content="$t('transaction.get.delete')" effect="light" :open-delay="300"
                                placement="top">
                                <base-button @click.native="handleDelete(props.row)" class="remove btn-link" type="danger"
                                    size="sm" icon>
                                    <i class="tim-icons icon-simple-remove"></i>
                                </base-button>
                            </el-tooltip>
                        </div>
                    </el-table-column>
                </el-table>
            </div>
            <div slot="footer" class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
                <div class="">
                    <p class="card-category">
                        Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
                    </p>
                </div>
                <base-pagination class="pagination-no-border" v-model="pagination.currentPage"
                    :per-page="pagination.perPage" :total="total">
                </base-pagination>
            </div>
        </card>
    </div>
</template>
<script>
import { DatePicker, Table, TableColumn, Select, Option, Tag } from 'element-ui';
import { BasePagination } from '@/components';
import Fuse from 'fuse.js';
import Swal from 'sweetalert2';

export default {
    name: 'display-transactions',
    components: {
        BasePagination,
        [DatePicker.name]: DatePicker,
        [Select.name]: Select,
        [Option.name]: Option,
        [Table.name]: Table,
        [Tag.name]: Tag,
        [TableColumn.name]: TableColumn,
    },
    computed: {
        /***
         * Returns a page from the searched data or the whole data. Search is performed in the watch section below
         */
        queriedData() {
            if (this.$isEmpty(this.tableData)) {
                return null;
            }

            let result = this.tableData;
            if (this.searchedData.length > 0) {
                result = this.searchedData;
            }
            return result.slice(this.from, this.to);
        },
        to() {
            let highBound = this.from + this.pagination.perPage;
            if (this.total < highBound) {
                highBound = this.total;
            }
            return highBound;
        },
        from() {
            return this.pagination.perPage * (this.pagination.currentPage - 1);
        },
        total() {
            return this.searchedData.length > 0
                ? this.searchedData.length
                : this.tableData.length;
        }
    },
    data() {
        return {
            pagination: {
                perPage: 50,
                currentPage: 1,
                perPageOptions: [5, 10, 25, 50],
                total: 0
            },
            searchQuery: '',
            propsToSearch: ['description', 'creation_date', 'category_id', 'tags'],
            tableColumns: [
                {
                    prop: 'description',
                    label: this.$nuxt.$t('transaction.get.description'),
                    minWidth: 200
                }
            ],
            tableData: [],
            searchedData: [],
            fuseSearch: null,
            startsWithDate: null,
            endsWithDate: null,
            currency: null,
            categories: [],
            transactions: null,
            searchWithDates: '',
            transactionTabs: [
                {
                    name: 'Transactions',
                    icon: 'tim-icons icon-tap-02'
                },
                {
                    name: 'Category',
                    icon: 'tim-icons icon-gift-2'
                },
                {
                    name: 'Tabs',
                    icon: 'tim-icons icon-single-02'
                }
            ],
            activeIndex: 0
        };
    },
    methods: {
        async searchTransaction() {
            let date = new Date(this.searchWithDates);
            if (isNaN(date)) {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: this.$nuxt.$t('transaction.get.validDate') });
                return;
            }

            this.setStartsWithDate(date);
            this.setEndsWithDate(date);

            // Filter Transactions
            await this.filterTransactions();
        },
        setEndsWithDate(date) {
            let endsWithDate = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
            this.endsWithDate = endsWithDate.toISOString().substring(0, 10);
        },
        setStartsWithDate(date) {
            let startsWithDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
            this.startsWithDate = startsWithDate.toISOString().substring(0, 10);
        },
        async filterTransactions() {
            let wallet = await this.$wallet.setCurrentWallet(this);
            await this.$axios.$post(process.env.api.transactions, {
                wallet_id: wallet.WalletId,
                starts_with_date: this.startsWithDate,
                ends_with_date: this.endsWithDate
            }).then((response) => {
                this.transactions = response;
                // Calculate Categories
                this.calculateCategories(this.categories);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getTransactions(walletId) {
            await this.$axios.$post(process.env.api.transactions, {
                wallet_id: walletId,
                starts_with_date: this.startsWithDate,
                ends_with_date: this.endsWithDate
            }).then((response) => {
                this.transactions = response;
                // Fetch Category information and populate it
                this.fetchCategoryLink();
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        calculateAmount(amount) {
            return this.$n(amount) + this.currency;
        },
        handleDelete(row) {
            Swal.fire({
                title: this.$nuxt.$t('transaction.delete.confirm'),
                text: this.$nuxt.$t('transaction.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('transaction.delete.button'),
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
                let deleteDescription = this.$nuxt.$t('transaction.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription + `${row.description}` });
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
        setDatesToFetchTransaction() {
            let date = new Date();

            this.setStartsWithDate(date);
            this.setEndsWithDate(date);
        },
        async getCategories(userId) {
            await this.$axios.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                this.calculateCategories(response);
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        calculateCategories(response) {
            // Assign Categories
            this.categories = response;
            // Assign Categories name to the trnasaction
            this.assignCategoriesToTransactions(response);
            // Assign Transactions
            this.tableData = this.transactions;
            // Initialize Search
            this.initializeFuseSearch();
        },
        assignCategoriesToTransactions(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let category = response[i];

                if (this.$isEmpty(this.transactions)) {
                    continue;
                }

                for (let j = 0, len = this.transactions.length; j < len; j++) {
                    let transaction = this.transactions[j];
                    if (transaction.category_id === category.sk) {
                        transaction.categoryName = category.category_type + " : " + category.category_name
                    }
                }
            }
        },
        async fetchCategoryLink() {
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            // Fetch Data from API
            await this.getCategories(userId);
        },
        initializeFuseSearch() {
            // Fuse search initialization.
            this.fuseSearch = new Fuse(this.tableData, {
                keys: [
                    {
                        name: 'description',
                        weight: 3,
                    },
                    {
                        name: 'tags',
                        weight: 1,
                    }
                ],
                threshold: 0.3
            });
        }
    },
    async mounted() {
        // Set Date for Fetching Transactios
        this.setDatesToFetchTransaction();
        // Get Transactions
        let wallet = await this.$wallet.setCurrentWallet(this);
        await this.getTransactions(wallet.WalletId);

        // Wallet Currency
        this.currency = wallet.WalletCurrency;
    },
    watch: {
        /**
         * Searches through the table data by a given query.
         * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
         * @param value of the query
         */
        searchQuery(value) {
            let result = this.tableData;
            if (value !== '') {
                let results = this.fuseSearch.search(this.searchQuery);
                result = [];

                // Result from search has an results.item which contains the object to display
                for (let i = 0, length = results.length; i < length; i++) {
                    let item = results[i].item;
                    result.push(item);
                }
            }
            this.searchedData = result;
        }
    }
};
</script>
<style>
.pagination-select,
.search-input {
    width: 200px;
}

.el-table th.el-table__cell {
    background-color: transparent;
}

.white-content .el-table th.el-table__cell {
    background-color: #fff;
}

.el-table td.el-table__cell,
.el-table th.el-table__cell.is-leaf {
    border-bottom: none;
}
</style>