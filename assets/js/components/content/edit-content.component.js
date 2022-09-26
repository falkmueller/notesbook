const router = require("../../lib/router");
const app = require("../../app");
const contentHelper = require("../../lib/content-helper");

module.exports = {
    template: `<div>
        <component :is="getComponent(type)" :input="raw" :onSubmit="(raw) => {submit(raw);}" />
    </div>`,

    data() {
        return {
            directoryId: null,
            idx: 0,
            type: null,
            raw: null,
            content: null
        }
    },

    mounted(){
        let route = router.getRoute();
        this.directoryId = route.query.dir;
        this.idx = parseInt(route.query.idx);

        axios.get(`api/file?directory_id=${this.directoryId}&file_name=content.txt`).then((response) => {
                
            this.content = contentHelper.splitContent(response.data);
            let comp = this.content[this.idx];
            this.type = comp.type;
            this.raw = comp.content;
        });

        
    },


    methods: {
        getComponent: function (type) {
            var typeObj = app.types.find(x => x.name == type);
            if(!typeObj){
                return {template: `<div>type ${type} not implemented</div>`}
            }
            return typeObj.components.alter;
        },

        submit(raw){
            this.content[this.idx].content = raw;
           
            let fileContent = contentHelper.implodeContent(this.content);

            axios.post(
                `api/file?directory_id=${this.directoryId}&file_name=content.txt`, 
                fileContent,
                {
                    headers: { 
                        'Content-Type' : 'text/plain' 
                    }
                }).then(() => {
                window.location.href = `#/page?dir=${this.directoryId}&idx=${this.idx}`;
            })
        }
    }
}