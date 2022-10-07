console.log("Background Started");

// initiates custom area screenshot
async function initiateCustomAreaScreenshot(currentTab, filename) {
  console.log("Background strated");
  await captureTab(200).then(async (createdScreenshot) => {
    if (createdScreenshot) {
      chrome.tabs.sendMessage(
        currentTab.id,
        {
          imageURI: createdScreenshot,
          currentTab: currentTab,
          filename: filename,
          action: "customArea",
        },
        (responseCallback) => {
          if (responseCallback) {
            console.log("Create another canvas overlay to clip");
          }
        }
      );
    }
  });
}

// Function to capture the currently visible part of the active tab
async function captureTab(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      chrome.tabs.captureVisibleTab(
        null,
        { format: "png" },
        async (dataURL) => {
          if (dataURL) {
            resolve(dataURL);
          }
        }
      );
    }, timeout);
  });
}

// Function to send the screenshot to the new tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data.action === "customAreaSuccessful") {
    // Call sendImageToNewTab() with the new screenshot of the selected area
    sendImageToNewTab(
      message.data, //? data contains img url img width&height
      message.currentTabId,
      message.currentTabIndex,
      message.filename
    );

    sendResponse(JSON.stringify(message, null, 4) || true);
  }
});

// Sending Image to new tab
async function sendImageToNewTab(
  data,
  currentTabId,
  currentTabIndex,
  filename
) {
  let URL = "screenshot_edit.html";
  const createdTabPromise = createTab(currentTabId, currentTabIndex, URL);

  createdTabPromise.then((createdTab) => {
    chrome.tabs.query(
      {
        currentWindow: true,
        url: "chrome-extension://iemghmgbnaiiidmfabbkmcenlhofoifl/" + URL,
      },
      function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (
            tabs[i].id !== createdTab.id &&
            tabs[i].index > currentTabIndex + 1
          ) {
            chrome.tabs.remove(tabs[i].id);
          }
        }
      }
    );

    data.action = "sendImageToNewTab";
    data.filename = filename;

    chrome.tabs.sendMessage(createdTab.id, data, (responseCallback) => {
      if (responseCallback) {
        console.log(
          "Image clipped and send from content to background(Open New Tab)"
        );
        chrome.tabs.update(createdTab.id, { active: true, highlighted: true });
      }
    });
  });
}

// create a new tab
function createTab(currentTabId, currentTabIndex, URL) {
  return new Promise((resolve) => {
    chrome.tabs.create(
      {
        active: false,
        url: URL,
        openerTabId: currentTabId,
        index: currentTabIndex + 1,
      },
      async (createdTab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (info.status === "complete" && tabId === createdTab.id) {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(createdTab);
          }
        });
      }
    );
  });
}

async function showHistoryinNewTab(
  data,
  currentTabId,
  currentTabIndex,
  filename
) {
  let URL = "historyTab.html";
  const createdTabPromise = createTab(currentTabId, currentTabIndex, URL);

  createdTabPromise.then((createdTab) => {
    chrome.tabs.query(
      {
        currentWindow: true,
        url: "chrome-extension://iemghmgbnaiiidmfabbkmcenlhofoifl/" + URL,
      },
      function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (
            tabs[i].id !== createdTab.id &&
            tabs[i].index > currentTabIndex + 1
          ) {
            chrome.tabs.remove(tabs[i].id);
          }
        }
      }
    );

    data.action = "Show History";
    data.filename = filename;

    chrome.tabs.sendMessage(createdTab.id, data, (responseCallback) => {
      if (responseCallback) {
        console.log("Fetch data from local storage");

        chrome.tabs.update(createdTab.id, { active: true, highlighted: true });
      }
    });
  });
}

async function recordScreenInNewTab(data, currentTabId, currentTabIndex, filename) {
  let URL = "screenRecording.html";
  const createdTabPromise = createTab(currentTabId, currentTabIndex, URL);

  createdTabPromise.then((createdTab) => {
    chrome.tabs.query(
      {
        currentWindow: true,
        url: "chrome-extension://iemghmgbnaiiidmfabbkmcenlhofoifl/" + URL,
      },
      function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (
            tabs[i].id !== createdTab.id &&
            tabs[i].index > currentTabIndex + 1
          ) {
            chrome.tabs.remove(tabs[i].id);
          }
        }
      }
    );

    data.action = "Record Screen";
    data.filename = filename;

    chrome.tabs.sendMessage(createdTab.id, data, (responseCallback) => {
      if (responseCallback) {
        console.log("Open Video Recorder");
        chrome.tabs.update(createdTab.id, { active: true, highlighted: true });
      }
    });
  });
}
