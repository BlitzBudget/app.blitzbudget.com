<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <nuxt-link to="/debt/add" class="btn btn-primary">
                        {{ $t('debt.get.add-button') }}
                    </nuxt-link>
                </div>
                <h5 slot="header" class="card-title">{{ $t('debt.get.title') }}</h5>
                <div class="table-responsive">
                    <display-debt></display-debt>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import DisplayDebt from '@/components/Debts/DisplayDebt';

export default {
    name: 'debt',
    components: {
        DisplayDebt
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