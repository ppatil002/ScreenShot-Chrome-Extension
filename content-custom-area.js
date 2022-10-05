"use strict";

// Constants
const overlayId = "overlay";
const closeButtonId = "close-button";
const canvasId = "canvas";
const clippedCanvasId = "clipped-canvas";

const allVideosOnPage = document.querySelectorAll("video");
const allVideosPlaying = [];

const windowInnerWidthString = window.innerWidth.toString();
const windowInnerHeightString = window.innerHeight.toString();

var currentTab;
var filename;

// Variables for the canvas and drawing the selection area in the canvas
var overlay;
var canvas;
var canvasContext;
var clippedCanvas;
var clippedCanvasContext;
var isDrawing = false;
var offsetX;
var offsetY;
var startX;
var startY;
var mouseX;
var mouseY;

var visibleTabImageURI;
var clippedImageURI;

// Listen to the message sent by the background script to instantiate the overlay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "customArea") {
    // Assign sent variables to global variables
    visibleTabImageURI = message.imageURI;
    currentTab = message.currentTab;
    filename = message.filename;

    if (
      !(
        document.getElementById(overlayId) &&
        document.getElementById(closeButtonId) &&
        document.getElementById(canvasId)
      )
    ) {
      // Create canvas showing a screenshot of the page
      canvas = createDrawableCanvas();
      // Create overlay over canvas
      overlay = createOverlayElement();
      // Add close button to overlay
      addCloseButton();
    }

    sendResponse(JSON.stringify(message, null, 4) || true);

    return true;
  }
});

// create a canvas element to draw a rectangular area
function createDrawableCanvas() {
  document.body.style.overflow = "hidden";

  const mainCanvas = createCanvas(
    canvasId,
    `${windowInnerWidthString}px`,
    `${windowInnerHeightString}px`
  );

  canvasContext = mainCanvas.getContext("2d");

  const image = new Image();
  image.src = visibleTabImageURI;
  image.onload = () =>
    canvasContext.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);

  offsetX = mainCanvas.offsetLeft;
  offsetY = mainCanvas.offsetTop;

  mainCanvas.onmousedown = (e) => {
    isDrawing = true;
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
  };

  mainCanvas.onmouseup = (e) => {
    isDrawing = false;
    console.log("x=", startX, mouseX);
    console.log("y=", startY, mouseY);

    clipCanvasAndCreateImage();
  };

  mainCanvas.onmousemove = (e) => {
    if (isDrawing) {
      mouseX = parseInt(e.clientX - offsetX);
      mouseY = parseInt(e.clientY - offsetY);

      canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      canvasContext.strokeRect(
        startX,
        startY,
        mouseX - startX,
        mouseY - startY,
        drawRectangle(
          startX,
          startY,
          mouseX - startX,
          mouseY - startY,
          mainCanvas
        )
      );
      //   canvasContext.strokeStyle = "black";
    }
  };

  document.body.appendChild(mainCanvas);

  return mainCanvas;
}

//Draws a new rectangle over canvas
function drawRectangle(x, y, width, height, c) {
  let ctx = c.getContext("2d");
  ctx.globalAlpha = 0.5;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";

  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
}

// Kind of constructor which creates a new canvas
function createCanvas(id, width, height) {
  // Create canvas element
  const createdCanvas = document.createElement("canvas");

  // Set canvas properties
  createdCanvas.setAttribute("id", id);
  createdCanvas.setAttribute("width", width);
  createdCanvas.setAttribute("height", height);

  return createdCanvas;
}

// Function to clips the canvas
function clipCanvasAndCreateImage() {
  clippedCanvas = createCanvas(
    clippedCanvasId,
    `${mouseX - startX}px`,
    `${mouseY - startY}px`
  );

  clippedCanvasContext = clippedCanvas.getContext("2d");

  const image = new Image();
  image.src = visibleTabImageURI;

  image.onload = () => {
    clippedCanvasContext.drawImage(
      image,
      startX,
      startY,
      mouseX - startX,
      mouseY - startY,
      0,
      0,
      mouseX - startX,
      mouseY - startY
    );

    clippedImageURI = clippedCanvas.toDataURL("image/png");

    var data = {
      image: clippedImageURI,
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      action: "customAreaSuccessful",
    };

    // Sending  message to the background
    chrome.runtime.sendMessage(
      {
        data: data,
        currentTabId: currentTab.id,
        currentTabIndex: currentTab.index,
        filename: filename,
      },
      (responseCallback) => {
        if (responseCallback) {
          console.log("Send SS to New Tab");
        }

        return true;
      }
    );
  };
}

// Create button element to close overlay when clicked
function addCloseButton() {
  const closeButton = document.createElement("button");

  closeButton.textContent = "×";

  closeButton.setAttribute("id", closeButtonId);

  closeButton.onclick = () => {
    document.body.removeChild(canvas);
    document.body.removeChild(overlay);
    document.body.removeChild(closeButton);

    allVideosPlaying.forEach((vid) => vid.play());

    document.body.style.overflow = "visible";
  };

  document.body.appendChild(closeButton);
}

//Creates overlay to entire window
function createOverlayElement() {
  const siteOverlay = document.createElement("div");

  siteOverlay.style.width = `${windowInnerWidthString}px`;
  siteOverlay.style.height = `${windowInnerHeightString}px`;

  siteOverlay.setAttribute("id", overlayId);

  allVideosOnPage.forEach((video) => {
    if (!video.paused) {
      allVideosPlaying.push(video);
      video.pause();
    }
  });

  document.body.appendChild(siteOverlay);

  return siteOverlay;
}
