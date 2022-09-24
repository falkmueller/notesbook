const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="(comp, index) in components" :class="'content content-' + comp.type" :id="'content-' + index">
                <div class="dropdown">
                    <button class="link">&#8942;</button>
                    <div class="dropdown-content">
                        <a :href="'#/edit/content?idx=' + index + '&dir=' + dir"><span>&#9998;</span> bearbeiten</a>
                        <a @click="deleteContent(index)"><span>&#120;</span> löschen</a>
                    </div>
                </div>
                
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
        },

        deleteContent: function(idx){
            console.log("delete content");
            var isConfirm = confirm(this.$t("delete_message"));
            if(!isConfirm){
                return;
            }

            this.components.splice(idx, 1);

            let fileContent = contentHelper.implodeContent(this.components);

            axios.post(
                `api/file?directory_id=${this.dir}&file_name=content.txt`, 
                fileContent,
                {
                    headers: { 
                        'Content-Type' : 'text/plain' 
                    }
                })
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