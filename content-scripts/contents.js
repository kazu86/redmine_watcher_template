/*
MIT License
Copyright (c) 2022 kazu86
https://opensource.org/licenses/mit-license.php
*/

//
// insertAfter
//
function myInsertAfter(item,target) {
    target.parentNode.insertBefore(item,target.nextSibling);
}

//
// handle server response in the case adding watchers for new issue
//
function myEvalAddWatcherNewIssue(myStringOrg) {
    let myString = myStringOrg.replace(/(\\r)?\\n/gm,"\n");
    let stringArray = myString.split("\n");

    let removeRegExp = /\$\(([\#\w_"]+)\)\.remove\(\);/; // $("#issue_watcher_user_ids_1").remove();
    let appendRegExp = /\$\(\'\#watchers_inputs\'\)\.append\(\'(.+)\'\);/; // $('#watchers_inputs').append('');

    let matchedResult1 = "";
    let matchedResult2 = "";
    let matchedString = "";

    for (let i = 0; i < stringArray.length; i++) {
        matchedResult1 = stringArray[i].match(removeRegExp);
        matchedResult2 = stringArray[i].match(appendRegExp);
        if ( matchedResult1 ) {
            matchedString = matchedResult1[1].replace(/\"/g,"");
            $(matchedString).remove();
        } else if ( matchedResult2 ) {
            matchedString = matchedResult2[1].replace(/\\"/g,"\"").replace(/\\\//g,"\/");
            $('#watchers_inputs').append(matchedString);
        }
    }
}

//
// add watchers for new issue
//
function myAddWatcherNewIssue(url,selectBox) {

    if (selectBox.length == 0 ) { // empty
        return;
    }
    let selectedNum = selectBox.selectedIndex;
    let selectedValue = selectBox.options[selectedNum].value;
    let selectedText = selectBox.options[selectedNum].text;
    let selectedUserIds = selectedValue.split(",");

    let convertedUserIds = [];
    for (let i = 0; i < selectedUserIds.length; ++i) {
        if ( isValidUserId(selectedUserIds[i]) ) {
            convertedUserIds.push(Number(selectedUserIds[i]));
        }
    }
    if ( convertedUserIds.length == 0 ) {
        console.error("valid user id not found!");
        return;
    }

    let csrfToken = document.querySelector("meta[name=csrf-token]").content;

    fetch(url,{
        method:'post',
        headers:{"Content-Type":"application/json; charset=utf-8","X-CSRF-Token":csrfToken},
        body:JSON.stringify({ "watcher": { "user_ids": convertedUserIds } })
    }).then( (response) => {
        if (!response.ok) {
            throw new Error("response error!");
        }
        return response.text();
    }).then((data) => {
        myEvalAddWatcherNewIssue(data);
    }).catch((error) => {
        //throw new Error(error);
        console.error(error);
    });

}

//
// delete watchers for new issue
//
function myDelWatcherNewIssue(selectBox) {

    if (selectBox.length == 0 ) { // empty
        return;
    }
    let selectedNum = selectBox.selectedIndex;
    let selectedValue = selectBox.options[selectedNum].value;
    let selectedText = selectBox.options[selectedNum].text;
    let selectedUserIds = selectedValue.split(",");

    let convertedUserIds = [];
    for (let i = 0; i < selectedUserIds.length; ++i) {
        if ( isValidUserId(selectedUserIds[i]) ) {
            convertedUserIds.push(Number(selectedUserIds[i]));
        }
    }
    if ( convertedUserIds.length == 0 ) {
        console.error("valid user id not found!");
        return;
    }

    let checkBoxs = document.querySelectorAll("span#watchers_inputs input[type=checkbox][name=issue\\[watcher_user_ids\\]\\[\\]]");
    let currnetWatcherUserIds = [];
    for (let i = 0; i < checkBoxs.length; ++i) {
        if (checkBoxs[i].checked) {
            currnetWatcherUserIds.push(Number(checkBoxs[i].value));
        }
    }

    for (let i = 0; i < convertedUserIds.length; ++i) {
        if (currnetWatcherUserIds.includes(convertedUserIds[i])) {
            let inputTag = Array.from(checkBoxs).filter( (element) => {
                return Number(element.value) === convertedUserIds[i];
            });

            inputTag[0].checked = false;
        }
    }

}

//
// handle server response in the case adding watchers for exist issue
//
function myEvalAddWatcherExistIssue(myHtmlText) {
    let currentHtml = document.querySelector("#watchers");
    let myDom = new DOMParser().parseFromString(myHtmlText,"text/html");
    let newHtmls = myDom.querySelectorAll("#watchers > *");

    // remove
    while( currentHtml.firstChild ){
        currentHtml.removeChild(currentHtml.firstChild );
    }

    for (let i = 0; i < newHtmls.length; i++) {
        currentHtml.appendChild(newHtmls[i]);
    }
}

//
// add watchers for exist issue
//
function myAddWatcherExistIssue(url,selectBox,issueId,projectId) {

    if (selectBox.length == 0 ) { // empty
        return;
    }
    let selectedNum = selectBox.selectedIndex;
    let selectedValue = selectBox.options[selectedNum].value;
    let selectedText = selectBox.options[selectedNum].text;
    let selectedUserIds = selectedValue.split(",");

    // FormData
    let myFormData = new URLSearchParams();
    myFormData.append("object_type","issue");
    myFormData.append("object_id",issueId);
    myFormData.append("project_id",projectId);
    myFormData.append("user_search","");

    for (let i = 0; i < selectedUserIds.length; ++i) {
        if ( isValidUserId(selectedUserIds[i]) ) {
            myFormData.append("watcher[user_ids][]",Number(selectedUserIds[i]));
        }
    }

    let csrfToken = document.querySelector("meta[name=csrf-token]").content;

    fetch(url,{
        method:'post',
        headers:{"Content-Type":"application/x-www-form-urlencoded; charset=utf-8","X-CSRF-Token":csrfToken},
        body:myFormData.toString()
    }).then( (response) => {
        if (!response.ok) {
            throw new Error("response error!");
        }
        return response.text();
    }).then((data) => {
        myEvalAddWatcherExistIssue(data);
    }).catch((error) => {
        //throw new Error(error);
        console.error(error);
    });

}

//
// handle server response in the csae deleting watchers for exist issue
//
function myEvalDelWatcherExistIssue(myStringOrg) {
    let myString = myStringOrg.replace(/(\\r)?\\n/gm,"");

    let htmlRegExp   = /\$\(\'\#watchers\'\)\.html\(\'(.+)\'\)\;/m; // $('#watchers').html(''); 

    let matchedResult3 = "";
    let matchedString = "";

    matchedResult3 = myString.match(htmlRegExp);
    if ( matchedResult3 ) {
        matchedString = matchedResult3[1].replace(/\\\"/g,"\"").replace(/\\\//g,"\/");
        $('#watchers').html(matchedString);
    }

}

//
// del watchers for exist issue
//
function myDelWatcherExistIssue(selectBox) {

    if (selectBox.length == 0 ) { // empty
        return;
    }
    let selectedNum = selectBox.selectedIndex;
    let selectedValue = selectBox.options[selectedNum].value;
    let selectedText = selectBox.options[selectedNum].text;
    let selectedUserIds = selectedValue.split(",");

    let convertedUserIds = [];
    for (let i = 0; i < selectedUserIds.length; ++i) {
        if ( isValidUserId(selectedUserIds[i]) ) {
            convertedUserIds.push(Number(selectedUserIds[i]));
        }
    }
    if ( convertedUserIds.length == 0 ) {
        console.error("valid user id not found!");
        return;
    }

    let currnetWatcherUserATags = document.querySelectorAll("a.delete.icon-only.icon-del[data-remote=true][rel=nofollow][data-method=delete]");
    if ( currnetWatcherUserATags.length == 0 ) {
        return;
    }
    let currnetWatcherUserIdsHash = {};
    for (let i = 0; i < currnetWatcherUserATags.length; ++i) {
        let href = currnetWatcherUserATags[i].href;
        let userId = Number(href.match(/\/watchers\/(\d+)$/)[1]);
        currnetWatcherUserIdsHash[userId] = href;
    }

    for (let i = 0; i < convertedUserIds.length; ++i) {
        if (convertedUserIds[i] in currnetWatcherUserIdsHash) {
            let csrfToken = document.querySelector("meta[name=csrf-token]").content;
            let url = currnetWatcherUserIdsHash[convertedUserIds[i]];

            fetch(url,{
                method:'delete',
                headers:{"X-CSRF-Token":csrfToken,
                        "Accept":"*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"}
            }).then( (response) => {
                if (!response.ok) {
                    throw new Error("response error!");
                }
                return response.text();
            }).then((data) => {
                myEvalDelWatcherExistIssue(data);
            }).catch((error) => {
                //throw new Error(error);
                console.error(error);
            });
        }
    }
}

//
// check if user id is valid or not
//
function isValidUserId(id) {
    let assigneeSelect = document.querySelectorAll('#issue_assigned_to_id option');
    let userIdHash = {};
    for (let i = 0; i < assigneeSelect.length; i++) {
        userIdHash[Number(assigneeSelect[i].value)] = assigneeSelect[i].text;
    }

    if (id in userIdHash) {
        return true;
    } else {
        return false;
    }
}

//
// get user name from user id
//
function getUserName(id) {
    let assigneeSelect = document.querySelectorAll('#issue_assigned_to_id option');
    let userIdHash = {};
    for (let i = 0; i < assigneeSelect.length; i++) {
        userIdHash[Number(assigneeSelect[i].value)] = assigneeSelect[i].text;
    }

    if (id in userIdHash) {
        return userIdHash[id];
    } else {
        return "Unknown(will be ignored)";
    }
}

//
// update display area according to selected item
//
function updateDisplayArea(selectBox,displayArea) {

    if ( selectBox.length == 0 ) { // empty
        // remove child element
        while( displayArea.firstChild ){
            displayArea.removeChild(displayArea.firstChild );
        }
        return;
    }

    let num = selectBox.selectedIndex;
    let value = selectBox.options[num].value;
    let text = selectBox.options[num].text;
    let idArray = value.split(",");

    // remove child element
    while( displayArea.firstChild ){
        displayArea.removeChild(displayArea.firstChild );
    }

    for (const id of idArray) {
        let name = getUserName(Number(id));
        let pTag = document.createElement("p");
        pTag.innerText = id + ":" + name;
        displayArea.appendChild(pTag);
    }

}

//
// update selectbox according to storage update
//
function reflectStorageChange (changes,namespace,selectBox,selectedItem) {
    if (namespace == "local") {
        if (changes.watchersHashArray) {
            let watchersHashArray = changes.watchersHashArray.newValue;

            // remove
            while( selectBox.firstChild ){
                selectBox.removeChild(selectBox.firstChild );
            }
    
            // update option tag in select box
            for (let i = 0; i < watchersHashArray.length; ++i) {
                let optionTag = document.createElement("option");
                optionTag.value = watchersHashArray[i]["userIds"];
                optionTag.text  = watchersHashArray[i]["label"];
                selectBox.appendChild(optionTag);
            }

            // update display area
            updateDisplayArea(selectBox,selectedItem);
        }
    }
}

window.addEventListener('load', () => {

    // check if this is Redmine or not
    let metaDescription = document.querySelector("meta[name=description][content=Redmine]");
    if ( !metaDescription ) {
        return;
    }

    let watcherLabel = document.querySelector("#watchers_form label");
    let watchersA = document.querySelector("#watchers div a:nth-child(1)");

    if (watcherLabel) { // for new issue

        // div
        let myDivTag = document.createElement("div");
        myDivTag.id = "chrome_ext_div";
        if ( document.getElementById("watchers_form_container") == null ) {
            console.error("id=watchers_form_container not found!");
            return;
        }
        myInsertAfter(myDivTag,document.getElementById("watchers_form_container"));

        // div > p
        let myPTag = document.createElement("p");
        myDivTag.append(myPTag);

        // div > p > select
        let newSelectBox = document.createElement("select");
        newSelectBox.name = "chrome_ext_watcher_list_box";
        newSelectBox.id   = "chrome_ext_watcher_list_box";
        //newSelectBox.size = 1;
        myPTag.appendChild(newSelectBox);

        // div > p > select > option
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
            let watchersHashArray = result.watchersHashArray;

            for (let i = 0; i < watchersHashArray.length; ++i) {
                let optionTag = document.createElement("option");
                optionTag.value = watchersHashArray[i]["userIds"];
                optionTag.text  = watchersHashArray[i]["label"];
                newSelectBox.appendChild(optionTag);
            }
        });

        // add watcher button
        // div > p > input
        let addWatchButton = document.createElement("input");
        let addWatchButtonId = "chrome_ext_add_watcher_button";
        addWatchButton.type = "button";
        addWatchButton.innerText = "add";
        addWatchButton.value = "add";
        addWatchButton.id = addWatchButtonId;
        newSelectBox.after(addWatchButton);

        // del watcher button
        // div > p > input
        let delWatchButton = document.createElement("input");
        let delWatchButtonId = "chrome_ext_del_watcher_button";
        delWatchButton.type = "button";
        delWatchButton.innerText = "del";
        delWatchButton.value = "del";
        delWatchButton.id = delWatchButtonId;
        addWatchButton.after(delWatchButton);

        // display area
        // div > p > span
        let selectedItemDisplay = document.createElement("span");
        selectedItemDisplay.id = "chrome_ext_selected_item_span";
        delWatchButton.after(selectedItemDisplay);

        // event to monitor selectBox update
        newSelectBox.addEventListener('change', (event) => updateDisplayArea(event.target,selectedItemDisplay));
        newSelectBox.addEventListener('focus',  (event) => updateDisplayArea(event.target,selectedItemDisplay));

        // event to monitor chrome storage update
        chrome.storage.onChanged.addListener((changes,namespace) => reflectStorageChange(changes,namespace,newSelectBox,selectedItemDisplay));

        // event to monitor button click
        let watcherATag = document.querySelector(".search_for_watchers a.icon.icon-add-bullet[data-remote=true][data-method=get]");
        if ( watcherATag == null ) {
            console.error("a tag for adding watcher not found!");
            return;
        }
        let href = watcherATag.href;
        let url = href ? href.replace(/\/new\?/, "/append?") : href;
        document.getElementById(addWatchButtonId).addEventListener("click",(event) => myAddWatcherNewIssue(url,newSelectBox));
        document.getElementById(delWatchButtonId).addEventListener("click",(event) => myDelWatcherNewIssue(newSelectBox));

        // update display area
        updateDisplayArea(newSelectBox,selectedItemDisplay)

    } else if (watchersA) { // for existing issue

        // div
        let myDivTag = document.createElement("div");
        myDivTag.id = "chrome_ext_div";
        if ( document.getElementById("watchers") == null ) {
            console.error("id=watchers not found!");
            return;
        }
        myInsertAfter(myDivTag,document.getElementById("watchers"));

        // div > p
        let myPTag = document.createElement("p");
        myDivTag.append(myPTag);

        // div > p > select
        let newSelectBox = document.createElement("select");
        newSelectBox.name = "chrome_ext_watcher_list_box";
        newSelectBox.id   = "chrome_ext_watcher_list_box";
        //newSelectBox.size = 1;
        myPTag.appendChild(newSelectBox);

        // div > p> select > option
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
            let watchersHashArray = result.watchersHashArray;

            for (let i = 0; i < watchersHashArray.length; ++i) {
                let optionTag = document.createElement("option");
                optionTag.value = watchersHashArray[i]["userIds"];
                optionTag.text  = watchersHashArray[i]["label"];
                newSelectBox.appendChild(optionTag);
            }
        });

        // add watcher button
        // div > p > input
        let addWatchButton = document.createElement("input");
        let addWatchButtonId = "chrome_ext_add_watcher_button";
        addWatchButton.type = "button";
        addWatchButton.innerText = "add";
        addWatchButton.value = "add";
        addWatchButton.id = addWatchButtonId;
        newSelectBox.after(addWatchButton);

        // del watcher button
        // div > p > input
        let delWatchButton = document.createElement("input");
        let delWatchButtonId = "chrome_ext_del_watcher_button";
        delWatchButton.type = "button";
        delWatchButton.innerText = "del";
        delWatchButton.value = "del";
        delWatchButton.id = delWatchButtonId;
        addWatchButton.after(delWatchButton);

        // display area
        // div > p > span
        let selectedItemDisplay = document.createElement("span");
        selectedItemDisplay.id = "chrome_ext_selected_item_span";
        delWatchButton.after(selectedItemDisplay);
        
        // event to monitor selectBox update
        newSelectBox.addEventListener('change', (event) => updateDisplayArea(event.target,selectedItemDisplay));
        newSelectBox.addEventListener('focus',  (event) => updateDisplayArea(event.target,selectedItemDisplay));

        // event to monitor chrome storage update
        chrome.storage.onChanged.addListener((changes,namespace) => reflectStorageChange(changes,namespace,newSelectBox,selectedItemDisplay));

        // event to monitor button click
        let addWatcherATag = document.querySelector("#watchers > div.contextual > a[data-remote=true][data-method=get]");
        if ( addWatcherATag == null ) {
            console.error("a tag for adding watcher not found!");
            return;
        }
        let issueId = Number(addWatcherATag.href.match(/\/watchers\/new\?object_id\=(\d+)/)[1]);
        let url = addWatcherATag.href.replace(/\/watchers\/.*$/g,"/watchers");
        let projectId = document.querySelector("span.current-project").innerText;
        if ( document.querySelector("span.current-project") == null ) {
            console.error("project name not found!");
            return;
        }
        document.getElementById(addWatchButtonId).addEventListener("click",(event) => myAddWatcherExistIssue(url,newSelectBox,issueId,projectId));
        document.getElementById(delWatchButtonId).addEventListener("click",(event) => myDelWatcherExistIssue(newSelectBox));

        // update display area
        updateDisplayArea(newSelectBox,selectedItemDisplay);
    }
});