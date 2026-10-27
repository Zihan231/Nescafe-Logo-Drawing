"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  ArrowClockwise,
  CaretDown,
  Check,
  UploadSimple,
  WarningCircle,
  Sparkle
} from "@phosphor-icons/react";
import { PROFESSIONS } from "@/lib/professions";

export default function CapturePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [profession, setProfession] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start front-facing camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. You can upload a photo instead."
          : "Could not access front camera. You can upload a photo."
      );
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Auto-start camera on mount
  useEffect(() => {
    setProfession(sessionStorage.getItem("nescafe_user_profession") || "");
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture current frame from video into a circular PNG
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 240);

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 640;
    const size = Math.min(vWidth, vHeight);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Clip canvas into a perfect circle
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Mirror horizontally for front-camera selfie
    ctx.save();
    ctx.translate(512, 0);
    ctx.scale(-1, 1);

    const sx = (vWidth - size) / 2;
    const sy = (vHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Fallback: file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(256, 256, 256, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);

        const dataUrl = canvas.toDataURL("image/png");
        setCapturedPhoto(dataUrl);
        stopCamera();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit and continue to edit page
  const handleContinue = async () => {
    if (!profession || processing) return;
    const finalName = userName.trim() || "My Logo";
    setProcessing(true);

    try {
      let photoUrl = capturedPhoto;

      // Upload file to server endpoint if a photo was captured
      if (capturedPhoto) {
        try {
          const res = await fetch("/api/selfie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: capturedPhoto })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              photoUrl = data.url;
            }
          }
        } catch (uploadErr) {
          console.warn("Upload fallback to data URL:", uploadErr);
        }
      }

      // Save to sessionStorage for active session
      sessionStorage.setItem("nescafe_user_name", finalName);
      sessionStorage.setItem("nescafe_user_profession", profession);
      if (photoUrl) {
        sessionStorage.setItem("nescafe_user_photo", photoUrl);
      } else {
        sessionStorage.removeItem("nescafe_user_photo");
      }

      router.push("/edit");
    } catch (err) {
      console.error("Error saving profile:", err);
      setProcessing(false);
    }
  };

  return (
    <motion.main
      className="capture-screen screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header ribbon identical to Edit page */}
      <header className="editor-head">
        <div className="editor-ribbon">
          <button
            className="nav-back"
            onClick={() => router.push("/")}
            aria-label="Back to home page"
          >
            <ArrowLeft weight="bold" /> <span>BACK</span>
          </button>
          <strong>LET&apos;S MAKE YOUR WORLD</strong>
          <img
            src="/assets/nescafe-logo-trimmed.png"
            alt="NESCAFÉ — Make your world"
          />
        </div>
      </header>

      {/* Main capture workspace */}
      <div className="capture-container">
        <motion.div
          className="capture-card"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Step 1: User's Name */}
          <div className="capture-name-block">
            <label htmlFor="user-name-input" className="capture-label">
              <span>YOUR NAME</span>
            </label>
            <input
              id="user-name-input"
              type="text"
              className="capture-name-input"
              placeholder="Enter your name"
              value={userName}
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && capturedPhoto) handleContinue();
              }}
            />
          </div>

          {/* Step 2: User's Profession */}
          <div className="capture-profession-block">
            <label htmlFor="profession-select" className="capture-label">
              <span>YOUR PROFESSION</span>
            </label>
            <div className="capture-profession-control">
              <select
                id="profession-select"
                className="capture-profession-select"
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                required
              >
                <option value="" disabled>Select your profession</option>
                {PROFESSIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <CaretDown className="capture-profession-icon" size={17} weight="bold" aria-hidden="true" />
            </div>
          </div>

          {/* Step 3: Camera & Selfie Framing */}
          <div className="capture-camera-block">
            <div className={`camera-viewport${flash ? " flash" : ""}`}>
              {/* Live Video */}
              {!capturedPhoto && (
                <video
                  ref={videoRef}
                  className={`camera-video${cameraActive ? " active" : ""}`}
                  autoPlay
                  playsInline
                  muted
                />
              )}

              {/* Captured Photo Preview */}
              {capturedPhoto && (
                <img
                  src={capturedPhoto}
                  alt="Your Selfie"
                  className="camera-preview-photo"
                />
              )}

              {/* Circular guide ring */}
              <div className="camera-circle-overlay" aria-hidden="true">
                <div className="camera-circle-guide" />
              </div>

              {/* Error overlay if camera is blocked */}
              {cameraError && !capturedPhoto && (
                <div className="camera-fallback-overlay">
                  <WarningCircle size={40} weight="duotone" color="#ffca28" />
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    className="capture-fallback-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadSimple weight="bold" />
                    <span>Upload a Photo</span>
                  </button>
                  <button
                    type="button"
                    className="capture-retry-btn"
                    onClick={startCamera}
                  >
                    <ArrowClockwise weight="bold" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input for fallback upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Camera Actions */}
            <div className="capture-controls">
              {!capturedPhoto ? (
                <div className="capture-btn-group">
                  <motion.button
                    type="button"
                    className="capture-shutter-btn"
                    onClick={handleSnap}
                    disabled={!cameraActive}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Take selfie"
                  >
                    <Camera weight="bold" size={24} />
                    <span>SNAP SELFIE</span>
                  </motion.button>
                  <button
                    type="button"
                    className="capture-secondary-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload photo from device"
                  >
                    <UploadSimple weight="bold" size={18} />
                    <span>UPLOAD</span>
                  </button>
                </div>
              ) : (
                <div className="capture-btn-group">
                  <motion.button
                    type="button"
                    className="capture-secondary-btn"
                    onClick={handleRetake}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ArrowClockwise weight="bold" size={18} />
                    <span>RETAKE</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="capture-confirm-btn"
                    onClick={handleContinue}
                    disabled={processing || !profession}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{processing ? "PREPARING..." : "MAKE YOUR LOGO"}</span>
                    <Check weight="bold" size={20} />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
