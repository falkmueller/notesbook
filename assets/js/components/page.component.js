const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");
const api = require("../lib/api");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="(comp, index) in components" :class="'content content-' + comp.type" :id="'content-' + index">
            <div class="dropdown dropdown-right">
                <button class="link">&#8942;</button>
                <div class="dropdown-content">
                    <a :href="'#/content/edit?idx=' + index + '&dir=' + dir"><span>&#9998;</span> bearbeiten</a>
                    <a @click="deleteContent(index)"><span>&#120;</span> löschen</a>
                    <a v-if="index > 0" @click="changeItems(index, index -1)"><span>&#129081;</span> höher</a>
                    <a v-if="index < components.length - 1" @click="changeItems(index, index + 1)"><span>&#129083;</span> runter</a>
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
            var isConfirm = confirm(this.$t("delete_message"));
            if(!isConfirm){
                return;
            }

            this.components.splice(idx, 1);

            this._updateRemote();
        },

        changeItems(idx1, idx2){
            let temp = this.components[idx1];
            this.components[idx1] = this.components[idx2];
            this.components[idx2] = temp;

            this._updateRemote();
        },

        _updateRemote(){
            let fileContent = contentHelper.implodeContent(this.components);

            api.post(
                `/file?directory_id=${this.dir}&file_name=content.txt`, 
                fileContent);
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

        api.get(`/directory?id=${this.dir}`).then((response) => {
           this.title = response.data.title;
        });

        api.get(`/file?directory_id=${this.dir}&file_name=content.txt`).then((response) => {
            this.components = contentHelper.splitContent(response.data);
         })

         if(route.query.idx){
            setTimeout(() => {
                var getMeTo = document.getElementById("content-" + route.query.idx);
                getMeTo.scrollIntoView({behavior: 'smooth'}, true);
            }, 300);
         }
    }
}