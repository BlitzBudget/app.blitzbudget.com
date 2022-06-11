<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <nuxt-link to="/goal/add" class="btn btn-primary">
                        {{ $t('goal.get.add-button') }}
                    </nuxt-link>
                </div>
                <card class="card" :header-classes="{ 'text-right': isRTL }">
                    <h5 slot="header" class="card-title">{{ $t('goal.get.title') }}</h5>
                    <div class="table-responsive">
                        <display-goal></display-goal>
                    </div>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import DisplayGoal from '@/components/Goal/DisplayGoal';

export default {
    name: 'goal',
    components: {
        DisplayGoal
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