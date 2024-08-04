const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas");
const selectCamera = document.querySelector("#select-camera");
const inputScoreThreshold = document.querySelector("#input-score-threshold");
const buttons = document.querySelectorAll("button");
const [play, pause, analyze] = [...buttons];

let detector;
let requestAnimationFrameId;

const drawKeypoints = (keypoints, context) => {
  context.fillStyle = "red";
  context.strokeStyle = "white";
  context.lineWidth = 2;

  keypoints.forEach((keypoint) => {
    if (keypoint.score >= inputScoreThreshold.value) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      context.fill(circle);
      context.stroke(circle);
    }
  });
};

const initializeCanvas = () => {
  canvas.width = video.width;
  canvas.height = video.height;
  const context = canvas.getContext("2d");
  context.translate(video.width, 0);
  context.scale(-1, 1);
};

const getUserMedia = async (constraints) => {
  if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
    alert("getUserMedia is not supported!");
    return;
  }
  return await navigator.mediaDevices.getUserMedia(constraints);
};

const setVideoDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const options = videoDevices.map((videoDevices) => {
    return `<option value="${videoDevices.deviceId}">${videoDevices.label}</option>`;
  });
  selectCamera.innerHTML += options.join("");
  return videoDevices;
};

const createDetector = async () => {
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet
  );
  return detector;
};

const draw = async () => {
  const poses = await detector.estimatePoses(video);
  console.log(poses);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  poses.forEach((pose) => {
    drawKeypoints(pose.keypoints, context);
  });
  animationFrameRequestId = requestAnimationFrame(draw);
};

const onClickPlay = async () => {
  if (!video.srcObject) {
    const stream = await getUserMedia({
      video: {
        deviceId: { exact: selectCamera.value },
      },
    });
    video.srcObject = stream;
  }
  video.play();
};

const onClickPause = () => {
  video.pause();
  cancelAnimationFrame(requestAnimationFrameId);
};

const onClickAnalyze = () => {
  draw();
};

play.onclick = onClickPlay;
pause.onclick = onClickPause;
analyze.onclick = onClickAnalyze;

window.onload = async () => {
  initializeCanvas();

  await getUserMedia({
    video: {
      width: video.width,
      height: video.height,
    },
  });
  const devices = await setVideoDevices();
  if (!Array.isArray(devices) || devices.length === 0) {
    alert("No camera devices found");
    return;
  }

  detector = await createDetector();
  buttons.forEach((button) => (button.disabled = false));
};
