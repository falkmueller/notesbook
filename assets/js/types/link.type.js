const contentHelper = require("../lib/content-helper");

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
                
                var value = contentHelper.toObject(this.raw);
                console.log("link", this.raw, value);
                this.title = value.title;
                this.url = value.url;
            },

            props: ["raw"],
        },
        "alter": {
            template: `<div>
                <form v-on:submit="submit">
                    <h1>{{ $t("type.link." + mode + ".headline") }}</h1>
                    <input v-model="model.url" type="text" placeholder="https://www......" />
                    <input v-model="model.title" @focus="loadTitle()" type="text" :placeholder='$t("type.link." + mode + ".title_placeholder")' />
                    <button type="submit">{{ $t("type.link." + mode + ".button") }}</button>
                </form>
            </div>`,   

            data() {
                return {
                    model: {
                        url: "",
                        title: ""
                    },
                    mode: "add"
                }
            },

            props: ["onSubmit", "input"],

            mounted(){
                if(!this.input){
                    return;
                }

                console.log("load content", this.input);

                var value = contentHelper.toObject(this.input)
                this.model.title = value.title;
                this.model.url = value.url;
                this.mode = "edit";
            },

            methods: {
                loadTitle(){
                    if(!this.model.url || this.model.title){
                        return;
                    }

                    axios.get('api/content/get-page-title?url=' + encodeURIComponent(this.model.url)).then((response) => {
                        if(response.data){
                            this.model.title = response.data;
                        }
                       
                     });
                },

                submit(e){
                    e.preventDefault();

                    let rawContent = {
                        url: this.model.url,
                        title: this.model.title
                    };
                    let raw = contentHelper.toStr(rawContent);
        
                    this.onSubmit(raw);
                }
            }
        }
    },
    "translations": {
        "en": {
            "type": {
                "link": {
                    "title": "Link",
                    "add": {
                        "headline": "Add link",
                        "button": "submit",
                        "title_placeholder": "title"
                    },
                    "edit": {
                        "headline": "alter link",
                        "button": "submit",
                        "title_placeholder": "title"
                    }
                }
            }
        },
        "de": {
            "type": {
                "link": {
                    "title": "Link",
                    "add": {
                        "headline": "Link hinzufügen",
                        "button": "speichern",
                        "title_placeholder": "Beschreibung"
                    },
                    "edit": {
                        "headline": "Link bearbeiten",
                        "button": "speichern",
                        "title_placeholder": "Beschreibung"
                    }
                }
            }
        }
    }
}