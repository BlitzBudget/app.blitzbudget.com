(window.webpackJsonp=window.webpackJsonp||[]).push([[37],{655:function(e,t,r){"use strict";r.r(t);var o=r(4),n=(r(37),r(18),{name:"register-page",layout:"auth",auth:"guest",components:{BaseCheckbox:r(41).a},data:function(){return{model:{email:"",fullName:"",password:"",checkbox:null}}},methods:{getError:function(e){return this.errors.first(e)},register:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){var r,o,n,l;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$validator.validateAll();case 2:r=t.sent,o=e.extractNames(e.model.fullName),n=o.firstName,l=o.lastName,r&&e.$axios.$post("/profile/sign-up",{email:e.model.email,password:e.model.password,name:n,lastName:l}).then((function(){localStorage.setItem(e.$authentication.emailItem,e.model.email),e.$router.push({path:"confirm-registration"})})).catch((function(t){var r=t.response,o=e.$lastElement(e.$splitElement(r.data.message,":"));e.$notify({type:"danger",icon:"tim-icons icon-simple-remove",verticalAlign:"bottom",horizontalAlign:"center",message:o})}));case 5:case"end":return t.stop()}}),t)})))()},extractNames:function(e){var t=e.split(" ");return{firstName:t.shift(),lastName:t.join(" ")}}}}),l=r(2),component=Object(l.a)(n,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"container register-page"},[t("notifications"),e._v(" "),t("div",{staticClass:"row"},[t("div",{staticClass:"col-md-5 ml-auto"},[t("div",{staticClass:"info-area info-horizontal mt-5"},[e._m(0),e._v(" "),t("div",{staticClass:"description"},[t("h3",{staticClass:"info-title mb-md-0"},[e._v(e._s(e.$t("user.register.info.first.title")))]),e._v(" "),t("p",{staticClass:"description"},[e._v("\n            "+e._s(e.$t("user.register.info.first.description"))+"\n          ")])])]),e._v(" "),t("div",{staticClass:"info-area info-horizontal mt-md-4"},[e._m(1),e._v(" "),t("div",{staticClass:"description"},[t("h3",{staticClass:"info-title mb-md-0"},[e._v(e._s(e.$t("user.register.info.second.title")))]),e._v(" "),t("p",{staticClass:"description"},[e._v("\n            "+e._s(e.$t("user.register.info.second.description"))+"\n          ")])])]),e._v(" "),t("div",{staticClass:"info-area info-horizontal mt-md-4"},[e._m(2),e._v(" "),t("div",{staticClass:"description"},[t("h3",{staticClass:"info-title mb-md-0"},[e._v(e._s(e.$t("user.register.info.third.title")))]),e._v(" "),t("p",{staticClass:"description"},[e._v("\n            "+e._s(e.$t("user.register.info.third.description"))+"\n          ")])])])]),e._v(" "),t("div",{staticClass:"col-md-7 mr-auto"},[t("form",{on:{submit:function(t){return t.preventDefault(),e.register.apply(null,arguments)}}},[t("card",{staticClass:"card-register card-white"},[t("template",{slot:"header"},[t("img",{staticClass:"card-img",attrs:{src:"img/card-primary.png",alt:"Card image"}}),e._v(" "),t("h4",{staticClass:"card-title"},[e._v(e._s(e.$t("user.register.title")))])]),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],attrs:{error:e.getError("Full Name"),name:"Full Name",placeholder:e.$t("user.register.placeholder.fullname"),"addon-left-icon":"tim-icons icon-single-02",autofocus:""},model:{value:e.model.fullName,callback:function(t){e.$set(e.model,"fullName",t)},expression:"model.fullName"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:"required|email",expression:"'required|email'"}],attrs:{error:e.getError("email"),name:"email",placeholder:e.$t("user.register.placeholder.email"),autocomplete:"username","addon-left-icon":"tim-icons icon-email-85"},model:{value:e.model.email,callback:function(t){e.$set(e.model,"email",t)},expression:"model.email"}}),e._v(" "),t("base-input",{directives:[{name:"validate",rawName:"v-validate",value:"required|min:8",expression:"'required|min:8'"}],attrs:{error:e.getError("password"),name:"password",type:"password",placeholder:e.$t("user.register.placeholder.password"),autocomplete:"current-password","addon-left-icon":"tim-icons icon-lock-circle","show-or-hide-password":"true"},model:{value:e.model.password,callback:function(t){e.$set(e.model,"password",t)},expression:"model.password"}}),e._v(" "),t("base-checkbox",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],staticClass:"text-left",attrs:{error:e.getError("checkbox"),name:"checkbox"},model:{value:e.model.checkbox,callback:function(t){e.$set(e.model,"checkbox",t)},expression:"model.checkbox"}},[e._v("\n            "+e._s(e.$t("user.register.terms.firstpart"))),t("a",{attrs:{href:"www.blitzbudget.com/terms",target:"_blank"}},[e._v(e._s(e.$t("user.register.terms.secondpart")))]),e._v(".\n          ")]),e._v(" "),t("base-button",{attrs:{slot:"footer","native-type":"submit",type:"primary",round:"",block:"",size:"lg"},slot:"footer"},[e._v("\n            "+e._s(e.$t("user.register.button"))+"\n          ")])],2)],1)])])],1)}),[function(){var e=this._self._c;return e("div",{staticClass:"icon icon-warning"},[e("i",{staticClass:"tim-icons icon-wifi"})])},function(){var e=this._self._c;return e("div",{staticClass:"icon icon-primary"},[e("i",{staticClass:"tim-icons icon-triangle-right-17"})])},function(){var e=this._self._c;return e("div",{staticClass:"icon icon-info"},[e("i",{staticClass:"tim-icons icon-trophy"})])}],!1,null,null,null);t.default=component.exports}}]);