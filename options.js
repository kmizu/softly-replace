document.getElementById('saveApiKey').addEventListener('click', function () {
  const apiKey = document.getElementById('apiKey').value;
  if (apiKey) {
    chrome.storage.sync.set({ apiKey: apiKey }, function () {
      alert('APIキーが保存されました。');
    });
  } else {
    alert('APIキーを入力してください。');
  }
});
