<template>
    <div class="container pricing-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-6 ml-auto mr-auto text-center">
                <h1 class="title">{{ $t('transaction.link.get.title') }}</h1>
                <h4 class="description">
                    {{ $t('transaction.link.get.description') }}
                </h4>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-3 col-md-6 px-1" v-for="link in smartLinks" :key="link.name">
                <card type="pricing" class="card-primary" footer-classes="text-center mb-3 mt-3"
                    :data-target="link.name">
                    <h1 class="card-title">{{ link.name }}</h1>
                    <img class="card-img" src="/img/card-primary.png" alt="Image" />
                    <ul class="list-group">
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                        <li class="list-group-item"></li>
                    </ul>
                    <div class="card-prices">
                        <h3 class="text-on-front"><span></span>{{ link.name }}</h3>
                        <h5 class="text-on-back"></h5>
                        <p class="plan"></p>
                    </div>
                    <nuxt-link slot="footer" round type="primary" class="btn-just-icon btn-primary btn btn-round"
                        :to="{ path: link.url, query: { investment_id: $route.query.investment_id, transaction_description: $route.query.transaction_description, transaction_amount: $route.query.transaction_amount } }">
                        {{ link.button }}
                    </nuxt-link>
                </card>
            </div>
        </div>
    </div>
</template>
<script>

export default {
    name: 'transaction-link',
    layout: 'plain',
    data() {
        return {
            smartLinks: [
                {
                    name: "Invest",
                    url: '/investment/link/add',
                    button: this.$t('transaction.link.get.investmentButton')
                },
                {
                    name: "Goals",
                    url: '/goal/link/add',
                    button: this.$t('transaction.link.get.goalButton')
                },
                {
                    name: "Debt",
                    url: '/debt/link/add',
                    button: this.$t('transaction.link.get.debtButton')
                },
                {
                    name: "Category",
                    url: '/category/link/add',
                    button: this.$t('transaction.link.get.categoryButton')
                }
            ]
        }
    }
}
</script>
<style>
</style>
