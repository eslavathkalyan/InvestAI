import React, { Component, useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";

// Class-based React Error Boundary to catch render-phase crashes from Spline deserialization
class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("SplineErrorBoundary caught a rendering crash:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const SplineModel = ({ 
  scene = "https://prod.spline.design/h92Swzb9GCeZ45VF/scene.splinecode",
  onLoad,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Robust watermark removal hook targeting both light DOM and shadow DOMs
  useEffect(() => {
    const hideSplineWatermarks = () => {
      const selectors = [
        '#logo',
        'a[href*="spline"]',
        '.spline-watermark',
        'a[title*="Spline"]',
        'div[style*="pointer-events"] a',
      ];

      // Hide in light DOM
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("pointer-events", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
        });
      });

      // Hide in shadow DOMs
      document.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          selectors.forEach((sel) => {
            el.shadowRoot.querySelectorAll(sel).forEach((subEl) => {
              subEl.style.setProperty("display", "none", "important");
              subEl.style.setProperty("opacity", "0", "important");
              subEl.style.setProperty("pointer-events", "none", "important");
              subEl.style.setProperty("visibility", "hidden", "important");
            });
          });
        }
      });
    };

    hideSplineWatermarks();
    const interval = setInterval(hideSplineWatermarks, 150);

    // Stop checking after 8 seconds (when the model is fully loaded and settled)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleLoad = (splineApp) => {
    setLoading(false);
    if (onLoad) onLoad(splineApp);
  };

  const handleError = (err) => {
    console.warn("Spline 3D Scene failed to load, switching to premium video fallback:", err);
    setHasError(true);
    setLoading(false);
  };

  const VideoFallback = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-10 dark:opacity-20"
      >
        <source
          src="https://player.vimeo.com/external/517602120.sd.mp4?s=27e289f0775d7f1e779a1f7360c7f12e8b010c2c&profile_id=165&oauth2_token_id=57447761"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/30 to-cream dark:via-dark-bg/30 dark:to-dark-bg" />
    </div>
  );

  if (hasError) {
    return <VideoFallback />;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden w-full h-full">
      <style>{`
        .spline-container-wrapper {
          transform: scale(1.05) translate(-5%, 0%);
          transform-origin: center;
        }
        @media (min-width: 768px) {
          .spline-container-wrapper {
            transform: scale(1.3) translate(20%, -3%);
          }
        }
      `}</style>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
      {/* 
        Container scaled and positioned so the full 3D avatar is visible 
        and clean without being clipped by the edges.
      */}
      <div className="w-full h-full opacity-100 dark:opacity-100 transition-all duration-1000 spline-container-wrapper">
        <SplineErrorBoundary onError={handleError}>
          <Spline 
            scene={scene} 
            onLoad={handleLoad}
            onError={handleError}
          />
        </SplineErrorBoundary>
      </div>
    </div>
  );
};

export default SplineModel;


