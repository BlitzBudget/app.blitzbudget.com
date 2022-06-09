<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <nuxt-link to="/transaction/add" class="btn btn-primary">
                        {{ $t('transaction.get.add-button') }}
                    </nuxt-link>
                </div>
                <card card-body-classes="table-full-width">
                    <h4 slot="header" class="card-title">{{ $t('transaction.get.title') }}</h4>
                    <div>
                        <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
                            <el-select class="select-primary mb-3 pagination-select" v-model="pagination.perPage"
                                :placeholder="$t('transaction.get.per-page')">
                                <el-option class="select-primary" v-for="item in pagination.perPageOptions" :key="item"
                                    :label="item" :value="item">
                                </el-option>
                            </el-select>

                            <base-input>
                                <el-input type="search" class="mb-3 search-input" clearable prefix-icon="el-icon-search"
                                    :placeholder="$t('transaction.get.search-records')" v-model="searchQuery"
                                    aria-controls="datatables">
                                </el-input>
                            </base-input>
                        </div>
                        <el-table :data="queriedData">
                            <el-table-column :min-width="100" :label="$t('transaction.get.creation_date')">
                                <div slot-scope="props">
                                    {{ $d(new Date(props.row.creation_date)) }}
                                </div>
                            </el-table-column>
                            <el-table-column :min-width="100" :label="$t('transaction.get.amount')">
                                <div slot-scope="props">
                                    {{ calculateAmount(props.row.amount) }}
                                </div>
                            </el-table-column>
                            <el-table-column v-for="column in tableColumns" :key="column.label"
                                :min-width="column.minWidth" :prop="column.prop" :label="column.label">
                            </el-table-column>
                            <el-table-column :min-width="135" align="right" :label="$t('transaction.get.actions')">
                                <div slot-scope="props">
                                    <base-button @click.native="handleEdit(props.$index, props.row)"
                                        class="edit btn-link" type="warning" size="sm" icon>
                                        <i class="tim-icons icon-pencil"></i>
                                    </base-button>
                                    <base-button @click.native="handleDelete(props.$index, props.row)"
                                        class="remove btn-link" type="danger" size="sm" icon>
                                        <i class="tim-icons icon-simple-remove"></i>
                                    </base-button>
                                </div>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div slot="footer"
                        class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
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
        </div>
    </div>
</template>
<script>
import { Table, TableColumn, Select, Option } from 'element-ui';
import { BasePagination } from '@/components';
import Fuse from 'fuse.js';
import swal from 'sweetalert2';

export default {
    name: 'paginated',
    components: {
        BasePagination,
        [Select.name]: Select,
        [Option.name]: Option,
        [Table.name]: Table,
        [TableColumn.name]: TableColumn
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
                perPage: 5,
                currentPage: 1,
                perPageOptions: [5, 10, 25, 50],
                total: 0
            },
            searchQuery: '',
            propsToSearch: ['description', 'creation_date', 'category_id', 'tags'],
            tableColumns: [
                {
                    prop: 'description',
                    label: 'Description',
                    minWidth: 200
                },
                {
                    prop: 'tags',
                    label: 'Tags',
                    minWidth: 120
                },
                {
                    prop: 'category_id',
                    label: 'Category',
                    minWidth: 120
                }
            ],
            tableData: [],
            searchedData: [],
            fuseSearch: null,
            startsWithDate: null,
            endsWithDate: null,
            currency: null
        };
    },
    methods: {
        async getTransactions(walletId) {
            await this.$axios.$post(process.env.api.transactions, {
                wallet_id: walletId,
                starts_with_date: this.startsWithDate,
                ends_with_date: this.endsWithDate
            }).then((response) => {
                this.tableData = response;
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        calculateAmount(amount) {
            return this.$n(amount) + this.currency;
        },
        handleEdit(index, row) {
            swal({
                title: `You want to edit ${row.description}`,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-info btn-fill'
            });
        },
        handleDelete(index, row) {
            swal({
                title: 'Are you sure?',
                text: `You won't be able to revert this!`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: 'Yes, delete it!',
                buttonsStyling: false
            }).then(async result => {
                if (result.value) {
                    await deleteItem(row);
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
                swal({
                    title: 'Deleted!',
                    text: `You deleted ${row.description}`,
                    type: 'success',
                    confirmButtonClass: 'btn btn-success btn-fill',
                    buttonsStyling: false
                });
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

            let startsWithDate = new Date(date.getFullYear(), date.getMonth(), 1);
            this.startsWithDate = new Intl.DateTimeFormat('en-GB').format(startsWithDate);

            let endsWithDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            this.endsWithDate = new Intl.DateTimeFormat('en-GB').format(endsWithDate);
        }
    },
    async mounted() {
        // Fuse search initialization.
        this.fuseSearch = new Fuse(this.tableData, {
            keys: ['name', 'email'],
            threshold: 0.3
        });
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
                result = this.fuseSearch.search(this.searchQuery);
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
</style>
