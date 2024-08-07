import React, { useEffect, useState } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import './App.css'; // Import the CSS file for styling

function App() {
  const appID = 632416856; // Your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Your Server Secret
  const userName = "Prashant Singh";
  const roomID = "9000";
  const videostreamID = "90001";
  const screenStreamID = "90004";
  const [zegoEngine, setZegoEngine] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenShared, setIsScreenShared] = useState(false); // New state for layout control
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
      const token = "04AAAAAGazyHsAEHFkMG82bm90ZHR3aGQ5Nm8AsEVYiYSmyzCBv9je0TmRXl3uUM93xE9zCWVjm9A6kxNSac4KE2X8kjod79uEPI2oXR4xsjlvBv87biXEYLCpERyNt/wcXiD4/ghRFlqF8UONz4Ovtuy/a8zi3tpC3Ac3JbgAp39FXCcuCeL5AaHzWfGF94IRXge9+SmZ+FK7tSUapWAEUGjrz5IwLlV0RYwdBLvPL+8XKVmaRGFxMSaqg6DnxePXI1d/oEhBuIsR84XL"; // Replace with your token

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

      // Listen for incoming messages
      zg.on('IMRecvBroadcastMessage', (roomID, messageList) => {
        const newMessages = messageList.map(msg => ({
          userID: msg.fromUser.userID,
          userName: msg.fromUser.userName,
          message: msg.message,
        }));
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
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
  }, [zegoEngine, screenStream]);

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
        setIsScreenShared(true); // Update layout to screen sharing mode

        const screenVideoElement = document.getElementById('screenVideo');
        screenVideoElement.srcObject = screenStream;

        zegoEngine.startPublishingStream(screenStreamID, screenStream);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const stopScreenShare = () => {
    if (zegoEngine && screenStream) {
      zegoEngine.stopPublishingStream(screenStreamID);
      setScreenStream(null);
      setIsScreenShared(false); // Update layout back to non-sharing mode
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

  return (
    <div className={`App ${isScreenShared ? 'screen-shared' : 'screen-not-shared'}`}>
      <div className="toolbar">
        <button onClick={startScreenShare}>
          {isScreenShared ? 'Stop Sharing' : 'Share Screen'}
        </button>
        <button onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleCamera}>
          {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
        </button>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="content">
        <video id="hostVideo" autoPlay muted className="host-video"></video>

        {isScreenShared ? (
          <div className="screen-share">
            <video id="screenVideo" autoPlay muted className="screen-video"></video>
            <div className="chat-container">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.userName}: </strong>{msg.message}
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <div className="participants">
            <div>User A</div>
            <div>User B</div>
            <div>User C</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
