//<a class="pull-right">&#9998;</a>

const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="comp in components" :comp="comp">
                <component :is="getComponent(comp.type)" :raw="comp.content" />
        </div>
        
    </div>`,

    methods: {
        getComponent: function (type) {
            var typeObj = app.types.find(x => x.name == type);
            if(!typeObj){
                return {template: `<div>type ${type} not implemented</div>`}
            }
            return typeObj.components.render;
        }
      },

    data() {
        return {
            title: "",
            id: "",
            components: []
        }
    },

    mounted(){
        let route = router.getRoute();
        this.id = route.query.dir;

        axios.get(`api/directory?id=${this.id}`).then((response) => {
           this.title = response.data.title;
        });

        axios.get(`api/file?directory_id=${this.id}&file_name=content.txt`).then((response) => {
            this.components = contentHelper.splitContent(response.data);
         })
    }
}