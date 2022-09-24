(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const i18n = require("./i18n");

module.exports = {
    types: [],

    vueApp: Vue.createApp(require("./components/app.component")),

    run(){
        this.types.forEach((type) => {
            i18n.messages.en.type[type.name] = type.translations.en.type[type.name];
            i18n.messages.de.type[type.name] = type.translations.de.type[type.name];
        });
        
        this.vueApp.use(i18n.getVuePlugin());
        this.vueApp.mount('#app');
    }
}
},{"./components/app.component":4,"./i18n":10}],2:[function(require,module,exports){
const router = require("../lib/router");
const app = require("../app");
const contentHelper =  require("../lib/content-helper");

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
        _updateContent(contentString, raw){
            let content = contentHelper.splitContent(contentString);
            content.push({
                type: this.type,
                content: raw
            });
            let newIdx = content.length -1;

            axios.post(
                `api/file?directory_id=${this.directoryId}&file_name=content.txt`, 
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
},{"../app":1,"../lib/content-helper":12,"../lib/router":13}],3:[function(require,module,exports){
const router = require("../lib/router");

module.exports = {
    template: `<div>
        <form v-on:submit="submit">
            <h1>{{ $t("type.subdirectory.title") }}</h1>
            <input v-model="model.title" type="text" />
            <button type="submit">submit</button>
        </form>
    </div>`,

    data() {
        return {
            model: {
                title: ""
            }
        }
    },


    methods: {
        submit(e){
            e.preventDefault();

            let route = router.getRoute();
          
            axios.post('api/directory', {
                title: this.model.title,
                parent_id: route.query.dir || ""
            }).then(function(){
                window.location.href = "#/";
            })
        }
    }

}
},{"../lib/router":13}],4:[function(require,module,exports){
const router = require("../lib/router");
const notFoundComponent = require("./not-found.component");

module.exports = {
    template: `<div class="container">
        <component :is="currentView" />

        <div class="bar">
            <a class="btn" :href="addRoute">+</a>
            <a v-if="route.path != '/'" class="btn" :href="backLink" v-html="backSymbol"></a>
        </div>
    </div>`,

    computed: {
        addRoute(){
            if((this.route.query.dir || '') == '')
            {
                return "#/add/directory";
            }

            return '#/add?dir=' + this.route.query.dir;
        },
        currentView() {
            return router.routes[this.route.path] || notFoundComponent
        },
        backLink(){
            if(this.route.query.dir && this.route.path != '/page'){
                return `#/page?dir=${this.route.query.dir}`;
            }

            return "#/"
        },
        backSymbol(){
            if(this.route.query.dir && this.route.path != '/page'){
                return "&#10094;";
            }

            return "&#9776;";
        }
    },

    mounted() {
        window.addEventListener('hashchange', () => {
            this.route = router.getRoute();
        })
    },

    data() {
        return {
            route: router.getRoute()
        }
    }
}
},{"../lib/router":13,"./not-found.component":7}],5:[function(require,module,exports){
const app = require("../app");

app.vueApp.component('ContentTableItem', {
    template: `<ul>
            <li v-for="node in root.childs" :key="node.id" :node="node">
                <a  :href="'#/page?dir=' + node.id"><span>{{ node.title }}<span></span></span><span style="display:none">{{ node.childs.length }}</span></a>
                <ContentTableItem v-if="node.childs && node.childs.length > 0" :root="node" />
            </li>
        </ul>`,
    
    props: {
        root: {},
        },
});

module.exports = {
    template: `<div class="content-table">
        <h1>{{ $t("contentTable.headline") }}</h1>
        <ContentTableItem :root="root"  />
    </div>`,

    data() {
        return {
            root: {
                childs: []
            }
        }
    },

    mounted(){
        axios.get('api').then((response) => {
           this.root = response.data;
        })
    }
};
},{"../app":1}],6:[function(require,module,exports){
const router = require("../lib/router");
const app = require("../app");
const contentHelper = require("../lib/content-helper");

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
            console.log("submit", this.directoryId, raw);

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
},{"../app":1,"../lib/content-helper":12,"../lib/router":13}],7:[function(require,module,exports){
module.exports = {
    template: `<div>404</div>`
}
},{}],8:[function(require,module,exports){
const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="(comp, index) in components" :class="'content content-' + comp.type" :id="'content-' + index">
                <a class="btn-edit" :href="'#/edit/content?idx=' + index + '&dir=' + dir">&#9998;</a>
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
},{"../app":1,"../lib/content-helper":12,"../lib/router":13}],9:[function(require,module,exports){
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div class="select-type">
        <a v-for="t in types" :key="t.name" :t="t" :href="'#/add/content?type=' + t.name + '&dir=' + (route.query.dir || '')">
            {{ $t("type." + t.name + ".title") }}
        </a>
        <a :href="'#/add/directory?dir=' + (route.query.dir || '/')">
            {{ $t("type.subdirectory.title") }}
        </a>
    </div>`,

    data() {
        return {
            route: router.getRoute(),
            types: (app.types).sort((a, b) => { return a.sortNumber - b.sortNumber; } )
        }
    },

    beforeMount(){
        if((this.route.query.dir || '/') == '/')
        {
            window.location.href = "#/add/subdirectory";
        }
    }
};
},{"../app":1,"../lib/router":13}],10:[function(require,module,exports){
const messages = {
    en: {
        contentTable: {
            headline: 'Content table'
        },
        type: {
            subdirectory: {
                title: "Subsection"
            }
        }
    },
    de: {
        contentTable: {
            headline: 'Inhaltsverzeichnis'
        },
        type: {
            subdirectory: {
                title: "Unterkategorie"
            }
        }
    }
  }


  module.exports = {
    messages,
    getVuePlugin(){
        return VueI18n.createI18n({
            locale: 'de', // set locale
            fallbackLocale: 'en', // set fallback locale
            messages,
        })
    }
  }
},{}],11:[function(require,module,exports){
var router = require("./lib/router");
router.routes['/'] = require("./components/content-table.compnent");
router.routes['/add'] = require("./components/select-type.component");
router.routes['/add/directory'] = require("./components/add-directory.component");;
router.routes['/add/content'] = require("./components/add-content.component");
router.routes['/edit/content'] = require("./components/edit-content.component");
router.routes['/page'] = require("./components/page.component");

var app = require("./app");
app.types.push(require("./types/link.type"));
app.types.push(require("./types/text.type"));
app.run()
},{"./app":1,"./components/add-content.component":2,"./components/add-directory.component":3,"./components/content-table.compnent":5,"./components/edit-content.component":6,"./components/page.component":8,"./components/select-type.component":9,"./lib/router":13,"./types/link.type":14,"./types/text.type":15}],12:[function(require,module,exports){
module.exports = {

    splitContent(content){
        let returnValue = [];

        let splitRegex =  /---[\w]*---[^---]*/gs;
        let extractRegex =  /---([\w]*)---(.*)/s;
        
        var splitContent = content.split(/---(\w*)---/);
        
        var type = "";
        splitContent.forEach((value, idx)=> {
            if(!type && !value){
                return;
            }

            if(!type){
                type = value;
                return;
            }

            returnValue.push({
                type: type.toLowerCase(),
                content: value.trim()
            });

            type = "";
        });

        return returnValue;
    },

    implodeContent(content){
        let stringContent = "";

        content.forEach((elem) => {
            if(stringContent != ""){
                stringContent += "\n\r\n\r";
            }

            stringContent += `---${elem.type}---\n\r\n\r`;
            stringContent += elem.content;
        });

        return stringContent;
    },

    toObject(str){
        var separateLines = str.trim().split(/\r?\n|\r|\n/g);
        var returnValue = {};

        separateLines.forEach((line)=>{
            let slitIdx = line.indexOf(":");
            let key = line.substr(0, slitIdx).trim();
            let value = line.substr(slitIdx + 1).trim();
            returnValue[key] = value;
        });

        return returnValue;
    },

    toStr(obj){
        var response = "";
        for (const prop in obj) {
            let key = prop;
            
            let value = obj[prop];
            let valueString = "";
            if(typeof value !== 'undefined'){
                valueString = JSON.stringify(value).replace(/^\"+|\"+$/g, '');
            }

            if(response != ""){
                response += "\n";
            }

            response += `${key}: ${valueString}`;
        }

        return response;
    }
};
},{}],13:[function(require,module,exports){
module.exports = {
    routes: {},

    getRoute(){
        var hash = window.location.hash.slice(1) || '/';
        query = hash.split('?')[1] || "";
    
        return {
            path: hash.split('?')[0],
            query: Object.fromEntries(new URLSearchParams(query))
        }
    }
}
},{}],14:[function(require,module,exports){
const contentHelper = require("../lib/content-helper");

module.exports = {
    "name": "link",
    "sortNumber": 1,
    "components": {
        "render": {
            template: `
                <a :href="url">
                    <span class="title">{{ title }}</span>
                    <span class="url">&#128279; {{baseUrl}}</span>
                </a>`,
            data() {
                return {
                    url: "",
                    title: "",
                    baseUrl: ""
                }
            },

            mounted(){
                
                var value = contentHelper.toObject(this.raw);
                console.log("link", this.raw, value);
                this.title = value.title;
                this.url = value.url;
                try {
                    this.baseUrl = (new URL(value.url)).host;
                } catch (error) {
                    this.baseUrl = value.url;
                }
                
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
},{"../lib/content-helper":12}],15:[function(require,module,exports){
const contentHelper = require("../lib/content-helper");

var editor;

module.exports = {
    "name": "text",
    "sortNumber": 2,
    "components": {
        "render": {
            template: `<div>Text
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
},{"../lib/content-helper":12}]},{},[11]);
