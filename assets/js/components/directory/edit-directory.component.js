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