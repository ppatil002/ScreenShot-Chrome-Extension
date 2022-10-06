chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "Record Screen") {
    console.log("Record Screen");
  }
});

document.getElementById("recordScreen").addEventListener("click", recordScreen);
const recordScreen = async () => {
  const videoStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      mediaSource: "screen",
    },
  });
  const data = [];
  const screenRecorder = new MediaRecorder(videoStream);
  screenRecorder.ondataavailable = (e) => {
    data.push(e.data);
  };
  screenRecorder.start();
  screenRecorder.onstop = (e) => {
    document.getElementById("vid").src = URL.createObjectURL(
      new Blob(data, {
        type: data[0].type,
      })
    );
  };
};
