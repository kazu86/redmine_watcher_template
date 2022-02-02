/*
MIT License
Copyright (c) 2022 kazu86
https://opensource.org/licenses/mit-license.php
*/

//
//watchersHashArray = [
//                        {label:"aaa", userIds:[1,5]},
//                        {label:"bbb", userIds:[1,7]},
//                        ...
//                        {label:"hhh", userIds:[10]}
//                    ];

//
// insertAfter
//
function myInsertAfter(item,target) {
    target.parentNode.insertBefore(item,target.nextSibling);
}

//
// check template format
//
// 1. label must not be empty
// 2. userIds can include only number and commma
function checkTemplateFormat(label,userIdsStr) {

    const labelPattern  = /^.+$/;
    const idListPattern = /^\d+([\d,]+)*$/;

    // check if label is correct format or not
    if (labelPattern.exec(label) === null) {
        alert("Error: " + label + " is invalid Label format for registration!");
        return false;
    }
    // check if userIdsStr is correct format or not
    if (idListPattern.exec(userIdsStr) === null) {
        alert("Error: " + userIdsStr + " is invalid IdList format for registration!");
        return false;
    }

    return true;

}

//
// register template
//
function registerTemplate(label,userIdsStr) {

    let tempUserIds = userIdsStr.replace(/,$/,"");// remove trailing comma if any
    let userIdsArray = tempUserIds.split(",");

    return new Promise( (resolve,reject) => {
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
            let filteredArray = result.watchersHashArray.filter( (elem) => {
                return elem["label"] == label;
            });
            if ( filteredArray.length != 0 ) { // label already exist
                alert("Error: " + label + " has been already registered!\n" + 
                    label + " was ignored.");
                reject();
            } else {
                result.watchersHashArray.push({"label":label,"userIds":userIdsArray});
                chrome.storage.local.set({"watchersHashArray":result.watchersHashArray});
                resolve();
            }

        });
    });
}

//
// update template
//
function registerUpdate(label,userIdsStr) {

    let tempUserIds = userIdsStr.replace(/,$/,"");// remove trailing comma if any
    let userIdsArray = tempUserIds.split(",");

    return new Promise( (resolve,reject) => {
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
            let targetIndex = result.watchersHashArray.findIndex( (elem) => {
                return elem["label"] == label;
            });
            if ( targetIndex == -1 ) { // label not exist
                alert("Error: " + label + " doesn't exist!");
                reject();
            } else {
                result.watchersHashArray[targetIndex]["userIds"] = userIdsArray;
                chrome.storage.local.set({"watchersHashArray":result.watchersHashArray});
                resolve();
            }

        });
    });
}

//
// event handler for click add button
//
document.getElementById("reg_watcher").addEventListener('click',(event) => {

    let   watcherLabel  = document.getElementById("reg_label").value;
    let   watcherIdsStr = document.getElementById("reg_watcher_ids").value;

    if ( checkTemplateFormat(watcherLabel,watcherIdsStr) == false ) {
        return;
    }

    // clear if registration is OK
    registerTemplate(watcherLabel,watcherIdsStr).then( () => {
        document.getElementById("reg_label").value = "";
        document.getElementById("reg_watcher_ids").value = "";
    });

});

//
// evnet handler for click del button
//
document.getElementById("del_selected_watcher_button_0").addEventListener('click',(event) => {
    let selectedBox = document.getElementById("watcher_hash_list_box"); 

    if ( selectedBox.length == 0 ) { // empty
        return;
    }

    let num = selectedBox.selectedIndex;
    let userIds = selectedBox.options[num].value;
    let label = selectedBox.options[num].text;

    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {

        let targetIndex = result.watchersHashArray.findIndex( (elem) => {
            return elem["label"] == label;
        });
        if ( targetIndex == -1 ) {
            return;
        }

        result.watchersHashArray.splice(targetIndex,1); // remove
        chrome.storage.local.set({'watchersHashArray':result.watchersHashArray});
    });
});

//
// event handler for click del_all button
//
document.getElementById("del_all_watcher_button_0").addEventListener('click',(event) => {
    let yesOrNo = window.confirm("Do you really want to delete all the registered data?");
    if ( yesOrNo ) {
        chrome.storage.local.set({'watchersHashArray':[]});
    }
});

