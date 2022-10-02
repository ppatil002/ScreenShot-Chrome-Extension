"use strict";

console.log("popup.js Working Fine");
// Function to create a file name for the screenshot
function getFilename(url) {
  // Creates a url object to parse the url more easily
  url = new URL(url);

  // Get the hostname and pathname of the url
  const hostname =
    url.hostname.split(".").length > 2
      ? url.hostname.split(".")[1]
      : url.hostname.split(".")[0];
  var pathname = url.pathname.replace(/\//g, "-");

  // Get current date and time
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + today.getDate()).slice(-2);
  const time =
    today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  const dateTime = date + "-" + time;

  if (pathname !== "-") pathname += "-";

  return "snapper-" + hostname + pathname + dateTime + ".png";
}

//
// Custom area button stuff
//

// EventListener for "Custom Area" button
document
  .getElementById("customArea")
  .addEventListener("click", clickCustomArea);

// Function to call when "Custom Area" button is clicked.
function clickCustomArea() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    initiateCustomAreaScreenshot(currentTab, filename);
  });
}

//
// Visible content button stuff
//

// EventListener for "Visible Content" button
document
  .getElementById("visibleContent")
  .addEventListener("click", clickVisibleContent);

// Function to call when "Visible Content" button is clicked.
function clickVisibleContent() {
  // Get current active tab inforamtion
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    console.log("visible");
    // Start capturing the visible content of the currently active tab
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataURL) => {
      if (dataURL) {
        var data = {
          image: dataURL,
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        };

        // Send the image including additional information to new tab
        sendImageToNewTab(data, currentTab.id, currentTab.index, filename);
      }
    });
  });
}
