<template>
    <div class="container pricing-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-6 ml-auto mr-auto text-center">
                <h1 class="title">Your Wallets</h1>
                <h4 class="description">
                    Choose your wallet to start organizing your finances.
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
                    <base-button slot="footer" round type="primary" class="btn-just-icon">
                        Get started
                    </base-button>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import WalletForm from '@/components/Wallets/AddForm.vue';

export default {
    name: 'validation-forms',
    layout: 'plain',
    components: {
        WalletForm,
    },
    data() {
        return {
            walletModels: []
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
        }
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
