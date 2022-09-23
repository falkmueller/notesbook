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