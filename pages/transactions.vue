<template>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <display-transactions></display-transactions>
            </div>
        </div>
    </div>
</template>
<script>
import DisplayTransactions from '@/components/Transactions/DisplayTransactions';

export default {
    name: 'transactions',
    components: {
        DisplayTransactions
    }
}
</script>
<style>
</style>
