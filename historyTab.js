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
  for (let i = values.length - 1; i >= 0; i--) {
    let source = values[i][1];
    if (i == 0) {
      document.getElementById("img5").src = source;
    }
    if (i == 1) {
      document.getElementById("img4").src = source;
    }
    if (i == 2) {
      document.getElementById("img3").src = source;
    }
    if (i == 3) {
      document.getElementById("img2").src = source;
    }
    if (i == 4) {
      document.getElementById("img1").src = source;
    }
  }
}

// COPY TO CLIPBOARD FUNCTIONALITY
async function getImageBlobFromUrl(url) {
  const fetchedImageData = await fetch(url);
  const blob = await fetchedImageData.blob();
  return blob;
}

document.querySelector("#btn1").addEventListener("click", async () => {
  const src = document.querySelector("#img1").src;
  try {
    const blob = await getImageBlobFromUrl(src);
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard!");
  } catch (err) {
    console.error(err.name, err.message);
    alert("There was an error while copying image to clipboard :/");
  }
});

document.querySelector("#btn2").addEventListener("click", async () => {
  const src = document.querySelector("#img2").src;
  try {
    const blob = await getImageBlobFromUrl(src);
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard!");
  } catch (err) {
    console.error(err.name, err.message);
    alert("There was an error while copying image to clipboard :/");
  }
});

document.querySelector("#btn3").addEventListener("click", async () => {
  const src = document.querySelector("#img3").src;
  try {
    const blob = await getImageBlobFromUrl(src);
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard!");
  } catch (err) {
    console.error(err.name, err.message);
    alert("There was an error while copying image to clipboard :/");
  }
});

document.querySelector("#btn4").addEventListener("click", async () => {
  const src = document.querySelector("#img4").src;
  try {
    const blob = await getImageBlobFromUrl(src);
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard!");
  } catch (err) {
    console.error(err.name, err.message);
    alert("There was an error while copying image to clipboard :/");
  }
});

document.querySelector("#btn5").addEventListener("click", async () => {
  const src = document.querySelector("#img5").src;
  try {
    const blob = await getImageBlobFromUrl(src);
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard!");
  } catch (err) {
    console.error(err.name, err.message);
    alert("There was an error while copying image to clipboard :/");
  }
});

// function showImages(history) {
//   let values = Object.entries(history);
//   for (let i = 0; i < values.length; i++) {
//     let source = values[i][1];
//     var img = new Image();
//     img.src = source;
//     document.getElementById("body").appendChild(img);
//   }
// }
