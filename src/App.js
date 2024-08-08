import React, { useEffect, useState } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import './App.css'; // Ensure you have your styles defined here

function App() {
  const appID = 632416856; // Your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Your Server Secret
  const userName = "Prashant Singh";
  const roomID = "9000";
  const videostreamID = "90001";
  const screenStreamID = "90004";
  const [zegoEngine, setZegoEngine] = useState(null);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

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
          console.log('Publishing started');
        } else if (result.state === 'NO_PUBLISH') {
          console.error(`Publishing failed with error code: ${result.errorCode}`);
        }
      });

      // Listen for incoming broadcast messages
      zg.on('IMRecvBroadcastMessage', (roomID, chatData) => {
       alert("receivied msg" + roomID +  chatData);
        chatData.forEach(data => {
          setMessages(prevMessages => [...prevMessages, {
            userID: data.fromUser.userID,
            userName: data.fromUser.userName,
            message: data.message,
          }]);
        });
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
        console.error('Error sharing screen:', error);
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

  const sendMessage = () => {
    if (zegoEngine && message.trim() !== "") {
      zegoEngine.sendBroadcastMessage(roomID, message).then(() => {
        setMessages([...messages, { userID: "prashant_01", userName, message }]);
        setMessage("");
      }).catch(error => {
        console.error("Failed to send message", error);
      });
    }
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
  };

  return (
    <div className="App">
      <div className={`main-content ${isScreenShared ? 'screen-shared' : 'screen-not-shared'}`}>
        <div className="left-panel">
          <video className="screen-video" autoPlay muted id="screenVideo"></video>
        </div>

        <div className="right-panel">
          <div className="host-video">{isScreenShared ? 'HOST VIDEO STREAM' : 'LIVE CHATS'}</div>
          {isUserListVisible ? (
            <div className="user-list">
              <div className="user">User A</div>
              <div className="user">User B</div>
              <div className="user">User C</div>
            </div>
          ) : (
            <div className="chat-section">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.userName}: </strong>{msg.message}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="send message"
                />
                <button className="send-button" onClick={sendMessage}><i className="send-icon"></i></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        <button className="footer-button" onClick={toggleMute}>
          <i className="mute-icon"></i>
        </button>
        <button className="footer-button" onClick={toggleCamera}>
          <i className="camera-icon"></i>
        </button>
        <button className="footer-button" onClick={startScreenShare}>
          <i className={`screen-share-icon ${isScreenShared ? 'stop-share' : 'start-share'}`}></i>
        </button>
        <button className="footer-button" onClick={toggleUserList}>
          <i className="user-icon"></i>
        </button>
        <button className="leave-button" onClick={leaveRoom}>Leave Room</button>
      </div>
    </div>
  );
}

export default App;
