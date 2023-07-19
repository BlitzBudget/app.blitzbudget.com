(window.webpackJsonp=window.webpackJsonp||[]).push([[32],{661:function(t,e,n){"use strict";n.r(e);var r=n(4),o=(n(18),n(41)),l={name:"investment-link",components:{BaseTable:o.f,BaseProgress:o.d,Modal:o.g},data:function(){return{investmentLink:[],modals:{mini:!1},investmentRuleId:null,noData:!1}},methods:{openModal:function(t){this.modals.mini=!0,this.investmentRuleId=t},closeModal:function(){this.modals.mini=!1,this.investmentRuleId=null},deleteItem:function(){var t=this;return Object(r.a)(regeneratorRuntime.mark((function e(){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.$wallet.setCurrentWallet(t);case 2:return n=e.sent,e.next=5,t.$axios.$post("/delete-item",{pk:n.WalletId,sk:t.investmentRuleId}).then(Object(r.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t.closeModal(),e.next=3,t.fetchInvestmentLink();case 3:case"end":return e.stop()}}),e)})))).catch((function(e){t.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:e}),t.closeModal()}));case 5:case"end":return e.stop()}}),e)})))()},noDataInResponse:function(t){this.$isEmpty(t)&&(this.noData=!0)},fetchInvestmentLink:function(){var t=this;return Object(r.a)(regeneratorRuntime.mark((function e(){var n,r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.$wallet.setCurrentWallet(t);case 2:return n=e.sent,r=t.$route.query.investment_id,e.next=6,t.getInvestmentRules(n.WalletId,r);case 6:case"end":return e.stop()}}),e)})))()},getInvestmentRules:function(t,e){var n=this;return Object(r.a)(regeneratorRuntime.mark((function o(){return regeneratorRuntime.wrap((function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.$axios.$post("/rules/investment",{wallet_id:t,investment_id:e}).then(function(){var t=Object(r.a)(regeneratorRuntime.mark((function t(e){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n.investmentLink=e,n.noDataInResponse(e),t.next=4,n.getInvestments(e);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()).catch((function(t){n.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:t})}));case 2:case"end":return o.stop()}}),o)})))()},getInvestments:function(t){var e=this;return Object(r.a)(regeneratorRuntime.mark((function n(){var r;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(!e.$isEmpty(t)){n.next=2;break}return n.abrupt("return");case 2:return n.next=4,e.$wallet.setCurrentWallet(e);case 4:return r=n.sent,n.next=7,e.$axios.$post("/investment",{wallet_id:r.WalletId}).then((function(t){e.assignInvestmentsToTable(t)})).catch((function(t){e.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:t})}));case 7:case"end":return n.stop()}}),n)})))()},assignInvestmentsToTable:function(t){if(!this.$isEmpty(t))for(var i=0,e=t.length;i<e;i++){var n=t[i],r=document.getElementsByClassName(n.sk);if(!this.$isEmpty(r))for(var o=0,l=r.length;o<l;o++){r[o].textContent=n.investment_name}}}},mounted:function(){var t=this;return Object(r.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.fetchInvestmentLink();case 2:case"end":return e.stop()}}),e)})))()}},c=l,m=n(2),component=Object(m.a)(c,(function(){var t=this,e=t._self._c;return e("card",{staticClass:"card"},[e("div",{staticClass:"row"},[e("div",{staticClass:"col-sm-6"},[e("h3",{staticClass:"card-title",attrs:{slot:"header"},slot:"header"},[t._v(t._s(t.$t("investment.link.get.title")))])]),t._v(" "),e("div",{staticClass:"col-sm-6"},[e("nuxt-link",{staticClass:"btn btn-link btn-primary float-right",attrs:{to:"/investment/link/add"}},[t._v(t._s(t.$t("investment.link.get.add"))+"\n            ")])],1)]),t._v(" "),e("div",{staticClass:"table-responsive"},[e("base-table",{attrs:{data:t.investmentLink,"thead-classes":"text-primary"},scopedSlots:t._u([{key:"columns",fn:function(n){n.columns;return[e("th",[t._v(t._s(t.$t("investment.link.get.table.header.description")))]),t._v(" "),e("th",[t._v(t._s(t.$t("investment.link.get.table.header.investment")))]),t._v(" "),e("th",{staticClass:"text-right"},[t._v(t._s(t.$t("investment.link.get.table.header.action")))])]}},{key:"default",fn:function(n){var r=n.row,o=n.index;return[e("td",[t._v(t._s(r.transaction_name))]),t._v(" "),e("td",{class:r.investment_id}),t._v(" "),e("td",{staticClass:"text-right"},[e("el-tooltip",{attrs:{content:t.$t("investment.link.get.table.link"),effect:"light","open-delay":300,placement:"top"}},[e("nuxt-link",{staticClass:"btn-link btn-neutral",attrs:{to:{path:"/investment/link/add",query:{investment_id:r.investment_id}},type:o>2?"success":"neutral",icon:"",size:"sm"}},[e("i",{staticClass:"tim-icons icon-link-72"})])],1),t._v(" "),e("el-tooltip",{attrs:{content:t.$t("investment.link.get.table.investment"),effect:"light","open-delay":300,placement:"top"}},[e("nuxt-link",{staticClass:"btn-link btn-neutral",attrs:{to:"/investments",type:o>2?"success":"neutral",icon:"",size:"sm"}},[e("i",{staticClass:"tim-icons icon-chart-bar-32"})])],1),t._v(" "),e("el-tooltip",{attrs:{content:t.$t("investment.link.get.table.delete"),effect:"light","open-delay":300,placement:"top"}},[e("base-button",{staticClass:"btn-link",attrs:{type:o>2?"danger":"neutral",icon:"",size:"sm"},on:{click:function(e){return t.openModal(r.sk)}}},[e("i",{staticClass:"tim-icons icon-simple-remove"})])],1)],1)]}}])}),t._v(" "),e("div",{class:[{"show d-block text-center":t.noData},{"d-none":!t.noData}]},[t._v("\n            "+t._s(t.$t("investment.link.get.no-data"))+"\n        ")]),t._v(" "),e("modal",{staticClass:"modal-primary",attrs:{show:t.modals.mini,"show-close":!0,headerClasses:"justify-content-center",type:"mini"},on:{"update:show":function(e){return t.$set(t.modals,"mini",e)}}},[e("p",[t._v(t._s(t.$t("investment.link.delete.description")))]),t._v(" "),e("template",{slot:"footer"},[e("base-button",{attrs:{type:"neutral",link:""},nativeOn:{click:function(e){t.modals.mini=!1}}},[t._v(t._s(t.$t("investment.link.get.back"))+"\n                ")]),t._v(" "),e("base-button",{attrs:{type:"neutral",link:""},on:{click:function(e){return t.deleteItem()}}},[t._v(t._s(t.$t("investment.link.get.delete"))+"\n                ")])],1)],2)],1)])}),[],!1,null,null,null);e.default=component.exports}}]);