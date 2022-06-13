<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <nuxt-link to="/investment/add" class="btn btn-primary">
                        {{ $t('investment.get.add-button') }}
                    </nuxt-link>
                </div>
                <h5 slot="header" class="card-title">{{ $t('investment.get.title') }}</h5>
                <div class="table-responsive">
                    <display-investment></display-investment>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import DisplayInvestment from '@/components/Investments/DisplayInvestment';

export default {
    name: 'investment',
    components: {
        DisplayInvestment
    },
    computed: {
        isRTL() {
            return this.$rtl.isRTL;
        }
    }
}
</script>
<style>
</style>