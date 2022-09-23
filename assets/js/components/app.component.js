const router = require("../lib/router");
const notFoundComponent = require("./not-found.component");

module.exports = {
    template: `<div class="container">
        <component :is="currentView" />

        <a class="btn-add" :href="addRoute">+</a>
        <a v-if="route.path != '/'" class="btn-overview" href="#/">&#9776;</a>
    </div>`,

    computed: {
        addRoute(){
            if((this.route.query.dir || '') == '')
            {
                return "#/add/directory";
            }

            return '#/add?dir=' + this.route.query.dir;
        },
        currentView() {
            return router.routes[this.route.path] || notFoundComponent
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