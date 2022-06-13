<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <nuxt-link to="/budget/add" class="btn btn-primary">
                        {{ $t('budget.get.add-button') }}
                    </nuxt-link>
                </div>
                <card class="card" :header-classes="{ 'text-right': isRTL }">
                    <h5 slot="header" class="card-title">{{ $t('budget.get.title') }}</h5>
                    <div class="table-responsive">
                        <display-budget></display-budget>
                    </div>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import DisplayBudget from '@/components/Budget/DisplayBudget';

export default {
    name: 'budget',
    components: {
        DisplayBudget
    },
    computed: {
        isRTL() {
            return this.$rtl.isRTL;
        }
    }
}
</script>