import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useEffect, useState } from 'react';

function App() {
  const appID = 632416856; // Replace with your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Replace with your Server Secret

  const userName = "Prashant Singh";
  const roomID = "9818028418";
  const videostreamID="9711706966";
  const [zegoEngine, setZegoEngine] = useState(null);

  useEffect(() => {
    const checkBrowser = async () => {
      const zg = new ZegoExpressEngine(appID, serverSecret);
      const result = await zg.checkSystemRequirements();
      if (result.webRTC) {
        setZegoEngine(zg);
        console.log("System requirement check result status: " + result.webRTC);
      } else {
        console.error("Browser does not support required WebRTC features.");
      }
    };

    checkBrowser();

    // Cleanup on tab/window close
    const cleanup = () => {
      if (zegoEngine) {
        zegoEngine.stopPublishingStream(videostreamID);
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
        console.log('Session ended and engine destroyed');
      }
    };

    window.addEventListener('beforeunload', cleanup);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup(); // Ensure cleanup is called when the component unmounts
    };
  }, [zegoEngine]);

  const startClass = async () => {
    if (!zegoEngine) {
      console.error("ZegoExpressEngine is not initialized.");
      return;
    }

    try {
      const userID = "prashant_01";
      const token = "04AAAAAGazpTsAEGswNGIzNmhjeHFxbmJmb2MAsJ6itWI8SUImj7FardegLq73tF9L3bZMZXyS6YChf4OVAZY2FUQUSgDjq5rsSwKO45hWgzVUxzhSLb5kKwmVY8zW+Co8Aj5ANXYW2TA+AX1R9NI/oX9mZsjC/AQXkssRyBPioD1A7/qthUdYyYXcPAsN5JiivsuK0+GMBVaUy0/mHYVTqIUTQJ3nfhhCwejr6WNFfOCK6/n72xECF/gk/lkeuAqC6FLDuNfXJ9Z5H8d3"; // Replace with your token

      // Login to the room
      zegoEngine.loginRoom(roomID, token, { userID, userName });

      // Create a local stream using ZegoExpress API
      const localStream = await zegoEngine.createStream({
        camera: {
          video: true,
          audio: true,
        }
      });

      // Attach the local stream to the video element
      const videoElement = document.getElementById('hostVideo');
      videoElement.srcObject = localStream;

      // Start publishing the stream to the server
      zegoEngine.startPublishingStream(videostreamID, localStream);

      zegoEngine.on('publisherStateUpdate', (result) => {
        if (result.state === 'PUBLISHING') {
          console.log('Publishing started');
        } else if (result.state === 'NO_PUBLISH') {
          console.error('Publishing failed');
        }
      });
    } catch (error) {
      console.error("Error starting the live stream: ", error);
    }
  };

  return (
    <div className="App">
      <div>
        <button onClick={startClass}>
          Start Class
        </button>
        <video id="hostVideo" autoPlay muted style={{ display: 'block' }}></video>
      </div>
    </div>
  );
}

export default App;
