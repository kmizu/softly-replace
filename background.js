chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'softenText',
    title: '柔らかく言い換える',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'softenText') {
    chrome.tabs.executeScript(
      tab.id,
      { file: 'content.js' },
      function () {
        chrome.tabs.sendMessage(tab.id, { method: 'softenText', text: info.selectionText });
      }
    );
  }
});
