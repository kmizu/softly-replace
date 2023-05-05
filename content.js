function isTextInputElement(element) {
    return element.tagName === 'TEXTAREA' || (element.tagName === 'INPUT' && element.type === 'text');
}

function replaceSelectedText(newText) {
  const activeElement = document.activeElement;

  if(isTextInputElement(activeElement)) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    const replacementText = newText;

    const textBefore = activeElement.value.substring(0, start);
    const textAfter = activeElement.value.substring(end);

    activeElement.value = textBefore + replacementText + textAfter;
    activeElement.focus();
    activeElement.setSelectionRange(start, start + replacementText.length);
  } else {
    let selection = window.getSelection();
    selection.baseNode.textContent = newText;
  }
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
        document.body.removeChild(overlay);
        replaceSelectedText(softenedText);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
});
