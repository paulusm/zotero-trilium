XMLHttpRequest = require("xmlhttprequest");

triliumAuth = async function(){

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();

    const etapiToken = '<token>';
    const etapiUrl = '<url>/etapi/create-note>';

    xhr.open("POST", etapiUrl, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", etapiToken);

    xhr.onreadystatechange = () => { // Call a function when the state changes.
   
    if (xhr.readyState === 4) {
        console.log (xhr.responseCode);
        console.log (xhr.responseText);
    }
    }
    xhr.send("type=text&title=testNote&content=<h1>wtf</h1><b>larry</b>?&parentNoteId=cJOquuBESvOF");

}

module.exports = triliumAuth;

triliumAuth();
