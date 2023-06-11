(window.webpackJsonp=window.webpackJsonp||[]).push([[33],{649:function(e,t,n){"use strict";n.r(t);var r,o=n(4),l=(n(18),n(5)),c=(n(422),n(64),n(423)),d=n.n(c),m=(n(424),n(425)),v=n.n(m),f=(n(8),{components:(r={},Object(l.a)(r,v.a.name,v.a),Object(l.a)(r,d.a.name,d.a),r),data:function(){return{selectedInvestmentId:"",filterable:!0,clearable:!0,model:{transactionDescription:null,investmentId:null},modelValidations:{transactionDescription:{required:!0},investmentId:{required:!0}},investments:[],loadingDataForSelect:!0}},methods:{getInvestmentValue:function(e){return e.investment_name},isSelected:function(e){return e.sk===this.selectedInvestmentId},getError:function(e){return this.errors.first(e)},validate:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$wallet.setCurrentWallet(e);case 2:n=t.sent,e.$validator.validateAll().then((function(t){e.$emit("on-submit",e.model,t,n.WalletId)}));case 4:case"end":return t.stop()}}),t)})))()},getInvestments:function(e){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,t.$axios.$post("/investment",{wallet_id:e}).then((function(e){t.investments=e,t.loadingDataForSelect=!1})).catch((function(e){var n=t.$lastElement(t.$splitElement(e.data.message,":"));t.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:n})}));case 2:case"end":return n.stop()}}),n)})))()}},mounted:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.selectedInvestmentId=e.$route.query.investment_id,e.model.investmentId=e.selectedInvestmentId,e.model.transactionDescription=e.$route.query.transaction_description,t.next=5,e.$wallet.setCurrentWallet(e);case 5:return n=t.sent,t.next=8,e.getInvestments(n.WalletId);case 8:case"end":return t.stop()}}),t)})))()}}),I=n(2),component=Object(I.a)(f,(function(){var e=this,t=e._self._c;return t("form",[t("card",{attrs:{"footer-classes":"text-left"}},[t("div",{attrs:{slot:"header"},slot:"header"},[t("h4",{staticClass:"card-title"},[e._v(e._s(e.$t("investment.link.add.title")))])]),e._v(" "),t("div",[t("el-tooltip",{attrs:{content:e.$t("investment.link.add.tooltip"),effect:"light","open-delay":300,placement:"top"}},[t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.transactionDescription,expression:"modelValidations.transactionDescription"}],attrs:{label:e.$t("investment.link.add.transactionDescription"),required:"",error:e.getError("transactionDescription"),name:"transactionDescription",autofocus:""},model:{value:e.model.transactionDescription,callback:function(t){e.$set(e.model,"transactionDescription",t)},expression:"model.transactionDescription"}})],1),e._v(" "),t("base-input",{attrs:{label:e.$t("investment.link.add.investmentId"),required:"",error:e.getError("investmentId"),name:"investmentId"}},[t("el-select",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.investmentId,expression:"modelValidations.investmentId"}],staticClass:"select-primary",attrs:{name:"investmentId",loading:e.loadingDataForSelect,clearable:e.clearable,autocomplete:"on",filterable:e.filterable},model:{value:e.model.investmentId,callback:function(t){e.$set(e.model,"investmentId",t)},expression:"model.investmentId"}},e._l(e.investments,(function(n){return t("el-option",{key:n.sk,staticClass:"select-primary",attrs:{label:e.getInvestmentValue(n),value:n.sk,selected:e.isSelected(n)}})})),1)],1),e._v(" "),t("div",{staticClass:"small form-investment"},[e._v(e._s(e.$t("investment.link.add.required-fields")))])],1),e._v(" "),t("template",{slot:"footer"},[t("base-button",{attrs:{"native-type":"submit",type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.validate.apply(null,arguments)}}},[e._v(e._s(e.$t("investment.link.add.submit")))]),e._v(" "),t("nuxt-link",{staticClass:"float-right",attrs:{to:{path:"/investment/investment-link",query:{investment_id:this.selectedInvestmentId}}}},[e._v("\n                "+e._s(e.$t("investment.link.add.viewInvestmentRule")))])],1)],2)],1)}),[],!1,null,null,null),h={name:"investment-links-add-form",layout:"plain",components:{InvestmentLinkAddForm:component.exports},data:function(){return{investmentModel:{}}},methods:{addInvestmentLink:function(e,t,n){var r=this;return Object(o.a)(regeneratorRuntime.mark((function o(){return regeneratorRuntime.wrap((function(o){for(;;)switch(o.prev=o.next){case 0:if(t){o.next=2;break}return o.abrupt("return");case 2:return r.investmentModel=e,o.next=5,r.$axios.$put("/rules/investment",{pk:n,transaction_name:e.transactionDescription,investment_id:e.investmentId}).then((function(){r.$notify({type:"success",icon:"tim-icons icon-check-2",verticalAlign:"bottom",horizontalAlign:"center",message:$nuxt.$t("investment.link.add.success")})})).catch((function(e){r.$notify({type:"danger",icon:"tim-icons icon-check-2",verticalAlign:"bottom",horizontalAlign:"center",message:e})}));case 5:case"end":return o.stop()}}),o)})))()}}},k=Object(I.a)(h,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"container login-page"},[t("notifications"),e._v(" "),t("div",{staticClass:"row"},[t("div",{staticClass:"col-md-12"},[t("investment-link-add-form",{on:{"on-submit":e.addInvestmentLink}})],1)])],1)}),[],!1,null,null,null);t.default=k.exports}}]);