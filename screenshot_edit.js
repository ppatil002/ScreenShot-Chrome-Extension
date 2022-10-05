"use strict";

console.log("Working area");
// Add listener that recieves the image with additional information
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendImageToNewTab") {
    // var image = document.getElementById("capture_image");
    var downloadButtonPNG = document.getElementById("download_png");

    // Set image source as base64 image
    // image.src = message.image;

    let originalImage = new Image();
    originalImage.src = message.image;
    // document.getElementById("body").appendChild(originalImage);

    const img1 = new Image();
    const temp1 = message.image;
    //Set both image and canvas
    img1.src = temp1;
    img1.width = message.width;
    img1.height = message.height;
    document.getElementById("img64").src = temp1;

    originalImage.addEventListener("load", function () {
      pushOnStorage(originalImage.src);
      console.log("Imaged Loaded");
    });

    localStorage.setItem("img_crop", message.image);

    // // Add zoom in/out when image clicked
    // image.onclick = () => {
    //   console.log("image clicked");
    //   image.classList.contains("zoomed_in")
    //     ? image.classList.remove("zoomed_in")
    //     : image.classList.add("zoomed_in");
    // };

    // Set href and download property on button to download image when clicked
    downloadButtonPNG.href = message.image;
    downloadButtonPNG.download = message.filename;

    sendResponse(JSON.stringify(message, null, 4) || true);

    return true;
  }
});

// COPY TO CLIPBOARD FUNCTIONALITY
async function getImageBlobFromUrl(url) {
  const fetchedImageData = await fetch(url);
  const blob = await fetchedImageData.blob();
  return blob;
}

document.querySelector(".copy-image").addEventListener("click", async () => {
  const src = document.querySelector("#img64").src;
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

document.querySelector("#crop-image").addEventListener("click", async () => {
  window.open("./Crop_Image.html");
});

function getDate() {
  let today = new Date();
  let date =
    today.getFullYear() +
    "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + today.getDate()).slice(-2);
  let time =
    today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
  return date + "-" + time;
}

function pushOnStorage(key) {
  chrome.storage.local.set({ [getDate()]: key }, () => {
    console.log("added to storage");
  });
  getAllElements();
}

//$ To get all item from the stoarge
function getAllElements() {
  let gettingItem = chrome.storage.local.get();
  gettingItem.then(onGot, onError);
}

function onGot(item) {
  let values = Object.entries(item);
  // console.table(values);
  if (values.length > 5) {
    deleteLastImage(values);
  }
  // historyItems = item;
  // console.log(historyItems);
}
function onError(error) {
  console.log(`Error: ${error}`);
}

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

getAllElements();
