(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{637:function(e,t,r){"use strict";r.r(t);var n,o=r(4),l=(r(18),r(5)),c=(r(422),r(64),r(423)),d=r.n(c),m=(r(424),r(425)),v=r.n(m),f=(r(426),r(427)),h=r.n(f),_=(r(8),r(41)),x={components:(n={},Object(l.a)(n,h.a.name,h.a),Object(l.a)(n,"TagsInput",_.i),Object(l.a)(n,v.a.name,v.a),Object(l.a)(n,d.a.name,d.a),n),data:function(){return{filterable:!0,clearable:!0,model:{targetAmount:null,goalName:null,targetDate:null},modelValidations:{targetAmount:{required:!0,min_value:1},goalName:{required:!0},targetDate:{required:!0}},currency:null}},methods:{getError:function(e){return this.errors.first(e)},validate:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$wallet.setCurrentWallet(e);case 2:r=t.sent,e.$validator.validateAll().then((function(t){e.$emit("on-submit",e.model,t,r.WalletId)}));case 4:case"end":return t.stop()}}),t)})))()}},mounted:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$wallet.setCurrentWallet(e);case 2:r=t.sent,e.currency=r.WalletCurrency;case 4:case"end":return t.stop()}}),t)})))()}},$=r(2),component=Object($.a)(x,(function(){var e=this,t=e._self._c;return t("form",{staticClass:"extended-forms"},[t("card",{attrs:{"footer-classes":"text-left"}},[t("div",{attrs:{slot:"header"},slot:"header"},[t("h4",{staticClass:"card-title"},[e._v(e._s(e.$t("goal.add.title")))])]),e._v(" "),t("div",[t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.targetAmount,expression:"modelValidations.targetAmount"}],attrs:{label:e.$t("goal.add.targetAmount"),required:"",error:e.getError("targetAmount"),name:"targetAmount",type:"number",autofocus:"",placeholder:e.currency},model:{value:e.model.targetAmount,callback:function(t){e.$set(e.model,"targetAmount",t)},expression:"model.targetAmount"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.goalName,expression:"modelValidations.goalName"}],attrs:{label:e.$t("goal.add.goalName"),required:"",error:e.getError("goalName"),name:"goalName",type:"text"},model:{value:e.model.goalName,callback:function(t){e.$set(e.model,"goalName",t)},expression:"model.goalName"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:e.modelValidations.targetDate,expression:"modelValidations.targetDate"}],attrs:{label:e.$t("goal.add.targetDate"),required:"",error:e.getError("targetDate"),name:"targetDate",type:"datetime"},model:{value:e.model.targetDate,callback:function(t){e.$set(e.model,"targetDate",t)},expression:"model.targetDate"}},[t("el-date-picker",{attrs:{type:"datetime",placeholder:e.$t("goal.add.placeholder.targetDate")},model:{value:e.model.targetDate,callback:function(t){e.$set(e.model,"targetDate",t)},expression:"model.targetDate"}})],1),e._v(" "),t("div",{staticClass:"small form-category"},[e._v(e._s(e.$t("goal.add.required-fields")))])],1),e._v(" "),t("template",{slot:"footer"},[t("base-button",{attrs:{"native-type":"submit",type:"primary"},nativeOn:{click:function(t){return t.preventDefault(),e.validate.apply(null,arguments)}}},[e._v(e._s(e.$t("goal.add.submit")))]),e._v(" "),t("nuxt-link",{staticClass:"float-right",attrs:{to:"/goals"}},[e._v(e._s(e.$t("goal.add.to")))])],1)],2)],1)}),[],!1,null,null,null),w={name:"add-goals",layout:"plain",components:{GoalForm:component.exports},data:function(){return{goalModel:{}}},methods:{addGoal:function(e,t,r){var n=this;return Object(o.a)(regeneratorRuntime.mark((function o(){return regeneratorRuntime.wrap((function(o){for(;;)switch(o.prev=o.next){case 0:if(t){o.next=2;break}return o.abrupt("return");case 2:return n.goalModel=e,o.next=5,n.$axios.$put("/goals",{pk:r,target_amount:parseFloat(e.targetAmount),target_date:e.targetDate,goal_name:e.goalName,goal_achieved:!1,current_amount:0}).then((function(){n.$notify({type:"success",icon:"tim-icons icon-check-2",verticalAlign:"bottom",horizontalAlign:"center",message:$nuxt.$t("goal.add.success")})})).catch((function(e){n.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:e})}));case 5:case"end":return o.stop()}}),o)})))()}}},y=Object($.a)(w,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"container login-page"},[t("notifications"),e._v(" "),t("div",{staticClass:"row"},[t("div",{staticClass:"col-md-12"},[t("goal-form",{on:{"on-submit":e.addGoal}})],1)])],1)}),[],!1,null,null,null);t.default=y.exports}}]);