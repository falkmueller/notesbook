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