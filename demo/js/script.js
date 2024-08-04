const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas");
const selectCamera = document.querySelector("#select-camera");
const inputScoreThreshold = document.querySelector("#input-score-threshold");
const buttons = document.querySelectorAll("button");
const [play, pause, analyze] = [...buttons];

let detector;
let requestAnimationFrameId;

const drawKeypoints = (keypoints, context) => {
  keypoints.forEach((keypoint) => {
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = inputScoreThreshold.value || 0;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      context.fill(circle);
      context.stroke(circle);
    }
  });
};

const drawSkeleton = (keypoints, context) => {
  const KEYPOINTS_PAIRS = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [5, 6],
    [5, 7],
    [5, 11],
    [6, 8],
    [6, 12],
    [7, 9],
    [8, 10],
    [11, 12],
    [11, 13],
    [12, 14],
    [13, 15],
    [14, 16],
  ];

  KEYPOINTS_PAIRS.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = inputScoreThreshold.value || 0;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      context.beginPath();
      context.moveTo(kp1.x, kp1.y);
      context.lineTo(kp2.x, kp2.y);
      context.stroke();
    }
  });
};

const initializeCanvas = () => {
  canvas.width = video.width;
  canvas.height = video.height;
  const context = canvas.getContext("2d");
  context.translate(video.width, 0);
  context.scale(-1, 1);
  context.fillStyle = "red";
  context.strokeStyle = "white";
  context.lineWidth = 2;
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
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  poses.forEach((pose) => {
    drawKeypoints(pose.keypoints, context);
    drawSkeleton(pose.keypoints, context);
  });
  animationFrameRequestId = requestAnimationFrame(draw);
};

play.onclick = async () => {
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

pause.onclick = () => {
  video.pause();
  cancelAnimationFrame(requestAnimationFrameId);
};

analyze.onclick = () => {
  draw();
};

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
