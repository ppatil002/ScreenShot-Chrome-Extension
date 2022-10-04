"use strict";

console.log("History Page");
// Add listener that recieves the image with additional information
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "Show History") {
    console.log("I am very Happy");
    console.log(message.historyList);
    showImages(message.historyList);
    sendResponse(JSON.stringify(message, null, 4) || true);
    return true;
  }
});

function showImages(history) {
  let values = Object.entries(history);
  for (let i = 0; i < values.length; i++) {
    let source = values[i][1];
    var img = new Image();
    img.src = source;
    document.getElementById("body").appendChild(img);
  }
}
