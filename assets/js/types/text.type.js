const contentHelper = require("../lib/content-helper");

var editor;

module.exports = {
    "name": "text",
    "sortNumber": 2,
    "components": {
        "render": {
            template: `<div>
                <div v-html="text"></div>
            </div>`,
            data() {
                return {
                    text: ""
                }
            },

            mounted(){
                this.text = marked.parse(this.raw);
            },

            props: ["raw"],
        },
        "alter": {
            template: `<div>
                <form v-on:submit="submit">
                    <h1>{{ $t("type.text." + mode + ".headline") }}</h1>
                    <textarea id="editor"></textarea>
                    <button type="submit">{{ $t("type.text." + mode + ".button") }}</button>
                </form>
            </div>`,   

            data() {
                return {
                    mode: "add"
                }
            },

            props: ["onSubmit", "input"],

            mounted(){
                editor = new SimpleMDE({ element: document.getElementById("editor") });
                editor.value(this.input);

                if(this.input){
                    this.mode = "edit";
                }              
            },

            methods: {
                submit(e){
                    e.preventDefault();
                    this.onSubmit(editor.value());
                }
            }
        }
    },
    "translations": {
        "en": {
            "type": {
                "text": {
                    "title": "Text",
                    "add": {
                        "headline": "Add text",
                        "button": "submit"
                    },
                    "edit": {
                        "headline": "alter text",
                        "button": "submit"
                    }
                }
            }
        },
        "de": {
            "type": {
                "text": {
                    "title": "Text",
                    "add": {
                        "headline": "Text hinzufügen",
                        "button": "speichern"
                    },
                    "edit": {
                        "headline": "Text bearbeiten",
                        "button": "speichern"
                    }
                }
            }
        }
    }
}