"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useInterviewProctor({ active, onViolation }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [violations, setViolations] = useState([]);
  const videoRef = useRef(null);

  const recordViolation = useCallback(
    (type, detail) => {
      const entry = { type, detail, at: new Date().toISOString() };
      setViolations((prev) => [...prev, entry]);
      onViolation?.(entry);
    },
    [onViolation]
  );

  const startMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: true,
      });

      setStream(mediaStream);
      setCameraReady(mediaStream.getVideoTracks().some((t) => t.enabled));
      setMicReady(mediaStream.getAudioTracks().some((t) => t.enabled));

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch {
      throw new Error("Camera and microphone access are required for the live interview.");
    }
  }, []);

  const stopMedia = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraReady(false);
    setMicReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!active || !stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    const onVideoEnded = () => {
      setCameraReady(false);
      recordViolation("camera_off", "Camera was turned off during the interview");
    };

    const onAudioEnded = () => {
      setMicReady(false);
      recordViolation("mic_off", "Microphone was disabled during the interview");
    };

    videoTrack?.addEventListener("ended", onVideoEnded);
    audioTrack?.addEventListener("ended", onAudioEnded);

    return () => {
      videoTrack?.removeEventListener("ended", onVideoEnded);
      audioTrack?.removeEventListener("ended", onAudioEnded);
    };
  }, [active, stream, recordViolation]);

  useEffect(() => {
    if (!active) return;

    const onVisibility = () => {
      if (document.hidden) {
        recordViolation("tab_switch", "Left the interview tab or minimized the window");
      }
    };

    const blockClipboard = (e) => {
      e.preventDefault();
      recordViolation("clipboard", `Blocked ${e.type} during interview`);
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
      recordViolation("context_menu", "Right-click blocked during interview");
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, [active, recordViolation]);

  const getProctoringReport = useCallback(() => {
    const counts = violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});

    const tabSwitches = counts.tab_switch || 0;
    const clipboardAttempts = counts.clipboard || 0;
    const cameraOff = counts.camera_off || 0;
    const micOff = counts.mic_off || 0;

    const penalty = Math.min(
      3,
      tabSwitches * 0.5 + clipboardAttempts * 0.25 + cameraOff * 1 + micOff * 0.5
    );

    return {
      violations,
      counts,
      penalty: Number(penalty.toFixed(1)),
      cameraReady,
      micReady,
    };
  }, [violations, cameraReady, micReady]);

  return {
    videoRef,
    cameraReady,
    micReady,
    stream,
    violations,
    startMedia,
    stopMedia,
    getProctoringReport,
    recordViolation,
  };
}
