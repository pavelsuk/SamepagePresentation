function checkForSamepageUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('://samepage.io/') > -1 || tab.url.indexOf('://localhost:8086/') > -1) {
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkForSamepageUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendRequest(tab.id, {});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	chrome.windows.getCurrent(null, function(window) {
		chrome.windows.update(window.id, { state: (request.fullscreen ? 'fullscreen' : 'maximized') });
	});
	sendResponse();
});
