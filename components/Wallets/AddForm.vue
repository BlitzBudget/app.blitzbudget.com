<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('wallet.add.title') }}</h4>
            </div>
            <div>
                <base-input :label="$t('wallet.add.name')" required v-model="model.name"
                    v-validate="modelValidations.name" :error="getError('name')" name="name" autofocus>
                </base-input>

                <base-input :label="$t('wallet.add.currency')" required :error="getError('currency')" name="currency">
                    <el-select v-model="model.currency" class="select-primary" name="currency"
                        v-validate="modelValidations.currency" autocomplete="on" :filterable="filterable"
                        :clearable="clearable">
                        <el-option v-for="currency in currencyNameToSymbol" class="select-primary"
                            :label="currency.currency" :value="currency.symbol" :key="currency.currency"></el-option>
                    </el-select>
                </base-input>

                <div class="small form-category">{{ $t('wallet.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                        $t('wallet.add.submit')
                }}</base-button>
                <nuxt-link class="float-right" to="/wallets">{{
                        $t('wallet.add.view')
                }}</nuxt-link>
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
            filterable: true,
            clearable: true,
            model: {
                name: '',
                currency: '',
            },
            modelValidations: {
                name: {
                    required: true
                },
                currency: {
                    required: true
                }
            },
            currencyNameToSymbol: [
                {
                    currency: 'Afghan Afghani',
                    symbol: '؋'
                },
                {
                    currency: 'Albanian Lek',
                    symbol: 'L'
                },
                {
                    currency: 'Algerian Dinar',
                    symbol: 'دج'
                },
                {
                    currency: 'US Dollar',
                    symbol: '$'
                },
                {
                    currency: 'Angolan Kwanza',
                    symbol: 'Kz'
                },
                {
                    currency: 'East Caribbean Dollar',
                    symbol: 'EC$'
                },
                {
                    currency: 'Argentine Peso',
                    symbol: 'ARS$'
                },
                {
                    currency: 'Armenian Dram',
                    symbol: '֏'
                },
                {
                    currency: 'Aruban Florin',
                    symbol: 'ƒ'
                },
                {
                    currency: 'Australian Dollar',
                    symbol: 'AU$'
                },
                {
                    currency: 'Azerbaijan Manat',
                    symbol: '₼'
                },
                {
                    currency: 'Bahamian Dollar',
                    symbol: 'B$'
                },
                {
                    currency: 'Bahraini Dinar',
                    symbol: '.د.ب'
                },
                {
                    currency: 'Bangladeshi Taka',
                    symbol: 'Tk'
                },
                {
                    currency: 'Barbados Dollar',
                    symbol: 'Bds$'
                },
                {
                    currency: 'Belarusian Ruble',
                    symbol: 'Br'
                },
                {
                    currency: 'Belize Dollar',
                    symbol: 'BZ$'
                },
                {
                    currency: 'CFA Franc',
                    symbol: 'CFA'
                },
                {
                    currency: 'Bermudian Dollar',
                    symbol: 'BD$'
                },
                {
                    currency: 'Bhutanese Ngultrum',
                    symbol: 'Nu.'
                },
                {
                    currency: 'Boliviano',
                    symbol: 'Bs'
                },
                {
                    currency: 'Convertible Mark',
                    symbol: 'KM'
                },
                {
                    currency: 'Pula',
                    symbol: 'P'
                },
                {
                    currency: 'Norwegian Krone',
                    symbol: 'kr'
                },
                {
                    currency: 'Brazilian Real',
                    symbol: 'R$'
                },
                {
                    currency: 'Brunei Dollar',
                    symbol: 'B$'
                },
                {
                    currency: 'Bulgarian Lev',
                    symbol: 'Лв.'
                },
                {
                    currency: 'CFA Franc BCEAO',
                    symbol: 'CFA'
                },
                {
                    currency: 'Burundi Franc',
                    symbol: 'FBu'
                },
                {
                    currency: 'Cape Verde Escudo',
                    symbol: 'Esc'
                },
                {
                    currency: 'Cambodian Riel',
                    symbol: '៛'
                },
                {
                    currency: 'CFA Franc BEAC',
                    symbol: 'FCFA'
                },
                {
                    currency: 'Canadian Dollar',
                    symbol: 'C$'
                },
                {
                    currency: 'Cayman Islands Dollar',
                    symbol: 'CI$'
                },
                {
                    currency: 'Chilean Peso',
                    symbol: 'CLP$'
                },
                {
                    currency: 'Renminbi (Yuan)',
                    symbol: '¥'
                },
                {
                    currency: 'Colombian Peso',
                    symbol: 'COL$'
                },
                {
                    currency: 'Comoro Franc',
                    symbol: 'CF'
                },
                {
                    currency: 'Franc Congolais',
                    symbol: 'FC'
                },
                {
                    currency: 'New Zealand Dollar',
                    symbol: 'NZ$'
                },
                {
                    currency: 'Costa Rican Colón',
                    symbol: '₡'
                },
                {
                    currency: 'Croatian Kuna',
                    symbol: 'kn'
                },
                {
                    currency: 'Cuban Peso',
                    symbol: '$MN'
                },
                {
                    currency: 'Antillean Guilder',
                    symbol: 'NAƒ'
                },
                {
                    currency: 'Czech Koruna',
                    symbol: 'Kč'
                },
                {
                    currency: 'Danish Kroner',
                    symbol: 'Kr.'
                },
                {
                    currency: 'Djibouti Franc',
                    symbol: 'Fdj'
                },
                {
                    currency: 'Dominican Peso',
                    symbol: 'RD$'
                },
                {
                    currency: 'Egyptian Pound',
                    symbol: 'E£'
                },
                {
                    currency: 'Euro',
                    symbol: '€'
                },
                {
                    currency: 'Nakfa',
                    symbol: 'Nfk'
                },
                {
                    currency: 'Swazi lilangeni',
                    symbol: 'L'
                },
                {
                    currency: 'Ethiopian Birr',
                    symbol: 'Br'
                },
                {
                    currency: 'Falkland Islands pound',
                    symbol: 'FK£'
                },
                {
                    currency: 'Faroese króna',
                    symbol: 'Kr.'
                },
                {
                    currency: 'Fiji Dollar',
                    symbol: 'FJ$'
                },
                {
                    currency: 'Dalasi',
                    symbol: 'D'
                },
                {
                    currency: 'Lari',
                    symbol: 'ლ'
                },
                {
                    currency: 'Cedi',
                    symbol: 'GH₵'
                },
                {
                    currency: 'Gibraltar Pound',
                    symbol: 'GIP£'
                },
                {
                    currency: 'Danish Krone',
                    symbol: 'Kr.'
                },
                {
                    currency: 'Quetzal',
                    symbol: 'GTQ'
                },
                {
                    currency: 'Guernsey pound',
                    symbol: 'GGP£'
                },
                {
                    currency: 'Guinea Franc',
                    symbol: 'FG'
                },
                {
                    currency: 'Guyana Dollar',
                    symbol: 'GY$'
                },
                {
                    currency: 'Haitian Gourde',
                    symbol: 'G'
                },
                {
                    currency: 'Lempira',
                    symbol: 'L'
                },
                {
                    currency: 'Hong Kong Dollar',
                    symbol: 'HK$'
                },
                {
                    currency: 'Forint',
                    symbol: 'Ft'
                },
                {
                    currency: 'Iceland Krona',
                    symbol: 'Íkr'
                },
                {
                    currency: 'Indian Rupee',
                    symbol: '₹'
                },
                {
                    currency: 'Rupiah',
                    symbol: 'Rp'
                },
                {
                    currency: 'Iranian Rial',
                    symbol: '﷼'
                },
                {
                    currency: 'Iraqi Dinar',
                    symbol: 'ع.د'
                },
                {
                    currency: 'Manx pound',
                    symbol: 'IMP£'
                },
                {
                    currency: 'New Israeli Sheqel',
                    symbol: '₪'
                },
                {
                    currency: 'Jamaican Dollar',
                    symbol: 'J$'
                },
                {
                    currency: 'Yen',
                    symbol: '円'
                },
                {
                    currency: 'Jersey pound',
                    symbol: 'JEP£'
                },
                {
                    currency: 'Jordanian Dinar',
                    symbol: 'د.أ'
                },
                {
                    currency: 'Tenge',
                    symbol: '₸'
                },
                {
                    currency: 'Kenyan Shilling',
                    symbol: 'K'
                },
                {
                    currency: 'North Korean Won',
                    symbol: '₩'
                },
                {
                    currency: 'Won',
                    symbol: '₩'
                },
                {
                    currency: 'Kuwaiti Dinar',
                    symbol: 'د.ك'
                },
                {
                    currency: 'Som',
                    symbol: 'Лв'
                },
                {
                    currency: 'Kip',
                    symbol: '₭'
                },
                {
                    currency: 'Lebanese Pound',
                    symbol: 'ل.ل.'
                },
                {
                    currency: 'Loti',
                    symbol: 'L'
                },
                {
                    currency: 'Liberian Dollar',
                    symbol: 'L$'
                },
                {
                    currency: 'Lybian Dinar',
                    symbol: 'ل.د'
                },
                {
                    currency: 'Macanese Pataca',
                    symbol: 'MOP$'
                },
                {
                    currency: 'Malagasy Franc',
                    symbol: 'Ar'
                },
                {
                    currency: 'Kwacha',
                    symbol: 'MK'
                },
                {
                    currency: 'Malaysian Ringgit',
                    symbol: 'RM'
                },
                {
                    currency: 'Rufiyaa',
                    symbol: '.ރ'
                },
                {
                    currency: 'Ouguiya',
                    symbol: 'UM'
                },
                {
                    currency: 'Mauritius Rupee',
                    symbol: '₨'
                },
                {
                    currency: 'Mexican Peso',
                    symbol: 'Mex$'
                },
                {
                    currency: 'Moldovan Leu',
                    symbol: 'L'
                },
                {
                    currency: 'Mongolia Tughrik',
                    symbol: '₮'
                },
                {
                    currency: 'Mozambican Metical',
                    symbol: 'MT'
                },
                {
                    currency: 'Burmese Kyat',
                    symbol: 'K'
                },
                {
                    currency: 'Namibia Dollar',
                    symbol: 'N$'
                },
                {
                    currency: 'Nepalese Rupee',
                    symbol: 'रू'
                },
                {
                    currency: 'CFP Franc',
                    symbol: 'F'
                },
                {
                    currency: 'Nicaraguan Córdoba',
                    symbol: 'C$'
                },
                {
                    currency: 'West African CFA Franc',
                    symbol: 'CFA'
                },
                {
                    currency: 'Nigerian Naira',
                    symbol: '₦'
                },
                {
                    currency: 'Macedonian Denar',
                    symbol: 'Ден'
                },
                {
                    currency: 'Omani Rial',
                    symbol: '﷼.'
                },
                {
                    currency: 'Pakistan Rupee',
                    symbol: 'Rp'
                },
                {
                    currency: 'Panamanian Balboa',
                    symbol: 'B/.'
                },
                {
                    currency: 'Papua New Guinean Kina',
                    symbol: 'K'
                },
                {
                    currency: 'Paraguayan Guarani',
                    symbol: '₲'
                },
                {
                    currency: 'Peruvian (Nuevo) Sol',
                    symbol: 'S/'
                },
                {
                    currency: 'Philippine Peso',
                    symbol: '₱'
                },
                {
                    currency: 'Polish Zloty (złoty)',
                    symbol: 'zł'
                },
                {
                    currency: 'Qatari Rial',
                    symbol: 'ر.ق'
                },
                {
                    currency: 'Leu',
                    symbol: 'lei'
                },
                {
                    currency: 'Russian Ruble',
                    symbol: '₽'
                },
                {
                    currency: 'Rwanda Franc',
                    symbol: 'RF'
                },
                {
                    currency: 'Saint Helena Pound',
                    symbol: 'SHP£'
                },
                {
                    currency: 'Tala',
                    symbol: 'WS$'
                },
                {
                    currency: 'Dobra',
                    symbol: 'Db'
                },
                {
                    currency: 'Saudi Riyal',
                    symbol: '﷼'
                },
                {
                    currency: 'Serbian Dinar',
                    symbol: 'din'
                },
                {
                    currency: 'Seychelles Rupee',
                    symbol: 'SRe'
                },
                {
                    currency: 'Leone',
                    symbol: 'Le'
                },
                {
                    currency: 'Singapore Dollar',
                    symbol: 'S$'
                },
                {
                    currency: 'Solomon Islands Dollar',
                    symbol: 'Si$'
                },
                {
                    currency: 'Somali Shilling',
                    symbol: 'Sh.so.'
                },
                {
                    currency: 'Rand',
                    symbol: 'R'
                },
                {
                    currency: 'South Sudanese pound',
                    symbol: 'ج.س.'
                },
                {
                    currency: 'Sri Lanka Rupee',
                    symbol: 'ரூ'
                },
                {
                    currency: 'Sudanese Pound',
                    symbol: 'ج.س.'
                },
                {
                    currency: 'Suriname Guilder',
                    symbol: 'Sr$'
                },
                {
                    currency: 'Lilangeni',
                    symbol: 'kr.'
                },
                {
                    currency: 'Swedish Krona',
                    symbol: 'kr'
                },
                {
                    currency: 'Swiss Franc',
                    symbol: 'Fr'
                },
                {
                    currency: 'Syrian Pound',
                    symbol: '£S'
                },
                {
                    currency: 'New Taiwan Dollar',
                    symbol: 'NT$'
                },
                {
                    currency: 'Somoni',
                    symbol: 'ЅM'
                },
                {
                    currency: 'Tanzanian Shilling',
                    symbol: 'TSh'
                },
                {
                    currency: 'Thai Baht',
                    symbol: '฿'
                },
                {
                    currency: 'Paʻanga',
                    symbol: 'T$'
                },
                {
                    currency: 'Trinidad and Tobago Dollar',
                    symbol: 'TT$'
                },
                {
                    currency: 'Tunisian Dinar',
                    symbol: 'TD'
                },
                {
                    currency: 'Turkish Lira',
                    symbol: '₺'
                },
                {
                    currency: 'Manat',
                    symbol: 'T'
                },
                {
                    currency: 'Tuvaluan Dollar',
                    symbol: 'TV$'
                },
                {
                    currency: 'Uganda Shilling',
                    symbol: 'USh'
                },
                {
                    currency: 'Ukrainian Hryvnia',
                    symbol: '₴'
                },
                {
                    currency: 'UAE Dirham',
                    symbol: 'د.إ'
                },
                {
                    currency: 'Pound Sterling',
                    symbol: '£'
                },
                {
                    currency: 'Uruguayan Peso',
                    symbol: '$U'
                },
                {
                    currency: 'Uzbekistan Sum',
                    symbol: 'so\'m'
                },
                {
                    currency: 'Vanuatu Vatu',
                    symbol: 'VT'
                },
                {
                    currency: 'Venezuelan Bolívar',
                    symbol: 'Bs'
                },
                {
                    currency: 'Vietnamese Dong',
                    symbol: '₫'
                },
                {
                    currency: 'Moroccan Dirham',
                    symbol: 'MAD'
                },
                {
                    currency: 'Yemeni Rial',
                    symbol: '﷼.'
                },
                {
                    currency: 'Zambian Kwacha',
                    symbol: 'ZK'
                },
                {
                    currency: 'Zimbabwe Dollar',
                    symbol: 'Z$'
                }
            ]
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
