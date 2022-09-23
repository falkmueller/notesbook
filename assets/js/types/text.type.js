module.exports = {
    "name": "text",
    "sortNumber": 2,
    "components": {
        "render": {
            template: `<div>Text
                {{ text }}
            </div>`,
            data() {
                return {
                    text: ""
                }
            },

            mounted(){
                this.text = this.raw;
            },

            props: ["raw"],
        },
        "create": {
            template: `<div> </div>`,   
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
                "text": {
                    "title": "Text"
                }
            }
        },
        "de": {
            "type": {
                "text": {
                    "title": "Text"
                }
            }
        }
    }
}