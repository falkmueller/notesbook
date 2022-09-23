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