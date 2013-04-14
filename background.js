function checkForSamepageUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('://samepage.io/') > -1 || tab.url.indexOf('://localhost:8080/') > -1) {
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkForSamepageUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendRequest(tab.id, {}, function() {
    console.log('success');
  });
});
