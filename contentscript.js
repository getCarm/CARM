chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

     // since only one tab should be active and in the current window at once
     // the return variable should only have one entry
    var activeTab = arrayOfTabs[0];
    console.log(activeTab.url);
    alert(activeTab.url);

});