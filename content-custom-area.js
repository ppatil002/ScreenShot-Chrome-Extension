"use strict";

/*
!Screenshot size
.drawImage(image,sx,sy,x,y,width,height) line 185
!Overlay feature to make it look like a ss
 */

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

    // If no overlay, close button and canvas exists, create them
    if (
      !(
        document.getElementById(overlayId) &&
        document.getElementById(closeButtonId) &&
        document.getElementById(canvasId)
      )
    ) {
      // Create canvas showing a screenshot of the page
      canvas = createDrawableCanvas();
      // // Create overlay over canvas
      overlay = createOverlayElement();
      // // Add close button to overlay
      addCloseButton();
    }

    sendResponse(JSON.stringify(message, null, 4) || true);

    return true;
  }
});

// Function to create a canvas element to draw a rectangular area over it to screenshot
function createDrawableCanvas() {
  // Hide scrollbar before canvas is created to avoid the image being shifted to the left by the width of the scrollbar
  document.body.style.overflow = "hidden";

  // Create canvas element
  const mainCanvas = createCanvas(
    canvasId,
    `${windowInnerWidthString}px`,
    `${windowInnerHeightString}px`
  );

  // Get canvas context to draw into the canvas
  canvasContext = mainCanvas.getContext("2d");

  // Workaround to create an image element and setting the source to the visibleTabImageURI to pass it into drawImage()
  const image = new Image();
  image.src = visibleTabImageURI;
  image.onload = () =>
    canvasContext.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);

  // Get any offset of the canvas to subtract during the area selection
  offsetX = mainCanvas.offsetLeft;
  offsetY = mainCanvas.offsetTop;

  // Get current mouse position on mouse down as a starting position
  mainCanvas.onmousedown = (e) => {
    isDrawing = true;
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
  };

  // Set isDrawing to false to not register mouse movements while not holding mouse down
  mainCanvas.onmouseup = (e) => {
    isDrawing = false;
    console.log("x=", startX, mouseX);
    console.log("y=", startY, mouseY);

    // Clip canvas to selected area and turn clipped canvas into image to pass to new tab
    clipCanvasAndCreateImage();
  };

  // Get current and starting mouse position to draw a rectangle over canvas
  mainCanvas.onmousemove = (e) => {
    if (isDrawing) {
      mouseX = parseInt(e.clientX - offsetX);
      mouseY = parseInt(e.clientY - offsetY);

      // Clear canvas and draw a new rectangle on every mouse move
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

function drawRectangle(x, y, width, height, c) {
  let ctx = c.getContext("2d");
  ctx.globalAlpha = 0.5;

  // set fill and stroke styles
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";

  // draw a rectangle with fill and stroke
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
}

// Function that dynamically creates a canvas element with a given width,height and id and returns it
function createCanvas(id, width, height) {
  // Create canvas element
  const createdCanvas = document.createElement("canvas");

  // Set canvas properties
  createdCanvas.setAttribute("id", id);
  createdCanvas.setAttribute("width", width);
  createdCanvas.setAttribute("height", height);

  return createdCanvas;
}

// Function that clips the canvas to the selected area and converts it into a base64 image
function clipCanvasAndCreateImage() {
  // Create another canvas that is as big as the selected area
  clippedCanvas = createCanvas(
    clippedCanvasId,
    `${mouseX - startX}px`,
    `${mouseY - startY}px`
  );

  // Get canvas context to draw the clipped image into the canvas
  clippedCanvasContext = clippedCanvas.getContext("2d");

  // Set the visible tab image from before as the source of the image for the new canvas
  const image = new Image();
  image.src = visibleTabImageURI;

  // Draw the visible content image into the new canvas, BUT clip it to the before selected area
  image.onload = () => {
    clippedCanvasContext.drawImage(
      image, // load image into the canvas
      startX, // x position (upper left corner) of the selected area
      startY, // y position (upper left corner) of the selected area
      mouseX - startX, //!width of the selected area Add +10
      mouseY - startY, //! height of the selected area
      0, // x position of where to place the clipped image in the canvas
      0, // y position of where to place the clipped image in the canvas
      mouseX - startX, // width of the screenshot in the canvas (aspect ratio)
      mouseY - startY
    ); // height of the screenshot in the canvas (aspect ratio)

    // Turn clipped canvas into image
    clippedImageURI = clippedCanvas.toDataURL("image/png"); //!.png .jpeg

    // Create data object including everything needed to show the image on the new tab
    var data = {
      image: clippedImageURI,
      width: window.innerWidth, //!width=mouseX-startX
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      action: "customAreaSuccessful",
    };

    // Send a message to the background script to send the custom area screenshot to the new tab
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

function addCloseButton() {
  // Create button element to close overlay when clicked
  const closeButton = document.createElement("button");

  closeButton.textContent = "×";

  closeButton.setAttribute("id", closeButtonId);

  // Add on click event listener to the button
  closeButton.onclick = () => {
    // Remove all added elements from the body
    document.body.removeChild(canvas);
    // document.body.removeChild(overlay);
    document.body.removeChild(closeButton);

    // Unpause all paused videos that were playing before
    allVideosPlaying.forEach((vid) => vid.play());

    // Enable scrolling again
    document.body.style.overflow = "visible";
  };

  document.body.appendChild(closeButton);
}
