const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div class="select-type">
        <a v-for="t in types" :key="t.name" :t="t" :href="'#/content/add?type=' + t.name + '&dir=' + (route.query.dir || '')">
            {{ $t("type." + t.name + ".title") }}
        </a>
        <a :href="'#/directory/add?dir=' + (route.query.dir || '/')">
            {{ $t("type.subdirectory.title") }}
        </a>
    </div>`,

    data() {
        return {
            route: router.getRoute(),
            types: (app.types).sort((a, b) => { return a.sortNumber - b.sortNumber; } )
        }
    },

    beforeMount(){
        if((this.route.query.dir || '/') == '/')
        {
            window.location.href = "#/add/subdirectory";
        }
    }
};