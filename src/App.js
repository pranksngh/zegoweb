import React, { useEffect, useState } from 'react';
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import './App.css'; // Ensure you have your styles defined here

function App() {
  const appID = 122772402; // Your App ID
  const serverSecret = "88c5f0591422f26b8bff03937659368b"; // Your Server Secret
  const userName = "Prashant Singh";
  const roomID = "6000";
  const videostreamID = "60001";
  const screenStreamID = "60005";
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
      const token = "04AAAAAGa3c84AEG56a212cmJjNHFwZDB1aGEAsOIxd0PAtQiA+TyyKbUBsOQMIw2IZ/XKzgEh9jnUkvQiOw/wIg/QDVqnHQ+UVPSglU/RjpTXv4BWvp/A9/i/h1HHSRx9njJWEEuhmMtxDya3Ka5RDpMaI1a1GnRj3aZeWZPQLWhomPvANl6hOtP66uWVwHTYsadlnN9/HcWE9c8fmosW6dp/gK9nFbxz8DH514zCXDaEobAfR3sVFl7UkRiaGiuzDzzk24nFCDJrX2SM"; // Replace with your token

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

      // Listen for incoming broadcast messages
      zg.on('IMRecvBroadcastMessage', (roomID, chatData) => {
        console.log("Received message in room:", roomID, chatData);
        if (chatData && chatData.length > 0) {
          chatData.forEach(data => {
            console.log("Message data:", data);
            setMessages(prevMessages => [...prevMessages, {
              userID: data.fromUser.userID,
              userName: data.fromUser.userName,
              message: data.message,
            }]);
          });
        } else {
          console.log("No message data received.");
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
          <video className="host-video" autoPlay muted id="hostVideo"></video>
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
