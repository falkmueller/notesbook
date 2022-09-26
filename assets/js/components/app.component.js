const router = require("../lib/router");
const notFoundComponent = require("./not-found.component");

module.exports = {
    template: `<div class="container">
        <component :is="currentView" />

        <div class="bar">
            <a class="btn" :href="addRoute">+</a>
            <a v-if="route.path != '/'" class="btn" :href="backLink" v-html="backSymbol"></a>
        </div>
    </div>`,

    computed: {
        addRoute(){
            if((this.route.query.dir || '') == '')
            {
                return "#/directory/add";
            }

            return '#/add?dir=' + this.route.query.dir;
        },
        currentView() {
            return router.routes[this.route.path] || notFoundComponent
        },
        backLink(){
            if(this.route.query.dir && this.route.path != '/page'){
                return `#/page?dir=${this.route.query.dir}`;
            }

            return "#/"
        },
        backSymbol(){
            if(this.route.query.dir && this.route.path != '/page'){
                return "&#10094;";
            }

            return "&#9776;";
        }
    },

    mounted() {
        window.addEventListener('hashchange', () => {
            this.route = router.getRoute();
        })
    },

    data() {
        return {
            route: router.getRoute()
        }
    }
}