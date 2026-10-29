"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  ArrowClockwise,
  Check,
  WarningCircle,
  Sparkle
} from "@phosphor-icons/react";
import { CHARACTERS } from "@/lib/professions";
import { DEFAULT_PHOTO_SHAPE, photoShape, shapedPhoto } from "@/lib/photo-shapes";

export default function CapturePage() {
  const router = useRouter();
  const [gate, setGate] = useState("checking"); // "checking" | "locked" | "open"
  const [userName, setUserName] = useState("");
  const [profession, setProfession] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [flash, setFlash] = useState(false);
  // The photo is previewed in a circle here; the shape can be changed afterwards in the editor ("Your photo").
  const shape = photoShape(DEFAULT_PHOTO_SHAPE);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rawShotRef = useRef(null); // the plain square photo; the editor cuts it to whatever shape is chosen

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
          ? "Camera permission denied. Allow camera access in your browser, then retry."
          : "Could not access the front camera. Check that it is connected, then retry."
      );
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Confirms the session and fetches the registered name.
  useEffect(() => {
    let alive = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;
        if (data.verified) {
          setUserName(String(data.name || "").trim().slice(0, 20));
          setGate("open");
        } else {
          // The server normally never serves this page unverified (see proxy.js); this covers
          // a session that expired while the page was open. Refreshing in place (no page load, so
          // full screen mode stays on) shows the code screen.
          router.refresh();
        }
      })
      .catch(() => alive && router.refresh());
    return () => {
      alive = false;
    };
  }, []);

  // Start the camera only after verification, so no permission prompt appears before it.
  useEffect(() => {
    if (gate !== "open") return undefined;
    startCamera();
    return () => {
      stopCamera();
    };
  }, [gate, startCamera, stopCamera]);

  // Capture the current frame as a square, then cut it to the chosen shape.
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 240);

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 640;
    const size = Math.min(vWidth, vHeight);

    const raw = document.createElement("canvas");
    raw.width = 512;
    raw.height = 512;
    const ctx = raw.getContext("2d");

    // Mirror horizontally for front-camera selfie
    ctx.translate(512, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, (vWidth - size) / 2, (vHeight - size) / 2, size, size, 0, 0, 512, 512);

    rawShotRef.current = raw;
    setCapturedPhoto(shapedPhoto(raw, DEFAULT_PHOTO_SHAPE));
    stopCamera();
  };

  // Retake photo
  const handleRetake = () => {
    rawShotRef.current = null;
    setCapturedPhoto(null);
    startCamera();
  };

  // Submit and continue to edit page
  const handleContinue = async () => {
    setSubmitAttempted(true);
    if (!profession || processing) return;
    const finalName = userName.trim();
    setProcessing(true);

    try {
      // The editor gets the plain square photo so it can offer every shape.
      const squarePhoto = rawShotRef.current ? rawShotRef.current.toDataURL("image/png") : capturedPhoto;
      let photoUrl = squarePhoto;

      // Upload file to server endpoint if a photo was captured
      if (squarePhoto) {
        try {
          const res = await fetch("/api/selfie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: squarePhoto })
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
        {gate === "open" && (
        <motion.div
          className="capture-card"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Step 1: pick your NESCAFÉ character (the name comes from registration) */}
          <div className="capture-profession-block">
            <span id="profession-label" className="capture-label">
              <span>PICK YOUR CHARACTER <span className="capture-required-mark" aria-hidden="true">*</span></span>
            </span>
            <div
              className="character-picker"
              role="radiogroup"
              aria-labelledby="profession-label"
              aria-invalid={submitAttempted && !profession}
              aria-describedby={submitAttempted && !profession ? "profession-error" : undefined}
            >
              {CHARACTERS.map((character) => (
                <button
                  key={character.slug}
                  type="button"
                  role="radio"
                  aria-checked={profession === character.name}
                  className={`character-option${profession === character.name ? " is-selected" : ""}`}
                  onClick={() => setProfession(character.name)}
                >
                  <span className="character-art">
                    <img src={character.src} alt="" draggable={false} />
                  </span>
                  <span className="character-name">{character.name}</span>
                </button>
              ))}
            </div>
            {submitAttempted && !profession && (
              <span className="capture-field-error" id="profession-error" role="alert">Please pick a character to continue.</span>
            )}
          </div>

          {/* Step 2: Camera & Selfie Framing */}
          <div className="capture-camera-block">
            {/* clip path for the circular preview */}
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
              <defs>
                <clipPath id={`photo-clip-${shape.id}`} clipPathUnits="objectBoundingBox">
                  <path d={shape.path} transform="scale(0.01)" />
                </clipPath>
              </defs>
            </svg>

            <div className={`camera-shape-wrap${capturedPhoto ? " has-photo" : ""}`}>
              <div
                className={`camera-viewport${flash ? " flash" : ""}`}
                style={shape.path ? { clipPath: `url(#photo-clip-${shape.id})` } : undefined}
              >
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

                {/* Dashed framing outline: only while the camera is live, so the finished photo has no ring around it */}
                {!capturedPhoto && (
                  <svg className="camera-shape-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d={shape.path || "M0 0H100V100H0Z"} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeDasharray="7 6" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}

                {/* Error overlay if camera is blocked */}
                {cameraError && !capturedPhoto && (
                  <div className="camera-fallback-overlay">
                    <WarningCircle size={40} weight="duotone" color="#ffca28" />
                    <p>{cameraError}</p>
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
            </div>

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
                    disabled={processing}
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
        )}
      </div>
    </motion.main>
  );
}
