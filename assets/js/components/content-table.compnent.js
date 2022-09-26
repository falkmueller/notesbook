const app = require("../app");

app.vueApp.component('ContentTableItem', {
    template: `<ul>
            <li v-for="node in root.children" :key="node.id" :node="node">
            <div class="dropdown dropdown-right">
                <button class="link">&#8942;</button>
                <div class="dropdown-content">
                    <a :href="'#/directory/edit?dir=' + node.id" ><span>&#9998;</span> bearbeiten</a>
                    <a @click="deleteDir(node.id)"><span>&#120;</span> löschen</a>
                    <div>
                        <a @click="moveDir(node.id, -1, false)"><span>&#129081;</span></a>
                        <a @click="moveDir(node.id, 1, false)"><span>&#129083;</span></a>
                        <a @click="moveDir(node.id, -1, true)"><span>&#129080;</span></a>
                        <a @click="moveDir(node.id, 1, true)"><span>&#129082;</span></a>
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
    
            axios.delete(`api/directory?id=${directoryId}`).then(()=>{
                this.onReload();
            })
        },

        moveDir(directoryId, direction, moveLevel){
            axios.patch(`api/directory/move`, {
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
            axios.get('api/').then((response) => {
                this.root.children = response.data;
             })
        },

        deleteDir(directoryId){
            var isConfirm = confirm(this.$t("delete_message"));
            if(!isConfirm){
                return;
            }

            axios.delete(`api/directory?id=${directoryId}`).then(function(){
                this.load();
            })
        },
    }
};