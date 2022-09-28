const app = require("../app");
const api = require("../lib/api")

app.vueApp.component('ContentTableItem', {
    template: `<ul>
            <li v-for="node in root.children" :key="node.id" :node="node">
            <div class="dropdown dropdown-right">
                <button class="link">&#8942;</button>
                <div class="dropdown-content">
                    <a :href="'#/directory/edit?dir=' + node.id" ><span class="icon icon-pen"></span> bearbeiten</a>
                    <a @click="deleteDir(node.id)"><span class="icon icon-trash_can"></span> löschen</a>
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