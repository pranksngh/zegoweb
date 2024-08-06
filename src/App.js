import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useEffect, useState } from 'react';

function App() {
  const appID = 632416856; // Replace with your App ID
  const serverSecret = "e7c4627c6fdb1a356ea1cb1e45a60c6b"; // Replace with your Server Secret

  
  const userName = "Prashant Singh";
  const roomID = "706966";
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
  }, []);

  const startClass = async () => {
    if (!zegoEngine) {
      console.error("ZegoExpressEngine is not initialized.");
      return;
    }

    try {
      const userID = "prashant_01";
      const token = "04AAAAAGay/WUAEGw5N3BtazA0d3NocmVodGEAsAtfjhyAtQrXy7fdlKwnWfzuqHzmddJy37eMQIhXrG9FQaR0zj+3TKytAeq5JAW8GpQYsjPJ2YBiW18lmJwctquYJg+TyunG/eDRGexAuqYHahsCuBUS5fWCqOhcHE6OLzYj6V4fmoCcRsv6FDa/VKz1olJlpa7HtieVWMYppmOUGEE1rdGIoQTyUBQg02B81CX5jxIHDm8wNSXRT1Vdrl/TfyhDuVTrHvw2QbCVDyKj";
      zegoEngine.loginRoom(roomID, token,  {userID, userName} );

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoElement = document.getElementById('hostVideo');
      videoElement.srcObject = stream;

      zegoEngine.startPublishingStream('prashant706966', stream);

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
