/*
MIT License
Copyright (c) 2022 kazu86
https://opensource.org/licenses/mit-license.php
*/

//
//watchersHash = [
//                    {label:"aaa", userIds:[1,5]},
//                    {label:"bbb", userIds:[1,7]},
//                    ...
//                    {label:"hhh", userIds:[10]}
//               ];

//
// insertAfter
//
function myInsertAfter(item,target) {
    target.parentNode.insertBefore(item,target.nextSibling);
}

//
// event handler for click add button
//
document.getElementById("reg_watcher").addEventListener('click',(event) => {
    const labelPattern  = /^.+$/;
    const idListPattern = /^\d+([\d,]+)*$/;
    let   watcherLabel  = document.getElementById("reg_label").value;
    let   watcherIdsStr = document.getElementById("reg_watcher_ids").value;

    // check if watcherLabel is correct format or not
    if (labelPattern.exec(watcherLabel) === null) {
        alert("Invalid Label format for registration!");
        return;
    }

    // check if watcherIdsStr is correct format or not
    if (idListPattern.exec(watcherIdsStr) === null) {
        alert("Invalid IdList format for registration!");
        return;
    }
    watcherIdsStr = watcherIdsStr.replace(/,$/,"");// remove trailing comma if any
    let watcherIdsArray = watcherIdsStr.split(",");

    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {

        let filteredArray = result.watchersHashArray.filter( (elem) => {
            return elem["label"] == watcherLabel;
        });
        if ( filteredArray.length != 0 ) { // label already exist
            alert(watcherLabel + " has been already registered!");
            return;
        }

        result.watchersHashArray.push({"label":watcherLabel,"userIds":watcherIdsArray});
        chrome.storage.local.set({watchersHashArray:result.watchersHashArray});
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
// update display area
//
function updateDisplayArea() {
    let displayArea = document.getElementById("watcher_display");

    chrome.storage.local.get({'watchersHashArray':[]}, (result) => {
        let watchersHashArray = result.watchersHashArray;

        let selectedBox = document.getElementById("watcher_hash_list_box"); 
        if ( selectedBox.length == 0 ) { // empty
            // remove
            while( displayArea.firstChild ){
                displayArea.removeChild(displayArea.firstChild );
            }
            return;
        }
        let num = selectedBox.selectedIndex;
        if ( num == -1) { // empty
            return;
        }

        // remove
        while( displayArea.firstChild ){
            displayArea.removeChild(displayArea.firstChild );
        }

        let userIds = selectedBox.options[num].value;
        let label = selectedBox.options[num].text;
        chrome.storage.local.get({'watchersHashArray':[]}, (result) => {

            let targetIndex = result.watchersHashArray.findIndex( (elem) => {
                return elem["label"] == label;
            });
            if ( targetIndex == -1 ) {
                return;
            }

            let pTag = document.createElement("p");
            pTag.innerText = result.watchersHashArray[targetIndex]["userIds"];
            displayArea.appendChild(pTag);
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
// event handler for click selectbox
//
document.getElementById("watcher_hash_list_box").addEventListener('click',updateDisplayArea);

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