//
// evnet handler for click update button
//
document.getElementById("update_selected_watcher_button_0").addEventListener('click',(event) => {

    let selectedBox = document.getElementById("watcher_hash_list_box");
    let num = selectedBox.selectedIndex;
    let watcherLabel = selectedBox.options[num].text;
    let watcherIdsStr = document.getElementById("selected_watcher_ids").value;

    if ( checkTemplateFormat(watcherLabel,watcherIdsStr) == false ) {
        return;
    }

    registerUpdate(watcherLabel,watcherIdsStr);

});

//
// move item in display order list box
//
function moveElementInSelectBox(clickedButton) {
    let buttonId = clickedButton.id;
    let selectTag    = document.getElementById("display_order_list_box");
    let selectedItems = Array.from(selectTag.selectedOptions);
    // It is important to convert HTMLCollection to Array.
    // HTMLCollection : dynamic
    // Array : static
    // When HTMLColection is used to proces reordering, index numbering is dynamically updated.
    // This will cause reordering corruption.
    
    // reverse selectedItems
    if ( buttonId == "order_move_top" || buttonId == "order_move_down" ) {
        selectedItems.reverse();
    }

    for(let i = 0; i < selectedItems.length;++i) {
        let currentItem = selectedItems[i].value;
        let currentText = selectedItems[i].text;

        let firstItem   = selectTag.firstChild;
        let lastItem    = selectTag.lastChild;
        let prevItem    = selectedItems[i].previousElementSibling;
        if ( prevItem == null ) {
            prevItem = firstItem;
        }
        let nextItem    = selectedItems[i].nextElementSibling;
        if ( nextItem == null ) {
            nextItem = lastItem;
        } 

        if ( buttonId == "order_move_top" ) {
            selectTag.insertBefore(selectedItems[i],firstItem);
        } else if ( buttonId == "order_move_up" ) {
            selectTag.insertBefore(selectedItems[i],prevItem);
        } else if ( buttonId == "order_move_down" ) {
            myInsertAfter(selectedItems[i],nextItem);
        } else if ( buttonId == "order_move_bottom" ) {
            myInsertAfter(selectedItems[i],lastItem); 
        }
    }

}

//
// event handler for click move_top/move_up/move_down/move_bottom button
//
document.getElementById("order_move_top").addEventListener('click',(event) => moveElementInSelectBox(event.target));
document.getElementById("order_move_up").addEventListener('click',(event) => moveElementInSelectBox(event.target));
document.getElementById("order_move_down").addEventListener('click',(event) => moveElementInSelectBox(event.target));
document.getElementById("order_move_bottom").addEventListener('click',(event) => moveElementInSelectBox(event.target));

//
// apply reorder
//
document.getElementById("order_apply").addEventListener('click',(event) => {
    let selectedBox = document.getElementById("display_order_list_box"); 

    if ( selectedBox.length == 0 ) { // empty
        return;
    }

    let myWatchersHashArray = [];   
    for (let i = 0; i < selectedBox.length;++i) {
        let currentValue = selectedBox[i].value;
        let currentText = selectedBox[i].text;
        myWatchersHashArray.push({"label":currentText,"userIds":currentValue});
    }
    
    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
        result.watchersHashArray = myWatchersHashArray;
        chrome.storage.local.set({"watchersHashArray":result.watchersHashArray});
    });

});

//
// event handler for click selectbox
//
document.getElementById("watcher_hash_list_box").addEventListener('click',updateDisplayArea);

//
// evnet handler for click export button
//
document.getElementById("export_0").addEventListener('click',(event) => {

    let watchersHashArray = new Promise ( (resolve) => {
        chrome.storage.local.get({'watchersHashArray':[]},resolve);
    }).then( (data) => {

        const dataJson = [encodeURIComponent(JSON.stringify(data, null, 2))];
        //const dataJson = [JSON.stringify(data, null, 2)];

        const objUrl = URL.createObjectURL(
            new Blob(dataJson,{ type:"text/plain"})
        );

        let tempATag = document.createElement("a");
        tempATag.href = objUrl;
        tempATag.download = "redmine_watcher_template.json";
        document.body.appendChild(tempATag);

        tempATag.click();

        tempATag.parentNode.removeChild(tempATag);

    });

});

//
// evnet handler for click import button
//

