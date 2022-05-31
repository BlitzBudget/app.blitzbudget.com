<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('category.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('category.add.name')" required v-model="model.name"
                    v-validate="modelValidations.name" :error="getError('name')" name="name" autofocus>
                </base-input>

                <base-input :label="$t('category.add.type')" required :error="getError('type')" name="type">
                    <el-select v-model="model.type" class="select-primary" name="type"
                        v-validate="modelValidations.type">
                        <el-option v-for="category in categoryTypes" class="select-primary" :label="category"
                            :value="category" :key="category"></el-option>
                    </el-select>
                </base-input>

                <div class="small form-category">{{ $t('category.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('category.add.submit')
                }}</base-button>
            </template>
        </card>
    </form>
</template>
<script>
import { Select, Option } from 'element-ui';

export default {
    components: {
        [Select.name]: Select,
        [Option.name]: Option
    },
    data() {
        return {
            model: {
                name: '',
                type: '',
            },
            modelValidations: {
                name: {
                    required: true
                },
                type: {
                    required: true
                }
            },
            categoryTypes: ["Expense", "Income"]
        };
    },
    methods: {
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        validate() {
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, userId);
            });
        }
    }
};
</script>
<style>
</style>
