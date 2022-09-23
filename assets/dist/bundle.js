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
},{"./components/app.component":4,"./i18n":11}],2:[function(require,module,exports){
const router = require("../lib/router");

module.exports = {
    template: `<div>
        <form v-on:submit="submit">
            <h1>Add sub section</h1>
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
},{"../lib/router":14}],3:[function(require,module,exports){
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
},{"../lib/router":14}],4:[function(require,module,exports){
const router = require("../lib/router");
const notFoundComponent = require("./not-found.component");

module.exports = {
    template: `<div class="container">
        <component :is="currentView" />

        <a class="btn-add" :href="addRoute">+</a>
        <a v-if="route.path != '/'" class="btn-overview" href="#/">&#9776;</a>
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
},{"../lib/router":14,"./not-found.component":6}],5:[function(require,module,exports){
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
module.exports = {
    template: `<div>404</div>`
}
},{}],7:[function(require,module,exports){
//<a class="pull-right">&#9998;</a>

const contentHelper =  require("../lib/content-helper");
const router = require("../lib/router");
const app = require("../app");

module.exports = {
    template: `<div>
        <h1>{{ title }}</h1>

        <div v-for="comp in components" :comp="comp">
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
            id: "",
            components: []
        }
    },

    mounted(){
        let route = router.getRoute();
        this.id = route.query.dir;

        axios.get(`api/directory?id=${this.id}`).then((response) => {
           this.title = response.data.title;
        });

        axios.get(`api/file?directory_id=${this.id}&file_name=content.txt`).then((response) => {
            this.components = contentHelper.splitContent(response.data);
         })
    }
}
},{"../app":1,"../lib/content-helper":13,"../lib/router":14}],8:[function(require,module,exports){
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
},{"../app":1,"../lib/router":14}],9:[function(require,module,exports){
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
},{"../../lib/content-helper":13}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
var router = require("./lib/router");
router.routes['/'] = require("./components/content-table.compnent");
router.routes['/add'] = require("./components/select-type.component");
router.routes['/add/directory'] = require("./components/add-directory.component");;
router.routes['/add/content'] = require("./components/add-content.component");
router.routes['/page'] = require("./components/page.component");


var app = require("./app");
app.types.push(require("./components/types/link.type"));
app.types.push(require("./components/types/text.type"));
app.run()
},{"./app":1,"./components/add-content.component":2,"./components/add-directory.component":3,"./components/content-table.compnent":5,"./components/page.component":7,"./components/select-type.component":8,"./components/types/link.type":9,"./components/types/text.type":10,"./lib/router":14}],13:[function(require,module,exports){
module.exports = {

    splitContent(content){
        let returnValue = [];

        let splitRegex =  /---[\w]*---[^---]*/gs;
        let extractRegex =  /---([\w]*)---(.*)/s;
        
        var groups = content.match(splitRegex);
        
        groups.forEach((group)=> {
          let parts = extractRegex.exec(group)
        
          returnValue.push({
            type: parts[1].toLowerCase(),
            content: parts[2].trim()
          });
        });

        return returnValue;
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
        var resonse = "";
        for (const prop in obj) {
            let key = prop;
            let value = JSON.stringify(obj[prop]).replace(/^\"+|\"+$/g, '');

            if(response != ""){
                resonse += "\n";
            }

            resonse += `${key}: ${value}`;
        }

        return resonse;
    }
};
},{}],14:[function(require,module,exports){
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
},{}]},{},[12]);
