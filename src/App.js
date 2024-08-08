import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useEffect, useState } from 'react';

function App() {
  const appID = 632416856; // Your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Your Server Secret
  const userName = "Prashant Singh";
  const roomID = "6000";
  const videostreamID = "60001";
  const screenStreamID = "60005";
  const [zegoEngine, setZegoEngine] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    const initZego = async () => {
      const zg = new ZegoExpressEngine(appID, serverSecret);
      setZegoEngine(zg);

      const result = await zg.checkSystemRequirements();
      if (!result.webRTC) {
        console.error("Browser does not support required WebRTC features.");
        return;
      }

      const userID = "prashant_01";
      const token = "04AAAAAGa06KAAEHdxOHZmcjNmM3Q5dGx2bTIAsK0a4hspDvW5s6Sae6jDqLPqh/UxUmwH7HSglE6bYLUBRsclKtGRgXbN5YoqlV5+CsfdfFcw54an/H2bi98bulxZXTiBqhHPlCCl7ALV7yRlNyiy8IoxMr+1TZ3NaO+W9bPCdhPfi+sosTFsWUFK6439Rs/OLsF+Z/UzylENqwGJhdER5Q7SddzD/NoTZ0duI2STawMVNNpzll3Cr9iBiXYHWeDsNTeMQ+BJYUSYl2lj"; // Replace with your token

      zg.loginRoom(roomID, token, { userID, userName });

      const stream = await zg.createStream({
        camera: {
          video: true,
          audio: true,
        }
      });
      setLocalStream(stream);

      const videoElement = document.getElementById('hostVideo');
      videoElement.srcObject = stream;

      zg.startPublishingStream(videostreamID, stream);

      zg.on('publisherStateUpdate', (result) => {
        if (result.state === 'PUBLISHING') {
          alert('Publishing started');
        } else if (result.state === 'NO_PUBLISH') {
          alert(`Publishing failed with error code: ${result.errorCode}`);
        }
      });
    };

    initZego();

    return () => {
      if (zegoEngine) {
        zegoEngine.stopPublishingStream(videostreamID);
        if (screenStream) {
          zegoEngine.stopPublishingStream(screenStreamID);
        }
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
      }
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      if (isMuted) {
        zegoEngine.muteMicrophone(false); // Unmute
        setIsMuted(false);
      } else {
        zegoEngine.muteMicrophone(true); // Mute
        setIsMuted(true);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      if (isCameraEnabled) {
        localStream.getVideoTracks()[0].enabled = false; // Disable camera
        setIsCameraEnabled(false);
      } else {
        localStream.getVideoTracks()[0].enabled = true; // Enable camera
        setIsCameraEnabled(true);
      }
    }
  };

  const startScreenShare = async () => {
    if (zegoEngine) {
      try {
        const screenStream = await zegoEngine.createStream({
          screen: true, // Enable screen sharing
          video: {
            quality: 4,
            frameRate: 15,
          },
        });
        setScreenStream(screenStream);

        const screenVideoElement = document.getElementById('screenVideo');
        screenVideoElement.srcObject = screenStream;

        zegoEngine.startPublishingStream(screenStreamID, screenStream);
      } catch (error) {
        alert('Error sharing screen:', error);
      }
    }
  };

  const leaveRoom = () => {
    if (zegoEngine) {
      zegoEngine.stopPublishingStream(videostreamID);
      if (screenStream) {
        zegoEngine.stopPublishingStream(screenStreamID);
      }
      zegoEngine.logoutRoom(roomID);
      zegoEngine.destroyEngine();
      console.log('Left room and stopped publishing');
    }
  };

  return (
    <div className="App">
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={toggleCamera}>
        {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
      </button>
      <button onClick={startScreenShare}>
        Share Screen
      </button>
      <button onClick={leaveRoom}>
        Leave Room
      </button>
      <video id="hostVideo" autoPlay muted style={{ display: 'block' }}></video>
      <video id="screenVideo" autoPlay muted style={{ display: 'block', marginTop: '10px' }}></video>
    </div>
  );
}

export default App;
