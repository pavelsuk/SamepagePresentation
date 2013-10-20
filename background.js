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

chrome.manifest = chrome.app.getDetails();
function checkIsInstalled() {
	chrome.storage.local.get('installed', function(items) {
		var contentScript;
		if (!items.installed) {
			chrome.storage.local.set({ installed: true });
			contentScript = chrome.manifest.content_scripts[1];
			contentScript.matches.forEach(function(match) {
				chrome.tabs.query({ url: match }, function(results) {
					results.forEach(function(result) {
						contentScript.js.forEach(function(script) {
							chrome.tabs.executeScript(result.id, { file: script });
						});
					});
				});
			});
		}
	});
}
checkIsInstalled();