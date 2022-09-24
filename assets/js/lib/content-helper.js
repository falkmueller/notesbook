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