function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const newNode = document.createTextNode(newText);
  range.insertNode(newNode);
  selection.removeAllRanges();
}

chrome.runtime.onMessage.addListener(function (request) {
  chrome.storage.sync.get(['apiKey'], function (result) {
    const API_KEY = result.apiKey;
    if (!API_KEY) {
      alert('APIキーが設定されていません。オプションページで設定してください。');
      return;
    }
    if (request.method === 'softenText') {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.innerHTML = '<p style="color: white; font-size: 24px;">言い換え中...</p>';
      document.body.appendChild(overlay);
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
          {role: "system", content: 'あなたはSNSの専門家です。特にTwitterに詳しいです'},
          {role: "user", content: `
                  以下の文章はTwitterに投稿されようとしているものです。
                  表現として社会的に好ましくないものがあれば、より柔らかく言い換えてください。解説などほかの文言は一切いれないでください: 
                  ${request.text}
          `}],
          max_tokens: 1000,
          temperature: 0.1
        })
      })
      .then(response => response.json())
      .then(data => {
        const softenedText = data.choices[0].message.content.trim();
        replaceSelectedText(softenedText);
        document.body.removeChild(overlay);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
});
