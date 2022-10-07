"use strict";
//$ To clear entire Storage
// chrome.storage.local.clear(() => {
//   console.log("Storage Cleared");
// });

let historyItems;
function onGot(item) {
  let values = Object.entries(item);
  // console.table(values);
  if (values.length > 5) {
    deleteLastImage(values);
  }
  historyItems = item;
  console.log(historyItems);
}
function onError(error) {
  console.log(`Error: ${error}`);
}

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

function pushOnStorage(key) {
  chrome.storage.local.set({ [dateTime]: key }, () => {
    console.log(dateTime + "is added to storage");
  });
  getAllElements();
}

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

// Function to create a file name for the screenshot
function getFilename(url) {
  url = new URL(url);

  const hostname =
    url.hostname.split(".").length > 2
      ? url.hostname.split(".")[1]
      : url.hostname.split(".")[0];
  var pathname = url.pathname.replace(/\//g, "-");

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

  return hostname + pathname + dateTime + ".png";
}

// Custom area button stuff

document
  .getElementById("customArea")
  .addEventListener("click", clickCustomArea);

function clickCustomArea() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    initiateCustomAreaScreenshot(currentTab, filename);
  });
}

// Visible content button stuff

document
  .getElementById("visibleContent")
  .addEventListener("click", clickVisibleContent);

function clickVisibleContent() {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataURL) => {
      if (dataURL) {
        var data = {
          image: dataURL,
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        };

        sendImageToNewTab(data, currentTab.id, currentTab.index, filename);
      }
    });
  });
}

// History button stuff

document
  .getElementById("recentScreenshots")
  .addEventListener("click", showHistory);

function showHistory() {
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

// Screen Recording button stuff

document
  .getElementById("screenRecord")
  .addEventListener("click", recordScreen);

function recordScreen() {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const currentTab = tabs[0];

    let filename = getFilename(currentTab.url);

    let data = {
      action: "Record Screen",
    };
    recordScreenInNewTab(data, currentTab.id, currentTab.index, filename);
  });
}
