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