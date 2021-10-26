/*
* localeToCountry Object which maps the relationship between locale and country code
* as per "ISO 3166-1 alpha-2" which satisfies "CloudFront-Viewer-Country" header for lambda executions
*/
// JSON equivalent
// {"localeToCountry":[{"country":"AF","name":"Afghanistan"},{"country":"AX","name":"Åland Islands"},{"country":"AL","name":"Albania"},{"country":"DZ","name":"Algeria"},{"country":"AS","name":"American Samoa"},{"country":"AD","name":"Andorra"},{"country":"AO","name":"Angola"},{"country":"AI","name":"Anguilla"},{"country":"AQ","name":"Antartica"},{"country":"AG","name":"Antigua and Barbuda"},{"country":"AR","name":"Argentina"},{"country":"AM","name":"Armenia"},{"country":"AW","name":"Aruba"},{"country":"AU","name":"Australia"},{"country":"AT","name":"Austria"},{"country":"AZ","name":"Azerbaijan"},{"country":"BS","name":"Bahamas"},{"country":"BH","name":"Bahrain"},{"country":"BD","name":"Bangladesh"},{"country":"BB","name":"Barbados"},{"country":"BY","name":"Belarus"},{"country":"BE","name":"Belgium"},{"country":"BZ","name":"Belize"},{"country":"BJ","name":"Benin"},{"country":"BM","name":"Bermuda"},{"country":"BT","name":"Bhutan"},{"country":"BO","name":"Bolivia (Plurinational State of)"},{"country":"BQ","name":"Bonaire, Sint Eustatius and Saba"},{"country":"BA","name":"Bosnia and Herzegovina"},{"country":"BW","name":"Botswana"},{"country":"BV","name":"Bouvet Island"},{"country":"BR","name":"Brazil"},{"country":"IO","name":"British Indian Ocean Territory"},{"country":"BN","name":"Brunei Darussalam"},{"country":"BG","name":"Bulgaria"},{"country":"BF","name":"Burkina Faso"},{"country":"BI","name":"Burundi"},{"country":"CV","name":"Cabo Verde"},{"country":"KH","name":"Cambodia"},{"country":"CM","name":"Cameroon"},{"country":"CA","name":"Canada"},{"country":"KY","name":"Cayman Islands"},{"country":"CF","name":"Central African Republic"},{"country":"TD","name":"Chad"},{"country":"CL","name":"Chile"},{"country":"CN","name":"China"},{"country":"CX","name":"Christmas Island"},{"country":"CC","name":"Cocos (Keeling) Islands"},{"country":"CO","name":"Colombia"},{"country":"KM","name":"Comoros"},{"country":"CG","name":"Congo"},{"country":"CD","name":"Congo, Democratic Republic of the"},{"country":"CK","name":"Cook Islands"},{"country":"CR","name":"Costa Rica"},{"country":"CI","name":"Côte d'Ivoire"},{"country":"HR","name":"Croatia"},{"country":"CU","name":"Cuba"},{"country":"CW","name":"Curaçao"},{"country":"CY","name":"Cyprus"},{"country":"CZ","name":"Czechia"},{"country":"DK","name":"Denmark"},{"country":"DJ","name":"Djibouti"},{"country":"DM","name":"Dominica"},{"country":"DO","name":"Dominican Republic"},{"country":"EC","name":"Ecuador"},{"country":"EG","name":"Egypt"},{"country":"SV","name":"El Salvador"},{"country":"GQ","name":"Equatorial Guinea"},{"country":"ER","name":"Eritrea"},{"country":"EE","name":"Estonia"},{"country":"SZ","name":"Eswatini"},{"country":"ET","name":"Ethiopia"},{"country":"FK","name":"Falkland Islands (Malvinas)"},{"country":"FO","name":"Faroe Islands"},{"country":"FJ","name":"Fiji"},{"country":"FI","name":"Finland"},{"country":"FR","name":"France"},{"country":"GF","name":"French Guiana"},{"country":"PF","name":"French Polynesia"},{"country":"TF","name":"French Southern Territories"},{"country":"GA","name":"Gabon"},{"country":"GM","name":"Gambia"},{"country":"GE","name":"Georgia"},{"country":"DE","name":"Germany"},{"country":"GH","name":"Ghana"},{"country":"GI","name":"Gibraltar"},{"country":"GR","name":"Greece"},{"country":"GL","name":"Greenland"},{"country":"GD","name":"Grenada"},{"country":"GP","name":"Guadeloupe"},{"country":"GU","name":"Guam"},{"country":"GT","name":"Guatemala"},{"country":"GG","name":"Guernsey"},{"country":"GN","name":"Guinea"},{"country":"GW","name":"Guinea-Bissau"},{"country":"GY","name":"Guyana"},{"country":"HT","name":"Haiti"},{"country":"HM","name":"Heard Island and McDonald Islands"},{"country":"VA","name":"Holy See"},{"country":"HN","name":"Honduras"},{"country":"HK","name":"Hong Kong"},{"country":"HU","name":"Hungary"},{"country":"IS","name":"Iceland"},{"country":"IN","name":"India"},{"country":"ID","name":"Indonesia"},{"country":"IR","name":"Iran (Islamic Republic of)"},{"country":"IQ","name":"Iraq"},{"country":"IE","name":"Ireland"},{"country":"IM","name":"Isle of Man"},{"country":"IL","name":"Israel"},{"country":"IT","name":"Italy"},{"country":"JM","name":"Jamaica"},{"country":"JP","name":"Japan"},{"country":"JE","name":"Jersey"},{"country":"JO","name":"Jordan"},{"country":"KZ","name":"Kazakhstan"},{"country":"KE","name":"Kenya"},{"country":"KI","name":"Kiribati"},{"country":"KP","name":"Korea (Democratic People's Republic of)"},{"country":"KR","name":"Korea, Republic of"},{"country":"KW","name":"Kuwait"},{"country":"KG","name":"Kyrgyzstan"},{"country":"LA","name":"Lao People's Democratic Republic"},{"country":"LV","name":"Latvia"},{"country":"LB","name":"Lebanon"},{"country":"LS","name":"Lesotho"},{"country":"LR","name":"Liberia"},{"country":"LY","name":"Libya"},{"country":"LI","name":"Liechtenstein"},{"country":"LT","name":"Lithuania"},{"country":"LU","name":"Luxembourg"},{"country":"MO","name":"Macao"},{"country":"MG","name":"Madagascar"},{"country":"MW","name":"Malawi"},{"country":"MY","name":"Malaysia"},{"country":"MV","name":"Maldives"},{"country":"ML","name":"Mali"},{"country":"MT","name":"Malta"},{"country":"MH","name":"Marshall Islands"},{"country":"MQ","name":"Martinique"},{"country":"MR","name":"Mauritania"},{"country":"MU","name":"Mauritius"},{"country":"YT","name":"Mayotte"},{"country":"MX","name":"Mexico"},{"country":"FM","name":"Micronesia (Federated States of)"},{"country":"MD","name":"Moldova, Republic of"},{"country":"MC","name":"Monaco"},{"country":"MN","name":"Mongolia"},{"country":"ME","name":"Montenegro"},{"country":"MS","name":"Montserrat"},{"country":"MA","name":"Morocco"},{"country":"MZ","name":"Mozambique"},{"country":"MM","name":"Myanmar"},{"country":"NA","name":"Namibia"},{"country":"NR","name":"Nauru"},{"country":"NP","name":"Nepal"},{"country":"NL","name":"Netherlands"},{"country":"NC","name":"New Caledonia"},{"country":"NZ","name":"New Zealand"},{"country":"NI","name":"Nicaragua"},{"country":"NE","name":"Niger"},{"country":"NG","name":"Nigeria"},{"country":"NU","name":"Niue"},{"country":"NF","name":"Norfolk Island"},{"country":"MK","name":"North Macedonia"},{"country":"MP","name":"Northern Mariana Islands"},{"country":"NO","name":"Norway"},{"country":"OM","name":"Oman"},{"country":"PK","name":"Pakistan"},{"country":"PW","name":"Palau"},{"country":"PS","name":"Palestine, State of"},{"country":"PA","name":"Panama"},{"country":"PG","name":"Papua New Guinea"},{"country":"PY","name":"Paraguay"},{"country":"PE","name":"Peru"},{"country":"PH","name":"Philippines"},{"country":"PN","name":"Pitcairn"},{"country":"PL","name":"Poland"},{"country":"PT","name":"Portugal"},{"country":"PR","name":"Puerto Rico"},{"country":"QA","name":"Qatar"},{"country":"RE","name":"Réunion"},{"country":"RO","name":"Romania"},{"country":"RU","name":"Russian Federation"},{"country":"RW","name":"Rwanda"},{"country":"BL","name":"Saint Barthélemy"},{"country":"SH","name":"Saint Helena, Ascension and Tristan da Cunha"},{"country":"KN","name":"Saint Kitts and Nevis"},{"country":"LC","name":"Saint Lucia"},{"country":"MF","name":"Saint Martin (French part)"},{"country":"PM","name":"Saint Pierre and Miquelon"},{"country":"VC","name":"Saint Vincent and the Grenadines"},{"country":"WS","name":"Samoa"},{"country":"SM","name":"San Marino"},{"country":"ST","name":"Sao Tome and Principe"},{"country":"SA","name":"Saudi Arabia"},{"country":"SN","name":"Senegal"},{"country":"RS","name":"Serbia"},{"country":"SC","name":"Seychelles"},{"country":"SL","name":"Sierra Leone"},{"country":"SG","name":"Singapore"},{"country":"SX","name":"Sint Maarten (Dutch part)"},{"country":"SK","name":"Slovakia"},{"country":"SI","name":"Slovenia"},{"country":"SB","name":"Solomon Islands"},{"country":"SO","name":"Somalia"},{"country":"ZA","name":"South Africa"},{"country":"GS","name":"South Georgia and the South Sandwich Islands"},{"country":"SS","name":"South Sudan"},{"country":"ES","name":"Spain"},{"country":"LK","name":"Sri Lanka"},{"country":"SD","name":"Sudan"},{"country":"SR","name":"Suriname"},{"country":"SJ","name":"Svalbard and Jan Mayen"},{"country":"SE","name":"Sweden"},{"country":"CH","name":"Switzerland"},{"country":"SY","name":"Syrian Arab Republic"},{"country":"TW","name":"Taiwan, Province of China"},{"country":"TJ","name":"Tajikistan"},{"country":"TZ","name":"Tanzania, United Republic of"},{"country":"TH","name":"Thailand"},{"country":"TL","name":"Timor-Leste"},{"country":"TG","name":"Togo"},{"country":"TK","name":"Tokelau"},{"country":"TO","name":"Tonga"},{"country":"TT","name":"Trinidad and Tobago"},{"country":"TN","name":"Tunisia"},{"country":"TR","name":"Turkey"},{"country":"TM","name":"Turkmenistan"},{"country":"TC","name":"Turks and Caicos Islands"},{"country":"TV","name":"Tuvalu"},{"country":"UG","name":"Uganda"},{"country":"UA","name":"Ukraine"},{"country":"AE","name":"United Arab Emirates"},{"country":"GB","name":"United Kingdom of Great Britain and Northern Ireland"},{"country":"UM","name":"United States Minor Outlying Islands"},{"country":"US","name":"United States of America"},{"country":"UY","name":"Uruguay"},{"country":"UZ","name":"Uzbekistan"},{"country":"VU","name":"Vanuatu"},{"country":"VE","name":"Venezuela (Bolivarian Republic of)"},{"country":"VN","name":"Viet Nam"},{"country":"VG","name":"Virgin Islands (British)"},{"country":"VI","name":"Virgin Islands (U.S.)"},{"country":"WF","name":"Wallis and Futuna"},{"country":"EH","name":"Western Sahara"},{"country":"YE","name":"Yemen"},{"country":"ZM","name":"Zambia"},{"country":"ZW","name":"Zimbabwe"}]}
window.localeToCountry = {
  localeToCountry: [
    {
      country: 'AF',
      name: 'Afghanistan'
    },
    {
      country: 'AX',
      name: 'Åland Islands'
    },
    {
      country: 'AL',
      name: 'Albania'
    },
    {
      country: 'DZ',
      name: 'Algeria'
    },
    {
      country: 'AS',
      name: 'American Samoa'
    },
    {
      country: 'AD',
      name: 'Andorra'
    },
    {
      country: 'AO',
      name: 'Angola'
    },
    {
      country: 'AI',
      name: 'Anguilla'
    },
    {
      country: 'AQ',
      name: 'Antartica'
    },
    {
      country: 'AG',
      name: 'Antigua and Barbuda'
    },
    {
      country: 'AR',
      name: 'Argentina'
    },
    {
      country: 'AM',
      name: 'Armenia'
    },
    {
      country: 'AW',
      name: 'Aruba'
    },
    {
      country: 'AU',
      name: 'Australia'
    },
    {
      country: 'AT',
      name: 'Austria'
    },
    {
      country: 'AZ',
      name: 'Azerbaijan'
    },
    {
      country: 'BS',
      name: 'Bahamas'
    },
    {
      country: 'BH',
      name: 'Bahrain'
    },
    {
      country: 'BD',
      name: 'Bangladesh'
    },
    {
      country: 'BB',
      name: 'Barbados'
    },
    {
      country: 'BY',
      name: 'Belarus'
    },
    {
      country: 'BE',
      name: 'Belgium'
    },
    {
      country: 'BZ',
      name: 'Belize'
    },
    {
      country: 'BJ',
      name: 'Benin'
    },
    {
      country: 'BM',
      name: 'Bermuda'
    },
    {
      country: 'BT',
      name: 'Bhutan'
    },
    {
      country: 'BO',
      name: 'Bolivia (Plurinational State of)'
    },
    {
      country: 'BQ',
      name: 'Bonaire, Sint Eustatius and Saba'
    },
    {
      country: 'BA',
      name: 'Bosnia and Herzegovina'
    },
    {
      country: 'BW',
      name: 'Botswana'
    },
    {
      country: 'BV',
      name: 'Bouvet Island'
    },
    {
      country: 'BR',
      name: 'Brazil'
    },
    {
      country: 'IO',
      name: 'British Indian Ocean Territory'
    },
    {
      country: 'BN',
      name: 'Brunei Darussalam'
    },
    {
      country: 'BG',
      name: 'Bulgaria'
    },
    {
      country: 'BF',
      name: 'Burkina Faso'
    },
    {
      country: 'BI',
      name: 'Burundi'
    },
    {
      country: 'CV',
      name: 'Cabo Verde'
    },
    {
      country: 'KH',
      name: 'Cambodia'
    },
    {
      country: 'CM',
      name: 'Cameroon'
    },
    {
      country: 'CA',
      name: 'Canada'
    },
    {
      country: 'KY',
      name: 'Cayman Islands'
    },
    {
      country: 'CF',
      name: 'Central African Republic'
    },
    {
      country: 'TD',
      name: 'Chad'
    },
    {
      country: 'CL',
      name: 'Chile'
    },
    {
      country: 'CN',
      name: 'China'
    },
    {
      country: 'CX',
      name: 'Christmas Island'
    },
    {
      country: 'CC',
      name: 'Cocos (Keeling) Islands'
    },
    {
      country: 'CO',
      name: 'Colombia'
    },
    {
      country: 'KM',
      name: 'Comoros'
    },
    {
      country: 'CG',
      name: 'Congo'
    },
    {
      country: 'CD',
      name: 'Congo, Democratic Republic of the'
    },
    {
      country: 'CK',
      name: 'Cook Islands'
    },
    {
      country: 'CR',
      name: 'Costa Rica'
    },
    {
      country: 'CI',
      name: 'Côte d\'Ivoire'
    },
    {
      country: 'HR',
      name: 'Croatia'
    },
    {
      country: 'CU',
      name: 'Cuba'
    },
    {
      country: 'CW',
      name: 'Curaçao'
    },
    {
      country: 'CY',
      name: 'Cyprus'
    },
    {
      country: 'CZ',
      name: 'Czechia'
    },
    {
      country: 'DK',
      name: 'Denmark'
    },
    {
      country: 'DJ',
      name: 'Djibouti'
    },
    {
      country: 'DM',
      name: 'Dominica'
    },
    {
      country: 'DO',
      name: 'Dominican Republic'
    },
    {
      country: 'EC',
      name: 'Ecuador'
    },
    {
      country: 'EG',
      name: 'Egypt'
    },
    {
      country: 'SV',
      name: 'El Salvador'
    },
    {
      country: 'GQ',
      name: 'Equatorial Guinea'
    },
    {
      country: 'ER',
      name: 'Eritrea'
    },
    {
      country: 'EE',
      name: 'Estonia'
    },
    {
      country: 'SZ',
      name: 'Eswatini'
    },
    {
      country: 'ET',
      name: 'Ethiopia'
    },
    {
      country: 'FK',
      name: 'Falkland Islands (Malvinas)'
    },
    {
      country: 'FO',
      name: 'Faroe Islands'
    },
    {
      country: 'FJ',
      name: 'Fiji'
    },
    {
      country: 'FI',
      name: 'Finland'
    },
    {
      country: 'FR',
      name: 'France'
    },
    {
      country: 'GF',
      name: 'French Guiana'
    },
    {
      country: 'PF',
      name: 'French Polynesia'
    },
    {
      country: 'TF',
      name: 'French Southern Territories'
    },
    {
      country: 'GA',
      name: 'Gabon'
    },
    {
      country: 'GM',
      name: 'Gambia'
    },
    {
      country: 'GE',
      name: 'Georgia'
    },
    {
      country: 'DE',
      name: 'Germany'
    },
    {
      country: 'GH',
      name: 'Ghana'
    },
    {
      country: 'GI',
      name: 'Gibraltar'
    },
    {
      country: 'GR',
      name: 'Greece'
    },
    {
      country: 'GL',
      name: 'Greenland'
    },
    {
      country: 'GD',
      name: 'Grenada'
    },
    {
      country: 'GP',
      name: 'Guadeloupe'
    },
    {
      country: 'GU',
      name: 'Guam'
    },
    {
      country: 'GT',
      name: 'Guatemala'
    },
    {
      country: 'GG',
      name: 'Guernsey'
    },
    {
      country: 'GN',
      name: 'Guinea'
    },
    {
      country: 'GW',
      name: 'Guinea-Bissau'
    },
    {
      country: 'GY',
      name: 'Guyana'
    },
    {
      country: 'HT',
      name: 'Haiti'
    },
    {
      country: 'HM',
      name: 'Heard Island and McDonald Islands'
    },
    {
      country: 'VA',
      name: 'Holy See'
    },
    {
      country: 'HN',
      name: 'Honduras'
    },
    {
      country: 'HK',
      name: 'Hong Kong'
    },
    {
      country: 'HU',
      name: 'Hungary'
    },
    {
      country: 'IS',
      name: 'Iceland'
    },
    {
      country: 'IN',
      name: 'India'
    },
    {
      country: 'ID',
      name: 'Indonesia'
    },
    {
      country: 'IR',
      name: 'Iran (Islamic Republic of)'
    },
    {
      country: 'IQ',
      name: 'Iraq'
    },
    {
      country: 'IE',
      name: 'Ireland'
    },
    {
      country: 'IM',
      name: 'Isle of Man'
    },
    {
      country: 'IL',
      name: 'Israel'
    },
    {
      country: 'IT',
      name: 'Italy'
    },
    {
      country: 'JM',
      name: 'Jamaica'
    },
    {
      country: 'JP',
      name: 'Japan'
    },
    {
      country: 'JE',
      name: 'Jersey'
    },
    {
      country: 'JO',
      name: 'Jordan'
    },
    {
      country: 'KZ',
      name: 'Kazakhstan'
    },
    {
      country: 'KE',
      name: 'Kenya'
    },
    {
      country: 'KI',
      name: 'Kiribati'
    },
    {
      country: 'KP',
      name: 'Korea (Democratic People\'s Republic of)'
    },
    {
      country: 'KR',
      name: 'Korea, Republic of'
    },
    {
      country: 'KW',
      name: 'Kuwait'
    },
    {
      country: 'KG',
      name: 'Kyrgyzstan'
    },
    {
      country: 'LA',
      name: 'Lao People\'s Democratic Republic'
    },
    {
      country: 'LV',
      name: 'Latvia'
    },
    {
      country: 'LB',
      name: 'Lebanon'
    },
    {
      country: 'LS',
      name: 'Lesotho'
    },
    {
      country: 'LR',
      name: 'Liberia'
    },
    {
      country: 'LY',
      name: 'Libya'
    },
    {
      country: 'LI',
      name: 'Liechtenstein'
    },
    {
      country: 'LT',
      name: 'Lithuania'
    },
    {
      country: 'LU',
      name: 'Luxembourg'
    },
    {
      country: 'MO',
      name: 'Macao'
    },
    {
      country: 'MG',
      name: 'Madagascar'
    },
    {
      country: 'MW',
      name: 'Malawi'
    },
    {
      country: 'MY',
      name: 'Malaysia'
    },
    {
      country: 'MV',
      name: 'Maldives'
    },
    {
      country: 'ML',
      name: 'Mali'
    },
    {
      country: 'MT',
      name: 'Malta'
    },
    {
      country: 'MH',
      name: 'Marshall Islands'
    },
    {
      country: 'MQ',
      name: 'Martinique'
    },
    {
      country: 'MR',
      name: 'Mauritania'
    },
    {
      country: 'MU',
      name: 'Mauritius'
    },
    {
      country: 'YT',
      name: 'Mayotte'
    },
    {
      country: 'MX',
      name: 'Mexico'
    },
    {
      country: 'FM',
      name: 'Micronesia (Federated States of)'
    },
    {
      country: 'MD',
      name: 'Moldova, Republic of'
    },
    {
      country: 'MC',
      name: 'Monaco'
    },
    {
      country: 'MN',
      name: 'Mongolia'
    },
    {
      country: 'ME',
      name: 'Montenegro'
    },
    {
      country: 'MS',
      name: 'Montserrat'
    },
    {
      country: 'MA',
      name: 'Morocco'
    },
    {
      country: 'MZ',
      name: 'Mozambique'
    },
    {
      country: 'MM',
      name: 'Myanmar'
    },
    {
      country: 'NA',
      name: 'Namibia'
    },
    {
      country: 'NR',
      name: 'Nauru'
    },
    {
      country: 'NP',
      name: 'Nepal'
    },
    {
      country: 'NL',
      name: 'Netherlands'
    },
    {
      country: 'NC',
      name: 'New Caledonia'
    },
    {
      country: 'NZ',
      name: 'New Zealand'
    },
    {
      country: 'NI',
      name: 'Nicaragua'
    },
    {
      country: 'NE',
      name: 'Niger'
    },
    {
      country: 'NG',
      name: 'Nigeria'
    },
    {
      country: 'NU',
      name: 'Niue'
    },
    {
      country: 'NF',
      name: 'Norfolk Island'
    },
    {
      country: 'MK',
      name: 'North Macedonia'
    },
    {
      country: 'MP',
      name: 'Northern Mariana Islands'
    },
    {
      country: 'NO',
      name: 'Norway'
    },
    {
      country: 'OM',
      name: 'Oman'
    },
    {
      country: 'PK',
      name: 'Pakistan'
    },
    {
      country: 'PW',
      name: 'Palau'
    },
    {
      country: 'PS',
      name: 'Palestine, State of'
    },
    {
      country: 'PA',
      name: 'Panama'
    },
    {
      country: 'PG',
      name: 'Papua New Guinea'
    },
    {
      country: 'PY',
      name: 'Paraguay'
    },
    {
      country: 'PE',
      name: 'Peru'
    },
    {
      country: 'PH',
      name: 'Philippines'
    },
    {
      country: 'PN',
      name: 'Pitcairn'
    },
    {
      country: 'PL',
      name: 'Poland'
    },
    {
      country: 'PT',
      name: 'Portugal'
    },
    {
      country: 'PR',
      name: 'Puerto Rico'
    },
    {
      country: 'QA',
      name: 'Qatar'
    },
    {
      country: 'RE',
      name: 'Réunion'
    },
    {
      country: 'RO',
      name: 'Romania'
    },
    {
      country: 'RU',
      name: 'Russian Federation'
    },
    {
      country: 'RW',
      name: 'Rwanda'
    },
    {
      country: 'BL',
      name: 'Saint Barthélemy'
    },
    {
      country: 'SH',
      name: 'Saint Helena, Ascension and Tristan da Cunha'
    },
    {
      country: 'KN',
      name: 'Saint Kitts and Nevis'
    },
    {
      country: 'LC',
      name: 'Saint Lucia'
    },
    {
      country: 'MF',
      name: 'Saint Martin (French part)'
    },
    {
      country: 'PM',
      name: 'Saint Pierre and Miquelon'
    },
    {
      country: 'VC',
      name: 'Saint Vincent and the Grenadines'
    },
    {
      country: 'WS',
      name: 'Samoa'
    },
    {
      country: 'SM',
      name: 'San Marino'
    },
    {
      country: 'ST',
      name: 'Sao Tome and Principe'
    },
    {
      country: 'SA',
      name: 'Saudi Arabia'
    },
    {
      country: 'SN',
      name: 'Senegal'
    },
    {
      country: 'RS',
      name: 'Serbia'
    },
    {
      country: 'SC',
      name: 'Seychelles'
    },
    {
      country: 'SL',
      name: 'Sierra Leone'
    },
    {
      country: 'SG',
      name: 'Singapore'
    },
    {
      country: 'SX',
      name: 'Sint Maarten (Dutch part)'
    },
    {
      country: 'SK',
      name: 'Slovakia'
    },
    {
      country: 'SI',
      name: 'Slovenia'
    },
    {
      country: 'SB',
      name: 'Solomon Islands'
    },
    {
      country: 'SO',
      name: 'Somalia'
    },
    {
      country: 'ZA',
      name: 'South Africa'
    },
    {
      country: 'GS',
      name: 'South Georgia and the South Sandwich Islands'
    },
    {
      country: 'SS',
      name: 'South Sudan'
    },
    {
      country: 'ES',
      name: 'Spain'
    },
    {
      country: 'LK',
      name: 'Sri Lanka'
    },
    {
      country: 'SD',
      name: 'Sudan'
    },
    {
      country: 'SR',
      name: 'Suriname'
    },
    {
      country: 'SJ',
      name: 'Svalbard and Jan Mayen'
    },
    {
      country: 'SE',
      name: 'Sweden'
    },
    {
      country: 'CH',
      name: 'Switzerland'
    },
    {
      country: 'SY',
      name: 'Syrian Arab Republic'
    },
    {
      country: 'TW',
      name: 'Taiwan, Province of China'
    },
    {
      country: 'TJ',
      name: 'Tajikistan'
    },
    {
      country: 'TZ',
      name: 'Tanzania, United Republic of'
    },
    {
      country: 'TH',
      name: 'Thailand'
    },
    {
      country: 'TL',
      name: 'Timor-Leste'
    },
    {
      country: 'TG',
      name: 'Togo'
    },
    {
      country: 'TK',
      name: 'Tokelau'
    },
    {
      country: 'TO',
      name: 'Tonga'
    },
    {
      country: 'TT',
      name: 'Trinidad and Tobago'
    },
    {
      country: 'TN',
      name: 'Tunisia'
    },
    {
      country: 'TR',
      name: 'Turkey'
    },
    {
      country: 'TM',
      name: 'Turkmenistan'
    },
    {
      country: 'TC',
      name: 'Turks and Caicos Islands'
    },
    {
      country: 'TV',
      name: 'Tuvalu'
    },
    {
      country: 'UG',
      name: 'Uganda'
    },
    {
      country: 'UA',
      name: 'Ukraine'
    },
    {
      country: 'AE',
      name: 'United Arab Emirates'
    },
    {
      country: 'GB',
      name: 'United Kingdom of Great Britain and Northern Ireland'
    },
    {
      country: 'UM',
      name: 'United States Minor Outlying Islands'
    },
    {
      country: 'US',
      name: 'United States of America'
    },
    {
      country: 'UY',
      name: 'Uruguay'
    },
    {
      country: 'UZ',
      name: 'Uzbekistan'
    },
    {
      country: 'VU',
      name: 'Vanuatu'
    },
    {
      country: 'VE',
      name: 'Venezuela (Bolivarian Republic of)'
    },
    {
      country: 'VN',
      name: 'Viet Nam'
    },
    {
      country: 'VG',
      name: 'Virgin Islands (British)'
    },
    {
      country: 'VI',
      name: 'Virgin Islands (U.S.)'
    },
    {
      country: 'WF',
      name: 'Wallis and Futuna'
    },
    {
      country: 'EH',
      name: 'Western Sahara'
    },
    {
      country: 'YE',
      name: 'Yemen'
    },
    {
      country: 'ZM',
      name: 'Zambia'
    },
    {
      country: 'ZW',
      name: 'Zimbabwe'
    }
  ]
}
