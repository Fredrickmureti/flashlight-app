import React, { useState, useEffect, useRef } from "react";

const Flashlight: React.FC = () => {
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const getStream = async () => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      const capabilities = track.getCapabilities();
      if (!("torch" in capabilities)) {
        alert("Torch capability not supported on this device.");
        return;
      }

      // Use type assertion to bypass TypeScript's type check
      await track.applyConstraints({
        advanced: [{ torch: true } as MediaTrackConstraintSet],
      });
      setTorchOn(true);
    } catch (error) {
      console.error("Error accessing camera or torch:", error);
      alert("An error occurred while trying to access the flashlight.");
    }
  };

  const toggleFlashlight = async () => {
    if (torchOn) {
      if (trackRef.current) {
        try {
          await trackRef.current.applyConstraints({
            advanced: [{ torch: false } as MediaTrackConstraintSet],
          });
          trackRef.current.stop();
          setTorchOn(false);
        } catch (error) {
          console.error("Error turning off the torch:", error);
        }
      }
    } else {
      await getStream();
    }
  };

  useEffect(() => {
    // Clean up the media stream when the component unmounts
    return () => {
      if (trackRef.current) {
        trackRef.current.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button onClick={toggleFlashlight}>
        {torchOn ? "Turn Off Flashlight" : "Turn On Flashlight"}
      </button>
      {/* Hidden video element to initiate the media stream */}
      <video ref={videoRef} style={{ display: "none" }} playsInline autoPlay />
    </div>
  );
};

export default Flashlight;
