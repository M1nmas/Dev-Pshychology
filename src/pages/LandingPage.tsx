import { useEffect, useMemo, useRef, useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import CodeEditor from "../components/CodeEditor";
import RoastButton from "../components/RoastButton";
import Footer from "../components/Footer";
import DeveloperStatus from "../components/DeveloperStatus";

import { analyzeCode, getRoast } from "../utils/codeAnalysis";
import { roastCode } from "../utils/api";

import type { RoastResult } from "../types";

const DEFAULT_CODE = `function fixMyLife() {
  const problems = [];

  console.log("starting...");

  // TODO: actually fix this later

  return problems;
}`;

function LandingPage() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [roast, setRoast] = useState<RoastResult | null>(null);
  const [isRoasting, setIsRoasting] = useState<boolean>(false);
  const [showRoastReaction, setShowRoastReaction] = useState<boolean>(false);
  const [roastDamaged, setRoastDamaged] = useState<boolean>(false);
  const [roastBlackout, setRoastBlackout] = useState<boolean>(false);
  const roastNumber = useRef(0);

  const analysis = useMemo(() => {
    return analyzeCode(code);
  }, [code]);

  useEffect(() => {
    if (!roast) {
      return;
    }

    setShowRoastReaction(false);
  setRoastDamaged(false);
    setRoastBlackout(false);
    const roastAudio = new Audio("/assets/roast-dialog.mp3");
    roastAudio.loop = false;
    const showReactionAtSixSeconds = () => {
      if (roastAudio.currentTime >= 6) {
        setShowRoastReaction(true);
        roastAudio.removeEventListener("timeupdate", showReactionAtSixSeconds);
      }
    };

    roastAudio.addEventListener("timeupdate", showReactionAtSixSeconds);
    void roastAudio.play().catch((error: unknown) => {
      console.error("Roast audio playback error:", error);
    });

    return () => {
      roastAudio.pause();
      roastAudio.removeEventListener("timeupdate", showReactionAtSixSeconds);
    };
  }, [roast]);

  useEffect(() => {
    if (!roastDamaged) {
      return;
    }

    const blackoutTimer = window.setTimeout(() => {
      setRoastBlackout(true);
    }, 1350);

    return () => window.clearTimeout(blackoutTimer);
  }, [roastDamaged]);

  const handleRoast = async () => {
    if (!code.trim() || isRoasting) {
      return;
    }

    setIsRoasting(true);
    setRoast(null);
    roastNumber.current += 1;

    try {
      const result = await roastCode(code, roastNumber.current);

      setRoast((previousRoast) => {
        if (previousRoast?.message === result.message) {
          return getRoast(code, roastNumber.current + 1);
        }

        return result;
      });
    } catch (error) {
      console.error("Roast API error:", error);

      setRoast(getRoast(code, roastNumber.current));
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <Hero>
        <div className="editor-container">
          <CodeEditor
            code={code}
            onChange={setCode}
          />

          <div className="editor-actions">
            <RoastButton
              onRoast={handleRoast}
              disabled={isRoasting || !code.trim()}
            />

            <div className="developer-count">
              ♨ 2,847 developers emotionally damaged so far
            </div>
          </div>

          {isRoasting && (
            <div className="roast-loading" role="status" aria-live="polite">
              <video
                className="roast-video"
                src="/assets/funnyanimation.mp4"
                autoPlay
                muted
                playsInline
                onTimeUpdate={(event) => {
                  if (event.currentTarget.currentTime >= 5) {
                    event.currentTarget.currentTime = 0;
                  }
                }}
                aria-label="Funny roast reaction animation"
              />
              <span className="loading-orbit" aria-hidden="true">
                <i>😂</i><i>🚩</i><i>🤡</i><i>🔥</i>
              </span>
              <span className="loading-copy"><strong>CODE ON TRIAL</strong> / AI is sharpening its insults</span>
              <span className="loading-dots"><i>.</i><i>.</i><i>.</i></span>
            </div>
          )}

          {roast && (
            <section
              className={`roast-result roast-${roast.severity}${roastDamaged ? " roast-damaged" : ""}`}
              aria-live="polite"
            >
              <div className="roast-result-header">
                <span className="roast-stamp">🔥 AI CODE ROAST</span>

                <span>🚩 {roast.flags} RED FLAGS</span>
              </div>

              <p className="roast-message">
                <span className="sentence-spark" aria-hidden="true">💥</span>
                {roast.message}
              </p>

              {showRoastReaction && (
                <video
                  className="roast-video roast-reaction"
                  src="/assets/roast-reaction.mp4"
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setRoastDamaged(true)}
                  aria-label="Roast reaction"
                />
              )}

              {roastBlackout && <div className="roast-blackout" aria-hidden="true" />}
            </section>
          )}

          {roast && (
            <DeveloperStatus
              flags={roast.flags}
              roastNumber={roastNumber.current}
            />
          )}

          <div className="analysis-summary">
            <span>
              {analysis.flags} red flag
              {analysis.flags === 1 ? "" : "s"} detected
            </span>

            <span>•</span>

            <span>JS</span>
          </div>

          <p className="disclaimer">
            No AI therapist included. Void where prohibited by good taste.
          </p>
        </div>
      </Hero>

      <Footer />
    </div>
  );
}

export default LandingPage;