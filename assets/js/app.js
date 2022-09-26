const i18n = require("./i18n");
const router = require("./lib/router")

module.exports = {
    types: [],

    vueApp: Vue.createApp(require("./components/app.component")),

    run(){
        this.types.forEach((type) => {
            i18n.messages.en.type[type.name] = type.translations.en.type[type.name];
            i18n.messages.de.type[type.name] = type.translations.de.type[type.name];
        });
        
        var language = router.getRoute().query.ln || "de";

        this.vueApp.use(i18n.getVuePlugin(language));
        this.vueApp.mount('#app');
    }
}