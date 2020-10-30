(this.webpackJsonp=this.webpackJsonp||[]).push([["coin-payments"],{"76w0":function(e,n,t){"use strict";t.r(n);var i=t("agRm"),s=t.n(i);const{Component:o,Mixin:a}=Shopware;o.override("sw-plugin-config",{template:s.a,mixins:[a.getByName("notification"),a.getByName("sw-inline-snippet")],inject:["CoinpaymentsPaymentConfigService"],data:()=>({config:{},isLoading:!1,isTesting:!1,isSaveSuccessful:!1,isTestSuccessful:!1,clientIdFilled:!1,clientSecretFilled:!1,showValidationErrors:!1,isSupportModalOpen:!1}),computed:{credentialsMissing:function(){return!this.clientIdFilled||!this.clientSecretFilled}},methods:{saveFinish(){this.isSaveSuccessful=!1},onCoinTest(){if(this.isTesting=!0,this.isTestSuccessful=!1,this.isLoading=!0,this.credentialsMissing)return this.showValidationErrors=!0,void(this.isTesting=!1);let e={clientId:this.getConfigValue("clientId"),webhooks:this.getConfigValue("webhooks"),clientSecret:this.getConfigValue("clientSecret")};this.CoinpaymentsPaymentConfigService.validateApiCredentials(e).then(e=>{const n=e.credentialsValid;e.error;n?(this.createNotificationSuccess({title:this.$tc("coinpayments-payment.configForm.messages.titleSuccess"),message:this.$tc("coinpayments-payment.configForm.messages.messageTestSuccess")}),this.isTestSuccessful=!0):this.createNotificationError({title:this.$tc("coinpayments-payment.configForm.messages.titleError"),message:this.$tc("coinpayments-payment.configForm.messages.messageTestError")}),this.isTesting=!1}).catch(e=>{this.createNotificationError({title:this.$tc("coinpayments-payment.configForm.messages.titleError"),message:this.$tc("coinpayments-payment.configForm.messages.messageTestErrorGeneral")}),this.isTesting=!1})},onConfigChange(e){this.config=e,this.checkCredentialsFilled(),this.showValidationErrors=!1},getBind(e,n){return"CoinPayments.config"==this.domain&&(n!==this.config&&this.onConfigChange(n),this.showValidationErrors&&("CoinPayments.config.clientId"!==e.name||this.clientIdFilled||(e.config.error={code:1,detail:this.$tc("coinpayments-payment.configForm.messages.messageNotBlank")}),"CoinPayments.config.clientSecret"!==e.name||this.clientSecretFilled||(e.config.error={code:1,detail:this.$tc("coinpayments-payment.configForm.messages.messageNotBlank")}))),e},checkCredentialsFilled(){this.clientIdFilled=!!this.getConfigValue("clientId"),this.getConfigValue("webhooks")?this.clientSecretFilled=!!this.getConfigValue("clientSecret"):this.clientSecretFilled=!0},getConfigValue(e){const n=this.$refs.systemConfig.actualConfigData.null;return null===this.$refs.systemConfig.currentSalesChannelId?this.config["CoinPayments.config."+e]:this.config["CoinPayments.config."+e]||n["CoinPayments.config."+e]}}});var c=t("dOWv");const{Module:r}=Shopware;r.register("coin-plugin",{type:"plugin",name:"CoinPayments",title:"coinpayments-payment.module.title",description:"coinpayments-payment.module.description",version:"2.0.0",targetVersion:"2.0.0",color:"#333",icon:"default-action-settings",snippets:{"en-GB":c},routes:{index:{component:"coin-payment-config"}}});t("JGfL")},JGfL:function(e,n){const{Application:t}=Shopware,i=Shopware.Classes.ApiService;class s extends i{constructor(e,n,t="coinpayments_payment"){super(e,n,t)}validateApiCredentials(e){const n=this.getBasicHeaders();return this.httpClient.post(`_action/${this.getApiBasePath()}/validate-api-credentials`,{credentials:e},{headers:n}).then(e=>i.handleResponse(e))}}t.addServiceProvider("CoinpaymentsPaymentConfigService",e=>{const n=t.getContainer("init");return new s(n.httpClient,e.loginService)})},agRm:function(e,n){e.exports='{% block sw_plugin_config_actions_abort %}\n    {% parent %}\n\n    {% block sw_plugin_config_actions_coin_test %}\n        <sw-button variant="primary" class="sw-plugin-config__save-action" @click.prevent="onCoinTest"\n                   v-show="namespace == \'CoinPayments\'">\n            {{ $tc(\'coinpayments-payment.configForm.test\') }}\n        </sw-button>\n    {% endblock %}\n{% endblock %}\n\n{% block sw_plugin_config_content %}\n    <sw-card-view>\n        {% block sw_system_config %}\n            <sw-system-config :domain="domain"\n                              salesChannelSwitchable\n                              :salesChannelId="salesChannelId"\n                              @config-changed="onConfigChange"\n                              ref="systemConfig">\n                <template #card-element="{ element, config }">\n                    <sw-form-field-renderer\n                        v-bind="getBind(element, config)"\n                        v-model="config[element.name]"/>\n                </template>\n            </sw-system-config>\n        {% endblock %}\n    </sw-card-view>\n{% endblock %}\n'},dOWv:function(e){e.exports=JSON.parse('{"coinpayments-payment":{"module":{"title":"CoinPayments.NET","description":"CoinPayments.NET Payments"},"configForm":{"title":"CoinPayments.NET Payments","test":"Test API-Credentials","save":"Save","messages":{"messageNotBlank":"This Field must not be empty.","titleSuccess":"Success","titleError":"Error","messageTestSuccess":"The API credentials are correct.","messageTestError":"The API credentials are wrong.","messageTestErrorGeneral":"The API access data could not be verified.","messageSaveSuccess":"The plugin settings have been saved.","messageSaveError":"The plugin settings could not be saved."}},"supportModal":{"supportButton":"Support","title":"How Can We Help You?","supportDesc":"Contact our support team","manualButton":"Manual","manualDesc":"Read our integration manual"}}}')}},[["76w0","runtime"]]]);