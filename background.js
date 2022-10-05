console.log("Background Started");

// Function that initiates the process of creating a custom area screenshot
async function initiateCustomAreaScreenshot(currentTab, filename) {
  // Hide scrollbar before capturing the tab to avoid showing the scrollbar in the selection area
  // await sendMessageToToggleScrollbar("hideScrollbar", currentTab);
  console.log("Background strated");
  // Capture visible tab to draw the selection area over
  await captureTab(200).then(async (createdScreenshot) => {
    if (createdScreenshot) {
      // Send message to the custom area content script to display overlay
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

// Function to asynchronously capture the currently visible part of the active tab and return the screenshot
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

// Function to listen to the custom area content script (content-custom-area.js) to send the custom area image to the new tab
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

// Function to send an image + additional information to a new tab
async function sendImageToNewTab(
  data,
  currentTabId,
  currentTabIndex,
  filename
) {
  // Create new tab to place the created screenshot in
  let URL = "screenshot_edit.html";
  const createdTabPromise = createTab(currentTabId, currentTabIndex, URL);

  // Run when promise is fulfilled (content script on new tab loaded)
  createdTabPromise.then((createdTab) => {
    // Workaround to fix the bug where 2 tabs are created after selecting a custom area to screenshot
    // TODO: Replace with better solution for the bug
    // Go through all tabs matching the url and close everyone that doesn't match the id of the created tab & and the index is bigger than the current tab index + 2
    chrome.tabs.query(
      {
        currentWindow: true,
        // url: "chrome-extension://dfofdengbpakahfhbfdoeicpecgbldco/screenshot_edit.html",
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

    // Add action and filename to data object
    data.action = "sendImageToNewTab";
    data.filename = filename;

    // Send the image + additional information to the newly created tab
    chrome.tabs.sendMessage(createdTab.id, data, (responseCallback) => {
      if (responseCallback) {
        console.log(
          "Image clipped and send from content to background(Open New Tab)"
        );
        // Manually change to the newly created tab
        chrome.tabs.update(createdTab.id, { active: true, highlighted: true });
      }
    });
  });
}

// Function to asynchronously create a new tab and return created tab after its content script is loaded
function createTab(currentTabId, currentTabIndex, URL) {
  return new Promise((resolve) => {
    chrome.tabs.create(
      {
        active: false,
        url: URL,
        // url: "screenshot_edit.html",
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

// Function to send an image + additional information to a new tab
async function showHistoryinNewTab(
  data,
  currentTabId,
  currentTabIndex,
  filename
) {
  // Create new tab to place the created screenshot in
  let URL = "historyTab.html";
  const createdTabPromise = createTab(currentTabId, currentTabIndex, URL);

  // Run when promise is fulfilled (content script on new tab loaded)
  createdTabPromise.then((createdTab) => {
    // Workaround to fix the bug where 2 tabs are created after selecting a custom area to screenshot
    // TODO: Replace with better solution for the bug
    // Go through all tabs matching the url and close everyone that doesn't match the id of the created tab & and the index is bigger than the current tab index + 2
    chrome.tabs.query(
      {
        currentWindow: true,
        // url: "chrome-extension://dfofdengbpakahfhbfdoeicpecgbldco/screenshot_edit.html",
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

    // Add action and filename to data object
    data.action = "Show History";
    data.filename = filename;

    // Send the image + additional information to the newly created tab
    chrome.tabs.sendMessage(createdTab.id, data, (responseCallback) => {
      if (responseCallback) {
        console.log("Fetch data from local storage");

        // Manually change to the newly created tab
        chrome.tabs.update(createdTab.id, { active: true, highlighted: true });
      }
    });
  });
}
