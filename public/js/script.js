const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myvideo = document.createElement("video");
// myvideo.muted = true;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3030,
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myvideo, stream);

    // if (!myVideoStream.getAudioTracks()[0].enabled) {
    //   myVideoStream.getAudioTracks()[0].enabled = false;
    //   setMuteButton();
    // } else {
    //   setUnmuteButton();
    //   myVideoStream.getAudioTracks()[0].enabled = true;
    // }
    // if (!myVideoStream.getVideoTracks()[0].enabled) {
    //   myVideoStream.getVideoTracks()[0].enabled = false;
    //   setPlayVideo();
    // } else {
    //   setStopVideo();
    //   myVideoStream.getVideoTracks()[0].enabled = true;
    // }

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  console.log("id ", id);
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  console.log("New user id ", userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let msg = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && msg.val().length !== 0) {
    socket.emit("message", msg.val());
    console.log(msg.val());
    msg.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul.messages").append(`
        <li class="list-group-item">
        <span class='text-bold'>User</span>
        ${message}
        </li>`);
  scrollToBottom();
  console.log("message recieved ", message);
});

const scrollToBottom = () => {
  const body = $(".main__body");
  body.scrollTop(body.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setMuteButton();
  } else {
    setUnmuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setUnmuteButton = () => {
  const muteBody = `
    <i class="fa fa-microphone" aria-hidden="true"></i>
    <span>Mute</span>
    `;

  $(".main__mute__button").html(muteBody);
};

const setMuteButton = () => {
  const unmuteBody = `
    <i class="fa fa-microphone-slash text-danger" aria-hidden="true"></i>
    <span class='text-danger'>unmute</span>
`;

  $(".main__mute__button").html(unmuteBody);
};

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const stopBody = `
          <i class="fa fa-play text-danger"  aria-hidden="true"></i>
          <span class='text-danger'>Play</span>
      `;
  $(".main__play__button").html(stopBody);
};

const setStopVideo = () => {
  const playBody = `
        <i class="fa fa-video-camera" aria-hidden="true"></i>
        <span>Stop</span>
        `;
  $(".main__play__button").html(playBody);
};
