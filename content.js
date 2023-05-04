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
  const API_KEY = null;
  if (request.method === 'softenText') {
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});