document.getElementById("import_0").addEventListener('click',(event) => {
    // This is necessary to cover the case that the same file is selected.
    event.target.value = "";
});
document.getElementById("import_0").addEventListener('change',(event) => {

    if (event.target.files.length == 0) {
        return;
    }

    //let yesOrNo = window.confirm("This will remove all existing data.Do you really want to continue?");
    //if ( !yesOrNo ) {
    //    return;
    //}

    let currentJsonFile = event.target.files[0];   
    let fileReader = new FileReader();
    fileReader.readAsText(currentJsonFile);

    fileReader.onload = (event) => {
        let data;

        // prase JSON
        try {
            data = JSON.parse(decodeURIComponent(fileReader.result));
        } catch (e) {
            console.error(e);
            alert("Error: Failed to parse JSON!");
            return;
        }

        watchersHashArray = data.watchersHashArray;

        // label must be unique
        let labelArray = watchersHashArray.map((value) => {
            return value["label"];
        });
        let uniqLabelArray = new Set(labelArray);
        if ( labelArray.length != uniqLabelArray.size) {
            alert("Error: Label must be unique!");
            return;
        }
  
        // doing serially(in order)
        // await is used to realize this
        (async (watchersHashArray) => {
            for(let i = 0; i < watchersHashArray.length;i++) {
                let label = watchersHashArray[i]["label"];
                let userIdsStr = watchersHashArray[i]["userIds"].join(",");
                if ( checkTemplateFormat(label,userIdsStr) == false ) {
                    continue;
                }

                try {
                    await registerTemplate(label,userIdsStr);
                } catch(e) {
                    continue;
                }
            }
        })(watchersHashArray);

    };

});

//
// update display area
//
function updateDisplayArea() {
    let displayArea = document.getElementById("selected_watcher_ids");

    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
        let watchersHashArray = result.watchersHashArray;

        let selectedBox = document.getElementById("watcher_hash_list_box"); 
        if ( selectedBox.length == 0 ) { // empty
            displayArea.value = "";
            return;
        }

        let num = selectedBox.selectedIndex;
        if ( num == -1) { // empty
            return;
        }

        displayArea.value = "";
        let userIds = selectedBox.options[num].value;
        let label = selectedBox.options[num].text;
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {

            let targetIndex = result.watchersHashArray.findIndex( (elem) => {
                return elem["label"] == label;
            });
            if ( targetIndex == -1 ) {
                return;
            }

            displayArea.value = result.watchersHashArray[targetIndex]["userIds"];
        });

    });
}

//
// update select tag in delete
//
function updateSelectBox(watchersHashArray) {
    let selectTag    = document.getElementById("watcher_hash_list_box");

    // remove
    while( selectTag.firstChild ){
        selectTag.removeChild(selectTag.firstChild );
    }
    
    // update option tag in select box
    for (let i = 0; i < watchersHashArray.length; ++i) {
        let optionTag = document.createElement("option");
        optionTag.value = watchersHashArray[i]["userIds"];
        optionTag.text = watchersHashArray[i]["label"];
        selectTag.appendChild(optionTag);
    }
};

//
// update select tag in order
//
function updateDisplayOrderSelectBox(watchersHashArray) {
    let selectTag    = document.getElementById("display_order_list_box");

    // remove
    while( selectTag.firstChild ){
        selectTag.removeChild(selectTag.firstChild );
    }
    
    // update option tag in select box
    for (let i = 0; i < watchersHashArray.length; ++i) {
        let optionTag = document.createElement("option");
        optionTag.value = watchersHashArray[i]["userIds"];
        optionTag.text = watchersHashArray[i]["label"];
        selectTag.appendChild(optionTag);
    }
};

//
// event to monitor chrome storage update
//
chrome.storage.onChanged.addListener((changes,namespace) => {

    if (namespace == "local") {
        if (changes.watchersHashArray) {
            let watchersHashArray = changes.watchersHashArray.newValue;

            // update select box in delete
            updateSelectBox(watchersHashArray);
            
            // update display area
            updateDisplayArea();

            // update select box in order
            updateDisplayOrderSelectBox(watchersHashArray);

        }
    }
});

//
// event handler for load page
//
window.addEventListener('load', () => {
    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
        let watchersHashArray = result.watchersHashArray;

        // update select box
        updateSelectBox(watchersHashArray);

        // update display area
        updateDisplayArea();

        // update select box in order
        updateDisplayOrderSelectBox(watchersHashArray);

    });
});