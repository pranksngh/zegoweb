import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useEffect, useState } from 'react';

function App() {
  const appID = 632416856; // Replace with your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Replace with your Server Secret

  const userName = "Prashant Singh";
  const roomID = "prashant455";
  const videostreamID = "90001";
  const [zegoEngine, setZegoEngine] = useState(null);

  useEffect(() => {
    const checkBrowser = async () => {
      const zg = new ZegoExpressEngine(appID, serverSecret);
      const result = await zg.checkSystemRequirements();
      setZegoEngine(zg);
      if (result.webRTC) {
        
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
  

    try {
      const userID = "prashant_01";
      const token = "04AAAAAGazryYAEHhoazI0dXZtbDZ3dTZrOXYAsCWtxfnekilFAS99ghAlDL/McF+gTXrYpZxMuNFFOZfgA/Qw0QfK6kpt4cYlSOuUaJYvczvKnEJY97LTSpwj24Ey51C6J7oIBHQZILcTpUZemn0ppv5VI+fN+nhX5oPff2FK2mLLZeyiDhmQJDjllnqdVUSjWrcLCeH7IRtNGVOx9acVsODsA1FOTB0JhVJ61Esg91+oS79DrdHdpNRssW2eHquxGIA7/2ODplS3ngAj"; // Replace with your token

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
          alert('Publishing started');
        } else if (result.state === 'NO_PUBLISH') {
          alert(`Publishing failed with error code: ${result.errorCode}`);
          console.error(`Publishing failed with error code: ${result.errorCode}, reason: ${result.extendedData}`);
        }
      });
    } catch (error) {
      alert("Error starting the live stream: " + error.message);
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
