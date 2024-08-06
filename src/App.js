import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useEffect, useState } from 'react';

function App() {
  const appID = 632416856; // Your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Your Server Secret
  const userName = "Prashant Singh";
  const roomID = "9000";
  const videostreamID = "90001";
  const [zegoEngine, setZegoEngine] = useState(null);

  useEffect(() => {
    const initZego = async () => {
      const zg = new ZegoExpressEngine(appID, serverSecret);
      setZegoEngine(zg);

      const result = await zg.checkSystemRequirements();
      if (!result.webRTC) {
        alert("Browser does not support required WebRTC features.");
        return;
      }

      const userID = "prashant_01";
      const token = "04AAAAAGazvEMAEG5lN2h2ZjBlb3FzY3NlN3gAsKcR9zNUzPesqpyXMgNjCEBXQg8qeQ6SRNvKUOmb62pMzTyAve2rI7MgQVR89He7YR0E3mWdo9xdDj+gvAJCjKde5v2w7p9o7O4/3JJqzlpn5OwKOjgxgKenZ3UL1Ttl+xAt7oOStiztW7MfZmPKFKHqIIO/i+QWLGuROrB5AM1nJbjoea3rkcOOytTNYrzrVq8zK39wIuKZYw3HpBFDQ3qTkrLaCdqMgXEQmMCnbdud"; // Replace with your token

      zg.loginRoom(roomID, token, { userID, userName });

      const localStream = await zg.createStream({
        camera: {
          video: true,
          audio: true,
        }
      });

      const videoElement = document.getElementById('hostVideo');
      videoElement.srcObject = localStream;

      zg.startPublishingStream(videostreamID, localStream);

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
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
      }
    };
  }, []);

  return (
    <div className="App">
      <button onClick={startClass}>
        Start Class
      </button>
      <video id="hostVideo" autoPlay muted style={{ display: 'block' }}></video>
    </div>
  );

  async function startClass() {
    if (!zegoEngine) {
      alert("ZegoExpressEngine is not initialized.");
      return;
    }
  }
}

export default App;
