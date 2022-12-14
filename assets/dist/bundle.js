(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const i18n = require("./i18n");
const router = require("./lib/router")

module.exports = {
    types: [],

    vueApp: Vue.createApp(require("./components/app.component")),

    run(){
        this.types.forEach((type) => {
            i18n.messages.en.type[type.name] = type.translations.en.type[type.name];
            i18n.messages.de.type[type.name] = type.translations.de.type[type.name];
        });
        
        var language = router.getRoute().query.ln || "de";

        this.vueApp.use(i18n.getVuePlugin(language));
        this.vueApp.mount('#app');
    }
}
},{"./components/app.component":2,"./i18n":11,"./lib/router":15}],2:[function(require,module,exports){
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
                return "#/directory/add";
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
},{"../lib/router":15,"./not-found.component":8}],3:[function(require,module,exports){
const app = require("../app");
const api = require("../lib/api")

app.vueApp.component('ContentTableItem', {
    template: `<ul>
            <li v-for="node in root.children" :key="node.id" :node="node">
            <div class="dropdown dropdown-right">
                <button class="link">&#8942;</button>
                <div class="dropdown-content">
                    <a :href="'#/directory/edit?dir=' + node.id" ><span class="icon icon-pen"></span> bearbeiten</a>
                    <a @click="deleteDir(node.id)"><span class="icon icon-trash_can"></span> l??schen</a>
                    <div>
                        <a @click="moveDir(node.id, -1, false)"><span class="icon icon-chevron_up"></a>
                        <a @click="moveDir(node.id, 1, false)"><span class="icon icon-chevron_down"></a>
                        <a @click="moveDir(node.id, -1, true)"><span class="icon icon-chevron_left"></a>
                        <a @click="moveDir(node.id, 1, true)"><span class="icon icon-chevron_right"></a>
                    </div>
                </div>
            </div>
                <a :href="'#/page?dir=' + node.id"><span class="title">{{ node.title }}<span></span></span></a>
                <ContentTableItem v-if="node.children && node.children.length > 0" :root="node" :onReload="onReload" />
            </li>
        </ul>`,
    
    props: ["root", "onReload"],

    methods: {
        deleteDir(directoryId){
            var isConfirm = confirm(this.$t("delete_message"));
            if(!isConfirm){
                return;
            }
    
            api.delete(`/directory?id=${directoryId}`).then(()=>{
                this.onReload();
            })
        },

        moveDir(directoryId, direction, moveLevel){
            api.patch(`/directory/move`, {
                id: directoryId,
                direction: direction,
                moveLevel: moveLevel
            }).then(()=>{
                this.onReload();
            })
        },
    }
    
});

module.exports = {
    template: `<div class="content-table">
        <h1>{{ $t("contentTable.headline") }}</h1>
        <ContentTableItem :root="root" :onReload="load" />
    </div>`,

    data() {
        return {
            root: {
                children: []
            }
        }
    },

    mounted(){
        this.load();
    },

    methods: {
        load(){
            api.get('/').then((response) => {
                this.root.children = response.data;
             })
        },

        deleteDir(directoryId){
            var isConfirm = confirm(this.$t("delete_message"));
            if(!isConfirm){
                return;
            }

            api.delete(`/directory?id=${directoryId}`).then(function(){
                this.load();
            })
        },
    }
};
},{"../app":1,"../lib/api":13}],4:[function(require,module,exports){
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
},{"../../app":1,"../../lib/api":13,"../../lib/content-helper":14,"../../lib/router":15}],5:[function(require,module,exports){
const router = require("../../lib/router");
const app = require("../../app");
const contentHelper = require("../../lib/content-helper");
const api = require("../../lib/api");

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

        api.get(`/file?directory_id=${this.directoryId}&file_name=content.txt`).then((response) => {
                
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

            api.post(
                `/file?directory_id=${this.directoryId}&file_name=content.txt`, 
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
},{"../../app":1,"../../lib/api":13,"../../lib/content-helper":14,"../../lib/router":15}],6:[function(require,module,exports){
const router = require("../../lib/router");
const api = require("../../lib/api")

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
          
            api.post('/directory', {
                title: this.model.title,
                parent_id: route.query.dir || ""
            }).then(function(response){
                window.location.href = `#/page?dir=${response.data}`;
            })
        }
    }

}
},{"../../lib/api":13,"../../lib/router":15}],7:[function(require,module,exports){
const router = require("../../lib/router");
const api = require("../../lib/api");

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
            },
            directoryId: ""
        }
    },

    mounted(){
        let route = router.getRoute();
        this.directoryId = route.query.dir;
        
        api.get(`/directory?id=${this.directoryId}`).then((response) => {
            this.model.title = response.data.title;
        });
    },


    methods: {
        submit(e){
            e.preventDefault();
          
            api.patch('/directory', {
                title: this.model.title,
                id: this.directoryId
            }).then(function(){
                window.location.href = "#/";
            })
        }
    }

}
},{"../../lib/api":13,"../../lib/router":15}],8:[function(require,module,exports){
module.exports = {
    template: `<div>404</div>`
}
},{}],9:[function(require,module,exports){
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
                    <a :href="'#/content/edit?idx=' + index + '&dir=' + dir"><span class="icon icon-pen"></span> bearbeiten</a>
                    <a @click="deleteContent(index)"><span class="icon icon-trash_can"></span> l??schen</a>
                    <a v-if="index > 0" @click="changeItems(index, index -1)"><span class="icon icon-chevron_up"></span> h??her</a>
                    <a v-if="index < components.length - 1" @click="changeItems(index, index + 1)"><span class="icon icon-chevron_down"></span> runter</a>
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
            this.components[idx1] =  this.components.splice(idx2, 1, this.components[idx1])[0];

            var temp = this.components;
            this.components = [];

            this.$nextTick().then(() => {
                this.components = temp;
                this._updateRemote();
            });       
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
},{"../app":1,"../lib/api":13,"../lib/content-helper":14,"../lib/router":15}],10:[function(require,module,exports){
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div class="select-type">
        <a v-for="t in types" :key="t.name" :t="t" :href="'#/content/add?type=' + t.name + '&dir=' + (route.query.dir || '')">
            {{ $t("type." + t.name + ".title") }}
        </a>
        <a :href="'#/directory/add?dir=' + (route.query.dir || '/')">
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
},{"../app":1,"../lib/router":15}],11:[function(require,module,exports){
const messages = {
    en: {
        contentTable: {
            headline: 'Content table'
        },
        type: {
            subdirectory: {
                title: "Subsection"
            }
        },
        "delete_message": "delete?"
    },
    de: {
        contentTable: {
            headline: 'Inhaltsverzeichnis'
        },
        type: {
            subdirectory: {
                title: "Unterkategorie"
            }
        },
        "delete_message": "wirklich l??schen?"
    }
  }


  module.exports = {
    messages,
    getVuePlugin(defaulLanguage){
        return VueI18n.createI18n({
            locale: defaulLanguage, // set locale
            fallbackLocale: 'en', // set fallback locale
            messages,
        })
    }
  }
},{}],12:[function(require,module,exports){
var router = require("./lib/router");
router.routes['/'] = require("./components/content-table.compnent");
router.routes['/add'] = require("./components/select-type.component");
router.routes['/directory/add'] = require("./components/directory/add-directory.component");
router.routes['/directory/edit'] = require("./components/directory/edit-directory.component");
router.routes['/content/add'] = require("./components/content/add-content.component");
router.routes['/content/edit'] = require("./components/content/edit-content.component");
router.routes['/page'] = require("./components/page.component");

if(router.getRoute().query.token){
    let route = router.getRoute();
    localStorage.setItem("token", route.query.token);
    delete route.query.token;
    window.location.href = router.buildUrl(route.path, route.query);
}

var app = require("./app");
app.types.push(require("./types/link.type"));
app.types.push(require("./types/text.type"));
app.types.push(require("./types/file.type"));

window.app = app;
},{"./app":1,"./components/content-table.compnent":3,"./components/content/add-content.component":4,"./components/content/edit-content.component":5,"./components/directory/add-directory.component":6,"./components/directory/edit-directory.component":7,"./components/page.component":9,"./components/select-type.component":10,"./lib/router":15,"./types/file.type":16,"./types/link.type":17,"./types/text.type":18}],13:[function(require,module,exports){
function apiCall(method, url, body, options){

    
    let headers = { }
    const token = localStorage.getItem('token');

    if(token){
        headers.Authorization =  'Bearer '+ token; 
    }

    if(options && options.headers){
        headers = {...headers, ...options.headers};
    }

    let currentUrl = window.location.href;

    return axios({
        method: method,
        url: 'api' + url,
        headers: headers,
        data: body
      }).catch((res) => {
        if(res.response.status == "401" && res.response.data.redirect){
            let currentUrl = window.location.href;
            if(currentUrl.indexOf("#") < 0){
                currentUrl += "#/";
            }
            window.location = res.response.data.redirect + '&redirect=' + encodeURIComponent(currentUrl);
        }

        throw res.response.status;
      });
}

module.exports = {
    get(url){
        return apiCall('get', url);
    },

    delete(url){
        return apiCall('delete', url);
    },

    patch(url, body){
        return apiCall('patch', url, body)
    },

    post(url, body, options){
        return apiCall('post', url, body, options)
    },
}
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
module.exports = {
    routes: {},

    getRoute(){
        var hash = window.location.hash.slice(1) || '/';
        query = hash.split('?')[1] || "";
    
        return {
            path: hash.split('?')[0],
            query: Object.fromEntries(new URLSearchParams(query))
        }
    },

    buildUrl(path, query){
        return "#" + path + "?" + new URLSearchParams(query).toString()
    }
}
},{}],16:[function(require,module,exports){
const contentHelper = require("../lib/content-helper");
const router = require("../lib/router");
const api = require("../lib/api");

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
                const token = localStorage.getItem("token");
                this.url = `api/file?directory_id=${dir}&file_name=${this.file}&token=${token}`;

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

                    api.post(
                        `/file?directory_id=${dir}&file_name=${this.model.file}`, 
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
                        "label": "Datei ausw??hlen"
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
},{"../lib/api":13,"../lib/content-helper":14,"../lib/router":15}],17:[function(require,module,exports){
const contentHelper = require("../lib/content-helper");
const api = require("../lib/api");

module.exports = {
    "name": "link",
    "sortNumber": 1,
    "components": {
        "render": {
            template: `
                <a target="_blank" :href="url">
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

                    api.get('/content/get-page-title?url=' + encodeURIComponent(this.model.url)).then((response) => {
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
                        "headline": "Link hinzuf??gen",
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
},{"../lib/api":13,"../lib/content-helper":14}],18:[function(require,module,exports){
const contentHelper = require("../lib/content-helper");

var editor;

module.exports = {
    "name": "text",
    "sortNumber": 2,
    "components": {
        "render": {
            template: `<div class="content-body" v-html="text"></div>`,
            data() {
                return {
                    text: ""
                }
            },

            mounted(){
                marked.setOptions({
                    breaks: true
                });
                this.text = marked.parse(this.raw);
            },

            props: ["raw"],
        },
        "alter": {
            template: `<div>
                <form v-on:submit="submit">
                    <h1>{{ $t("type.text." + mode + ".headline") }}</h1>
                    <div id="toolbar"></div>
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
                editor = new TinyMDE.Editor({element: 'editor'});
                var commandBar = new TinyMDE.CommandBar({element: 'toolbar', editor: editor});
                editor.setContent(this.input || "");

                if(this.input){
                    this.mode = "edit";
                }              
            },

            methods: {
                submit(e){
                    e.preventDefault();
                    this.onSubmit(editor.getContent());
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
                        "headline": "Text hinzuf??gen",
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
},{"../lib/content-helper":14}]},{},[12]);
