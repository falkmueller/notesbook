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