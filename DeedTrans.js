// 使用 Fetch API 发送 HTTP 请求的函数
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 使用 Google Translate API 翻译文本的函数
function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;
    httpRequest(url)
      .then((translations) => {
        let translatedText = '';
        translations[0].forEach((translation) => {
          translatedText += translation[0];
        });
        resolve(translatedText);
      })
      .catch((error) => {
        console.log("Translation error: " + error.message);
        reject(error);
      });
  });
}

async function processMessage({ message }) {
	let Omsg = message.content;
  if (message.author === "ai") {
    try {
      const paragraphs = message.content.split("<br>");
      let translatedText = '';
      for (const paragraph of paragraphs) {
        const translatedParagraph = await translateText(paragraph, "zh-CN");
        translatedText += translatedParagraph + "<br>";
      }
      message.content += `<!--hidden-from-ai-start--><br>${translatedText}<!--hidden-from-ai-end-->`;
    } catch (error) {
      console.log("Translation error: " + error.message);
    }
  } else if (message.author === "user") {
    try {
      const paragraphs = message.content.split("<br>");
      let translatedText = '';
      for (const paragraph of paragraphs) {
        const translatedParagraph = await translateText(paragraph, "en");
        translatedText += translatedParagraph + "<br>";
      }
      message.content =  translatedText+`<!--hidden-from-ai-start-->${Omsg}<!--hidden-from-ai-end-->`;
    } catch (error) {
      console.log("Translation error: " + error.message);
    }
  }
}

oc.thread.on("MessageEdited", async function ({ message }) {
  if (oc.thread.messages.at(-1) === message) {
    await processMessage({ message });
  }
});

oc.thread.on("MessageAdded", processMessage);
