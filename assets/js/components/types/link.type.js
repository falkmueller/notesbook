const contentHelper = require("../../lib/content-helper");

module.exports = {
    "name": "link",
    "sortNumber": 1,
    "components": {
        "render": {
            template: `<div>link
                <a :href="url">{{ title }}</a>
            </div>`,
            data() {
                return {
                    url: "",
                    title: ""
                }
            },

            mounted(){
                var value = contentHelper.toObject(this.raw)
                this.title = value.title;
                this.url = value.url;
            },

            props: ["raw"],
        },
        "create": {
            template: `<div>
                <input v-model="model.url" type="text" />
                <button type="submit">submit</button>
            </div>`,   

            data() {
                return {
                    model: {
                        url: ""
                    }
                }
            },

        },
        "update": {
            template: `<div> </div>`, 
        },
        "delete": {
            template: `<div> </div>`,
        }
    },
    "translations": {
        "en": {
            "type": {
                "link": {
                    "title": "Link"
                }
            }
        },
        "de": {
            "type": {
                "link": {
                    "title": "Link"
                }
            }
        }
    }
}