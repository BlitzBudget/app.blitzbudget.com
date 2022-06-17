<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <card class="card" :header-classes="{ 'text-right': isRTL }">
                    <div class="row">
                        <div class="col-6">
                            <h5 slot="header" class="card-title">{{ $t('budget.get.title') }}</h5>
                        </div>
                        <div class="col-6">
                            <nuxt-link to="/budget/add" class="btn btn-primary pull-right">
                                {{ $t('budget.get.add-button') }}
                            </nuxt-link>
                        </div>
                    </div>
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