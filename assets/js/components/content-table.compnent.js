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