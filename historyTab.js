"use strict";

console.log("Pratik");
// Add listener that recieves the image with additional information
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "Show History") {
    console.log("I am very Happy");
    console.log(message.historyList);
    sendResponse(JSON.stringify(message, null, 4) || true);
    return true;
  }
});
