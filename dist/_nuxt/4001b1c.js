(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{639:function(e,t,n){"use strict";n.r(t);var r,o=n(4),l=(n(18),n(5)),m=(n(422),n(64),n(423)),c=n.n(m),d=(n(424),n(425)),v=n.n(d),f=(n(426),n(427)),h=n.n(f),_=(n(8),n(41)),x={components:(r={},Object(l.a)(r,h.a.name,h.a),Object(l.a)(r,"TagsInput",_.i),Object(l.a)(r,v.a.name,v.a),Object(l.a)(r,c.a.name,c.a),r),data:function(){return{filterable:!0,clearable:!0,model:{investedAmount:null,investmentName:null,currentValue:null},modelValidations:{investedAmount:{required:!0,min_value:1},investmentName:{required:!0},currentValue:{required:!0}},currency:null}},methods:{getError:function(e){return this.errors.first(e)},validate:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$wallet.setCurrentWallet(e);case 2:n=t.sent,e.$validator.validateAll().then((function(t){e.$emit("on-submit",e.model,t,n.WalletId)}));case 4:case"end":return t.stop()}}),t)})))()}},mounted:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$wallet.setCurrentWallet(e);case 2:n=t.sent,e.currency=n.WalletCurrency;case 4:case"end":return t.stop()}}),t)})))()}},$=n(2),component=Object($.a)(x,(function(){var e=this,t=e._self._c;return t("form",{staticClass:"extended-forms"},[t("card",{attrs:{"footer-classes":"text-left"}},[t("div",{attrs:{slot:"header"},slot:"header"},[t("h4",{staticClass:"card-title"},[e._v(e._s(e.$t("investment.add.title")))])]),e._v(" "),t("div",[t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.investedAmount,expression:"modelValidations.investedAmount"}],attrs:{label:e.$t("investment.add.investedAmount"),required:"",error:e.getError("investedAmount"),name:"investedAmount",type:"number",autofocus:"",placeholder:e.currency},model:{value:e.model.investedAmount,callback:function(t){e.$set(e.model,"investedAmount",t)},expression:"model.investedAmount"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.investmentName,expression:"modelValidations.investmentName"}],attrs:{label:e.$t("investment.add.investmentName"),required:"",error:e.getError("investmentName"),name:"investmentName",type:"text"},model:{value:e.model.investmentName,callback:function(t){e.$set(e.model,"investmentName",t)},expression:"model.investmentName"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.currentValue,expression:"modelValidations.currentValue"}],attrs:{label:e.$t("investment.add.currentValue"),required:"",error:e.getError("currentValue"),name:"currentValue",type:"number",autofocus:"",placeholder:e.currency},model:{value:e.model.currentValue,callback:function(t){e.$set(e.model,"currentValue",t)},expression:"model.currentValue"}}),e._v(" "),t("div",{staticClass:"small form-category"},[e._v(e._s(e.$t("investment.add.required-fields")))])],1),e._v(" "),t("template",{slot:"footer"},[t("base-button",{attrs:{"native-type":"submit",type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.validate.apply(null,arguments)}}},[e._v(e._s(e.$t("investment.add.submit")))]),e._v(" "),t("nuxt-link",{staticClass:"float-right",attrs:{to:"/investments"}},[e._v(e._s(e.$t("investment.add.to")))])],1)],2)],1)}),[],!1,null,null,null),w={name:"add-investments",layout:"plain",components:{InvestmentForm:component.exports},data:function(){return{investmentModel:{}}},methods:{addInvestment:function(e,t,n){var r=this;return Object(o.a)(regeneratorRuntime.mark((function o(){return regeneratorRuntime.wrap((function(o){for(;;)switch(o.prev=o.next){case 0:if(t){o.next=2;break}return o.abrupt("return");case 2:return r.investmentModel=e,o.next=5,r.$axios.$put("/investment",{pk:n,invested_amount:parseFloat(e.investedAmount),current_value:parseFloat(e.currentValue),investment_name:e.investmentName}).then((function(){r.$notify({type:"success",icon:"tim-icons icon-check-2",verticalAlign:"bottom",horizontalAlign:"center",message:$nuxt.$t("investment.add.success")})})).catch((function(e){r.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:e})}));case 5:case"end":return o.stop()}}),o)})))()}}},y=Object($.a)(w,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"container login-page"},[t("notifications"),e._v(" "),t("div",{staticClass:"row"},[t("div",{staticClass:"col-md-12"},[t("investment-form",{on:{"on-submit":e.addInvestment}})],1)])],1)}),[],!1,null,null,null);t.default=y.exports}}]);