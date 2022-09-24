const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="(comp, index) in components" :id="'content-' + index">
                <a class="pull-right" :href="'#/edit/content?idx=' + index + '&dir=' + dir">&#9998;</a>
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
            dir: "",
            components: []
        }
    },

    mounted(){
        let route = router.getRoute();
        this.dir = route.query.dir;

        axios.get(`api/directory?id=${this.dir}`).then((response) => {
           this.title = response.data.title;
        });

        axios.get(`api/file?directory_id=${this.dir}&file_name=content.txt`).then((response) => {
            this.components = contentHelper.splitContent(response.data);
            console.log(response.data);
            console.log(this.components);
         })

         if(route.query.idx){
            setTimeout(() => {
                var getMeTo = document.getElementById("content-" + route.query.idx);
                getMeTo.scrollIntoView({behavior: 'smooth'}, true);
            }, 300);
         }
    }
}