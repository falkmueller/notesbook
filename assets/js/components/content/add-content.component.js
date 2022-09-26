const router = require("../../lib/router");
const app = require("../../app");
const contentHelper =  require("../../lib/content-helper");
const api = require("../../lib/api");

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
            api.get(`/file?directory_id=${this.directoryId}&file_name=content.txt`).then((response) => {
                this._updateContent(response.data, raw);
             }, () => {
                this._updateContent("", raw);
             })
        },
        _updateContent(contentString, raw){
            let content = contentHelper.splitContent(contentString);
            content.push({
                type: this.type,
                content: raw
            });
            let newIdx = content.length -1;

            api.post(
                `/file?directory_id=${this.directoryId}&file_name=content.txt`, 
                contentHelper.implodeContent(content),
                {
                    headers: { 
                        'Content-Type' : 'text/plain' 
                    }
                }).then(() => {
                window.location.href = `#/page?dir=${this.directoryId}&idx=${newIdx}`;
            })
        }
    }
}