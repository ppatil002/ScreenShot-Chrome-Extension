"use strict";
let key1 = "Name1";
let key2 = "Name2";
console.log("popup.js Working Fine");
console.log("Start");
// let i = 0;
// chrome.storage.local.set({ key1: "Prerna" }, function () {
//   console.log("Value is set to " + key1);
// });
// chrome.storage.local.set({ key2: "Pawar" }, function () {
//   console.log("Value is set to " + key2);
// });

// chrome.storage.local.get([key1], function (result) {
//   console.log("Value currently is " + result.key);
// });

// chrome.storage.local.get([key2], function (result) {
//   console.log("Value currently is " + result.key);
// });

//$ Setting the values
// chrome.storage.local.set(
//   {
//     kitten: { name: "Mog", eats: "mice" },
//     monster: { name: "Kraken", eats: "people" },
//   },
//   function () {
//     console.log("Obj set");
//   }
// );

//$ To clear entire Storage
// chrome.storage.local.clear(() => {
//   console.log("Storage Cleared");
// });
let historyItems;
function onGot(item) {
  let values = Object.entries(item);
  console.log("1");
  console.table(values);
  if (values.length > 5) {
    deleteLastImage(values);
  }
  historyItems = item;
  // console.log(item);
}
function onError(error) {
  console.log(`Error: ${error}`);
}

//$ To remove particular element from storage
// chrome.storage.local.remove(["kitten"], () => {
//   console.log("Kitten Removed");
// });

const today = new Date();
const date =
  today.getFullYear() +
  "-" +
  ("0" + (today.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + today.getDate()).slice(-2);
const time =
  today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
const dateTime = date + "-" + time;
// console.log(today);
// console.log(time);
// console.log(dateTime);

// chrome.storage.local.set({ [dateTime]: time }, () => {
//   console.log(dateTime + "is added to storage");
// });

//$ To get all item from the stoarge
function getAllElements() {
  let gettingItem = chrome.storage.local.get();
  gettingItem.then(onGot, onError);
}

getAllElements();

function deleteLastImage(array) {
  let leastRecent = array[0][0];
  for (let i = 0; i < array.length; i++) {
    // console.log(array[i][0]);
    if (leastRecent > array[i][0]) {
      leastRecent = array[i][0];
    }
  }
  console.log(leastRecent);
  chrome.storage.local.remove([leastRecent], () => {
    console.log("got removed");
  });
  getAllElements();
}

console.log("End");
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

//
// History button stuff
//
document
  .getElementById("history-btn-icon")
  .addEventListener("click", showHistory());

function showHistory() {
  // Get current active tab inforamtion
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    var data = {
      historyList: historyItems,
      action: "Show History",
    };
    showHistoryinNewTab(data, currentTab.id, currentTab.index, filename);
  });
}
