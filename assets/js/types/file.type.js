const contentHelper = require("../lib/content-helper");
const router = require("../lib/router");

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

module.exports = {
    "name": "file",
    "sortNumber": 3,
    "components": {
        "render": {
            template: `
                <img v-if="isImage" :src="url" />
                <div class="title">{{ title }}</div>
                <a target="_blank" :href="url">{{original_name}} ({{size}})</a>`,
            data() {
                return {
                    file: "",
                    title: "",
                    original_name: "",
                    size: "",
                    url: "",
                    isImage: false,

                }
            },

            mounted(){
                var value = contentHelper.toObject(this.raw);
                this.title = value.title;
                this.file = value.file;
                this.original_name = value.original_name;

                const lastDot =  this.file.lastIndexOf('.');
                const ext =  this.file.substring(lastDot + 1).toLowerCase();
                const dir = router.getRoute().query.dir;
                this.url = `api/file?directory_id=${dir}&file_name=${this.file}`;

                if(['jpeg', 'jpg', 'png', 'gif'].indexOf(ext) >= 0){
                    this.isImage = true;
                }

                let size = parseInt(value.size);
                size = Math.round(size / 1024 * 10) / 10;
                if(size < 1024){
                    this.size = `${size} KB`;
                }
                size = Math.round(size / 1024 * 10) / 10;
                this.size = `${size} MB`;
            },

            props: ["raw"],
        },
        "alter": {
            template: `<div>
                <form v-on:submit="submit">
                    <h1>{{ $t("type.file." + mode + ".headline") }}</h1>
                    <input v-model="model.title" type="text" :placeholder='$t("type.file." + mode + ".title_placeholder")' />
                    <div v-if="this.mode == 'add'">
                        <input id="files" type="file" @change="changeFile" ref="file">
                        <label for="files">{{ fileLabel }}</label>
                    </div>
                    <button type="submit">{{ $t("type.file." + mode + ".button") }}</button>
                </form>
            </div>`,   

            data() {
                return {
                    model: {
                        file: "",
                        size: 0,
                        title: "",
                        original_name: "",
                    },
                    file: null,
                    fileLabel: "",
                    mode: "add"
                }
            },

            props: ["onSubmit", "input"],

            mounted(){
                this.fileLabel = this.$t("type.file.add.label");

                if(!this.input){
                    return;
                }

                var value = contentHelper.toObject(this.input)
                this.model.title = value.title;
                this.model.file = value.file;
                this.model.size = value.size;
                this.model.original_name = value.original_name;
                this.mode = "edit";
            },

            methods: {
                changeFile() {
                    this.file = this.$refs.file.files[0];
                    this.fileLabel = this.file.name;
                },
                submit(e){
                    e.preventDefault();

                    if(this.mode == 'add'){
                        this.uploadFile();
                        return;
                    }

                    this.save();

                },

                save(){
                    let rawContent = {
                        file: this.model.file,
                        title: this.model.title,
                        size: this.model.size,
                        original_name:  this.model.original_name,
                    };
                    let raw = contentHelper.toStr(rawContent);
        
                    this.onSubmit(raw);
                },

                uploadFile(){
                    let fileContent = this.file;
                    this.model.size = this.file.size;

                    const name = this.file.name;
                    const lastDot = name.lastIndexOf('.');
                    const ext = name.substring(lastDot + 1);
                    this.model.file = uuidv4() + "." + ext;
                    this.model.original_name = name;
                    const dir = router.getRoute().query.dir;

                    axios.post(
                        `api/file?directory_id=${dir}&file_name=${this.model.file}`, 
                        fileContent,
                        {
                            headers: { 
                                'Content-Type' : 'text/plain' 
                            }
                        }).then(() => {
                        this.save();
                    })
                }
            }
        }
    },
    "translations": {
        "en": {
            "type": {
                "file": {
                    "title": "File",
                    "add": {
                        "headline": "Add file",
                        "button": "submit",
                        "title_placeholder": "description",
                        "label": "select file"
                    },
                    "edit": {
                        "headline": "alter file",
                        "button": "submit",
                        "title_placeholder": "description"
                    }
                }
            }
        },
        "de": {
            "type": {
                "file": {
                    "title": "Datei",
                    "add": {
                        "headline": "Datei hochladen",
                        "button": "hochladen",
                        "title_placeholder": "Beschreibung",
                        "label": "Datei auswählen"
                    },
                    "edit": {
                        "headline": "Datei bearbeiten",
                        "button": "speichern",
                        "title_placeholder": "Beschreibung"
                    }
                }
            }
        }
    }
}