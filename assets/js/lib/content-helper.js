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
        var resonse = "";
        for (const prop in obj) {
            let key = prop;
            let value = JSON.stringify(obj[prop]).replace(/^\"+|\"+$/g, '');

            if(response != ""){
                resonse += "\n";
            }

            resonse += `${key}: ${value}`;
        }

        return resonse;
    }
};