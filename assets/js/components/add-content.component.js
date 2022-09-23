const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <component :is="getComponent(type)" :onSubmit="(raw) => {submit(raw);}" />
    </div>`,

    data() {
        return {
            directoryId: null,
            type: null
        }
    },

    mounted(){
        let route = router.getRoute();
        this.directoryId = route.query.dir;
        this.type = route.query.type;
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
            console.log("submit", this.directoryId, raw);

            axios.get(`api/file?directory_id=${this.directoryId}&file_name=content.txt`).then((response) => {
                this._updateContent(response.data, raw);
             }, () => {
                this._updateContent("", raw);
             })
        },
        _updateContent(content, raw){
            if(content != ""){
                content += "\n\r\n\r";
            }

            content += `---${this.type}---\n\r\n\r`;
            content += raw;

            axios.post(
                `api/file?directory_id=${this.directoryId}&file_name=content.txt`, 
                content,
                {
                    headers: { 
                        'Content-Type' : 'text/plain' 
                    }
                }).then(() => {
                window.location.href = `#/page?dir=${this.directoryId}`;
            })
        }
    }
}