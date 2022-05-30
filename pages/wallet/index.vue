<template>
    <div class="container pricing-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-6 ml-auto mr-auto text-center">
                <h1 class="title">{{ $t('wallet.get.title') }}</h1>
                <h4 class="description">
                    {{ $t('wallet.get.description') }}
                </h4>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-3 col-md-6 px-1" v-for="wallet in walletModels" :key="wallet.sk">
                <card type="pricing" class="card-primary" footer-classes="text-center mb-3 mt-3"
                    :data-target="wallet.sk">
                    <h1 class="card-title">{{ wallet.wallet_currency }}</h1>
                    <img class="card-img" src="img/card-primary.png" alt="Image" />
                    <ul class="list-group">
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                    </ul>
                    <div class="card-prices">
                        <h3 class="text-on-front"><span></span>{{ wallet.wallet_name }}</h3>
                        <h5 class="text-on-back">{{ wallet.wallet_currency }}</h5>
                        <p class="plan"></p>
                    </div>
                    <base-button slot="footer" round type="primary" class="btn-just-icon"
                        @click="chooseWallet(wallet.sk)">
                        {{ $t('wallet.get.enter') }}
                    </base-button>
                    <base-button slot="footer" class="btn btn-link text-center" @click="openModal(wallet.sk)">{{
                            $t('wallet.get.delete')
                    }}
                    </base-button>
                </card>
            </div>
            <div class="col-lg-3 col-md-6 px-1">
                <card type="pricing" class="card-primary" footer-classes="text-center mb-3 mt-3">
                    <h1 class="card-title">+</h1>
                    <img class="card-img" src="img/card-primary.png" alt="Image" />
                    <ul class="list-group">
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                    </ul>
                    <div class="card-prices">
                        <h3 class="text-on-front"><span></span>{{ $t('wallet.get.add.description') }}</h3>
                        <h5 class="text-on-back">+</h5>
                        <p class="plan"></p>
                    </div>
                    <nuxt-link to="/wallet/add" slot="footer" round type="primary"
                        class="btn btn-primary btn-round btn-just-icon">
                        {{ $t('wallet.get.add.button') }}
                    </nuxt-link>
                </card>
            </div>
        </div>
        <!-- small modal -->
        <modal :show.sync="modals.delete" class="modal-primary" :show-close="true"
            headerClasses="justify-content-center" type="mini">
            <div slot="header" class="modal-profile">
                <i class="tim-icons icon-single-02"></i>
            </div>
            <p>{{ $t('category.link.delete.description') }}</p>
            <template slot="footer">
                <base-button type="neutral" link @click.native="modals.delete = false">Back
                </base-button>
                <base-button @click.native="deleteItem()" type="neutral" link>Delete</base-button>
            </template>
        </modal>
    </div>
</template>
<script>
import WalletForm from '@/components/Wallets/AddForm.vue';
import { Modal } from '@/components';

export default {
    name: 'wallet',
    layout: 'plain',
    components: {
        WalletForm,
        Modal
    },
    data() {
        return {
            walletModels: [],
            deleteWalletId: null,
            modals: {
                delete: false
            }
        };
    },
    methods: {
        async getWallets(userId) {
            await this.$axios.$post(process.env.api.wallets, {
                user_id: userId,
            }).then((response) => {
                this.walletModels = response
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        chooseWallet(walletId) {
            for (let i = 0, length = this.walletModels.length; i < length; i++) {
                let walletModel = this.walletModels[i];

                if (walletModel.sk == walletId) {
                    // Choose the current wallet and store
                    this.$wallet.chooseAWallet(walletModel);
                    this.$router.push(process.env.route.transaction);
                }
            }
        },
        openModal(walletId) {
            this.modals.delete = true;
            this.deleteWalletId = walletId;
        },
        closeModal() {
            this.modals.delete = false;
            this.deleteWalletId = null;
        },
        async deleteItem() {
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;

            await this.$axios.$post(process.env.api.wallet.delete, {
                pk: userId,
                sk: this.deleteWalletId
            }).then(async () => {
                this.closeModal();
                await this.getWallets(userId);
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
                this.closeModal();
            });
        },
    },
    async mounted() {
        // Fetch the current user ID
        let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
        // Fetch Data from API
        await this.getWallets(userId);
    }
};
</script>
<style>
</style>
