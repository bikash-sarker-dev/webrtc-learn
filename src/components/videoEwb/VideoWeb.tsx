// "use client";

// // ✅ TypeScript enabled WebRTC Video Call with Auto Recording

// import { useEffect, useRef, useState } from "react";
// import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

// export default function VideoCallUI() {
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const recordedChunksRef = useRef<Blob[]>([]);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);

//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [recordTime, setRecordTime] = useState<number>(0);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const startMedia = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }
//     };

//     startMedia();
//   }, []);

//   const toggleMic = () => {
//     const stream = localVideoRef.current?.srcObject as MediaStream;
//     stream?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
//     setMicOn(!micOn);
//   };

//   const toggleCam = () => {
//     const stream = localVideoRef.current?.srcObject as MediaStream;
//     stream?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
//     setCamOn(!camOn);
//   };

//   const startRecording = (): void => {
//     if (isRecording) return;
//     setIsRecording(true);
//     setRecordTime(0);

//     timerRef.current = setInterval(() => {
//       setRecordTime((prev) => prev + 1);
//     }, 1000);
//     const stream = localVideoRef.current?.srcObject as MediaStream;
//     if (!stream) return;

//     const recorder = new MediaRecorder(stream, {
//       mimeType: "video/webm; codecs=vp9",
//     });

//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunksRef.current.push(event.data);
//       }
//     };

//     recorder.onstop = downloadRecording;

//     recorder.start();
//     mediaRecorderRef.current = recorder;
//   };

//   const stopRecording = (): void => {
//     if (!isRecording) return;
//     setIsRecording(false);

//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }

//     mediaRecorderRef.current?.stop();
//     mediaRecorderRef.current?.stop();
//   };

//   const downloadRecording = (): void => {
//     const blob = new Blob(recordedChunksRef.current, {
//       type: "video/webm",
//     });

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "video-call-recording.webm";
//     a.click();

//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
//       <div className="relative w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
//         {/* Remote Video */}
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="h-full w-full object-cover"
//         />

//         {/* Local Video (Picture-in-Picture) */}
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           playsInline
//           className="absolute bottom-24 right-6 w-48 h-32 rounded-xl border border-white/20 object-cover shadow-lg"
//         />

//         {/* Control Bar */}
//         <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-md flex items-center justify-center gap-6">
//           <button
//             onClick={toggleMic}
//             className={`p-4 rounded-full ${
//               micOn ? "bg-slate-700" : "bg-red-600"
//             }`}
//           >
//             {micOn ? (
//               <Mic className="text-white" />
//             ) : (
//               <MicOff className="text-white" />
//             )}
//           </button>

//           <button
//             onClick={toggleCam}
//             className={`p-4 rounded-full ${
//               camOn ? "bg-slate-700" : "bg-red-600"
//             }`}
//           >
//             {camOn ? (
//               <Video className="text-white" />
//             ) : (
//               <VideoOff className="text-white" />
//             )}
//           </button>

//           {/* Start Recording */}
//           {/* Recording Progress & Timer */}
//           {isRecording && (
//             <div className="flex items-center gap-3 text-white">
//               <div className="w-32 h-2 bg-white/20 rounded overflow-hidden">
//                 <div
//                   className="h-full bg-red-500 transition-all"
//                   style={{ width: `${Math.min(recordTime * 2, 100)}%` }}
//                 />
//               </div>
//               <span className="text-sm font-mono">
//                 {new Date(recordTime * 1000).toISOString().substr(14, 5)}
//               </span>
//             </div>
//           )}

//           <button
//             onClick={startRecording}
//             disabled={isRecording}
//             className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold disabled:opacity-50"
//           >
//             ● REC
//           </button>

//           <button
//             onClick={stopRecording}
//             disabled={!isRecording}
//             className="px-4 py-2 rounded-full bg-slate-600 text-white font-semibold disabled:opacity-50"
//           >
//             ■ STOP
//           </button>

//           <button className="p-4 rounded-full bg-red-700">
//             <PhoneOff className="text-white" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export default function VideoCallUI(): JSX.Element {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Video recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordTime, setRecordTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Audio recording
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    const startMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    };

    startMedia();
  }, []);

  // Toggle Mic
  const toggleMic = (): void => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn(!micOn);
  };

  // Toggle Camera
  const toggleCam = (): void => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
    setCamOn(!camOn);
  };

  // Video Recording
  const startRecording = (): void => {
    if (isRecording) return;
    setIsRecording(true);
    setIsPaused(false);
    setRecordTime(0);

    timerRef.current = window.setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);

    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    recordedChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      recordedBlobRef.current = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = (): void => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorderRef.current?.stop();
  };

  const downloadRecording = (): void => {
    if (!recordedBlobRef.current) return;
    const url = URL.createObjectURL(recordedBlobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-call-recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Audio Recording
  const startAudioRecording = (): void => {
    audioChunksRef.current = [];
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (!stream) return;
    const audioStream = new MediaStream(stream.getAudioTracks());
    const recorder = new MediaRecorder(audioStream, {
      mimeType: "audio/webm;codecs=opus",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      audioBlobRef.current = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
    };

    recorder.start();
    audioRecorderRef.current = recorder;
  };

  const stopAudioRecording = (): void => {
    audioRecorderRef.current?.stop();
  };

  const downloadAudio = (): void => {
    if (!audioBlobRef.current) return;
    const url = URL.createObjectURL(audioBlobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio-recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="relative w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-24 right-6 w-48 h-32 rounded-xl border border-white/20 object-cover shadow-lg"
        />

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-md flex items-center justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full ${
              micOn ? "bg-slate-700" : "bg-red-600"
            }`}
          >
            <Mic className="text-white" />
          </button>
          <button
            onClick={toggleCam}
            className={`p-4 rounded-full ${
              camOn ? "bg-slate-700" : "bg-red-600"
            }`}
          >
            <Video className="text-white" />
          </button>

          {/* Video Recording Buttons */}
          {isRecording && (
            <div className="flex items-center gap-3 text-white">
              <div className="w-32 h-2 bg-white/20 rounded overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(recordTime * 2, 100)}%` }}
                />
              </div>
              <span className="text-sm font-mono">
                {new Date(recordTime * 1000).toISOString().substr(14, 5)}
              </span>
            </div>
          )}
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold disabled:opacity-50"
          >
            ● REC
          </button>
          <button
            onClick={() => {
              if (!mediaRecorderRef.current) return;
              if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
              } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
              }
            }}
            disabled={!isRecording}
            className="px-4 py-2 rounded-full bg-yellow-500 text-black font-semibold disabled:opacity-50"
          >
            {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="px-4 py-2 rounded-full bg-slate-600 text-white font-semibold disabled:opacity-50"
          >
            ■ STOP
          </button>
          <button
            onClick={downloadRecording}
            disabled={isRecording || !recordedBlobRef.current}
            className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold disabled:opacity-50"
          >
            ⬇ DOWNLOAD
          </button>

          {/* Audio Recording Buttons */}
          <button
            onClick={startAudioRecording}
            className="px-4 py-2 rounded-full bg-purple-600 text-white font-semibold"
          >
            🎤 Start Audio
          </button>
          <button
            onClick={stopAudioRecording}
            className="px-4 py-2 rounded-full bg-purple-400 text-white font-semibold"
          >
            ⏹ Stop Audio
          </button>
          <button
            onClick={downloadAudio}
            disabled={!audioBlobRef.current}
            className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold"
          >
            ⬇ Download Audio
          </button>

          <button className="p-4 rounded-full bg-red-700">
            <PhoneOff className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
