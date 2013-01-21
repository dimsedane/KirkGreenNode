module.exports.validateInput = validateInput;
function validateInput(data,expected){
    for(var name in data){
        if(expected[name] === undefined){
            console.log('Unexpected entry found: ' + name);
            return false;
        } else if(expected[name] === "Required" || expected[name] === "Optional"){
            expected[name] = "Found";
        }
    }
    
    for(var name in expected){
        if(expected[name] === "Required"){
            console.log('Required entry not found: ' + name);
            return false;
        }
    }
    return true;
}