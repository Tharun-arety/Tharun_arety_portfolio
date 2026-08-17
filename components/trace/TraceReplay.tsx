"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { formatMs } from "@/lib/traces";

/**
 * Playback for a recorded turn.
 *
 * The bar this drives is drawn at true scale, so the playhead moves at the
 * speed the turn actually ran at. That is the only reason playing it back is
 * worth anything: a scrubber over an eased curve would just be an animation.
 *
 * The interaction follows the rules that make a control feel physical rather
 * than operated:
 *
 *   - Feedback on pointer-DOWN and continuously through the drag, never only
 *     on release.
 *   - The playhead tracks the pointer 1:1, and respects where it was grabbed,
 *     so it does not jump under the finger.
 *   - Every animation is interruptible. Grabbing mid-play takes over from the
 *     value currently on screen, so there is no snap back to a logical value.
 *   - A flick projects where the motion was going and settles there with a
 *     critically damped spring, rather than stopping dead at the release point.
 *   - Past either end, resistance increases instead of the playhead hitting a
 *     wall.
 *
 * Position is written to a CSS custom property, not to React state. At 60fps
 * the difference is one style write per frame versus re-rendering every segment
 * of the bar per frame.
 */

/** Where a flick is heading. Apple's projection, not the textbook v²/2a. */
function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary — real things slow before they stop. */
function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

type Sample = { x: number; t: number };

export function TraceReplay({
  children,
  durationMs,
  /** Play once on arrival. Ignored when the reader has asked for less motion. */
  autoPlay = false,
}: {
  children: React.ReactNode;
  durationMs: number;
  autoPlay?: boolean;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  // The presentation value. Everything reads and writes this, which is what
  // makes interrupting an animation free of jumps.
  const progressRef = React.useRef(1);
  const rafRef = React.useRef<number | null>(null);
  const draggingRef = React.useRef(false);
  const grabOffsetRef = React.useRef(0);
  const samplesRef = React.useRef<Sample[]>([]);

  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(durationMs);

  const write = React.useCallback((value: number) => {
    progressRef.current = value;
    hostRef.current?.style.setProperty("--trace-progress", String(value));
  }, []);

  const stop = React.useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  /** Wall-clock playback at the turn's recorded speed. */
  const play = React.useCallback(
    (from: number) => {
      stop();
      setPlaying(true);
      const startedAt = performance.now();
      const startValue = from >= 0.999 ? 0 : from;

      const step = (now: number) => {
        const value = startValue + (now - startedAt) / durationMs;
        if (value >= 1) {
          write(1);
          setElapsed(durationMs);
          setPlaying(false);
          rafRef.current = null;
          return;
        }
        write(value);
        setElapsed(value * durationMs);
        rafRef.current = requestAnimationFrame(step);
      };

      write(startValue);
      rafRef.current = requestAnimationFrame(step);
    },
    [durationMs, stop, write],
  );

  /**
   * Critically damped settle toward a target, starting from wherever the value
   * is right now and carrying the release velocity in.
   */
  const settle = React.useCallback(
    (target: number, velocity: number) => {
      stop();
      let value = progressRef.current;
      let v = velocity;
      let last = performance.now();
      // Damping 1.0 — no overshoot. The track is bounded, so a bounce would
      // clip against the end rather than read as momentum.
      const stiffness = 220;
      const damping = 2 * Math.sqrt(stiffness);

      const step = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const a = -stiffness * (value - target) - damping * v;
        v += a * dt;
        value += v * dt;

        if (Math.abs(value - target) < 0.0008 && Math.abs(v) < 0.02) {
          write(target);
          setElapsed(target * durationMs);
          rafRef.current = null;
          return;
        }
        write(Math.max(0, Math.min(1, value)));
        setElapsed(Math.max(0, Math.min(1, value)) * durationMs);
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [durationMs, stop, write],
  );

  const toggle = React.useCallback(() => {
    if (playing) {
      stop();
      setPlaying(false);
    } else {
      play(progressRef.current);
    }
  }, [play, playing, stop]);

  const fractionAt = React.useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;

    // Interrupt whatever is running, from where it visibly is.
    stop();
    setPlaying(false);
    track.setPointerCapture(event.pointerId);
    draggingRef.current = true;

    const raw = fractionAt(event.clientX);
    const distance = Math.abs(raw - progressRef.current) * track.getBoundingClientRect().width;

    // Grabbed the playhead: keep the offset so it does not leap under the
    // finger. Grabbed the track: seek there, which is what a scrubber should do.
    grabOffsetRef.current = distance < 14 ? progressRef.current - raw : 0;
    const next = Math.max(0, Math.min(1, raw + grabOffsetRef.current));
    write(next);
    setElapsed(next * durationMs);

    samplesRef.current = [{ x: event.clientX, t: performance.now() }];
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;

    const raw = fractionAt(event.clientX) + grabOffsetRef.current;
    const width = track.getBoundingClientRect().width;

    // Past an end, follow less and less rather than stopping dead.
    let next = raw;
    if (raw < 0) next = rubberband(raw * width, width) / width;
    else if (raw > 1) next = 1 + rubberband((raw - 1) * width, width) / width;

    write(Math.max(-0.08, Math.min(1.08, next)));
    setElapsed(Math.max(0, Math.min(1, next)) * durationMs);

    const samples = samplesRef.current;
    samples.push({ x: event.clientX, t: performance.now() });
    if (samples.length > 6) samples.shift();
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    trackRef.current?.releasePointerCapture(event.pointerId);

    const track = trackRef.current;
    const samples = samplesRef.current;
    const width = track?.getBoundingClientRect().width ?? 1;

    // Velocity from the recent history, not from the last event alone — one
    // frame's delta is noise.
    let velocity = 0;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) velocity = ((last.x - first.x) / dt) * 1000; // px/s
    }

    const projected = progressRef.current + project(velocity) / width;
    const target = Math.max(0, Math.min(1, projected));
    settle(target, velocity / width);
  }

  /**
   * Play once, when the reader actually reaches it.
   *
   * This used to fire on mount, which was right when the trace led the page and
   * wrong the moment it moved below the fold — it would have played to an empty
   * room and been finished before anyone scrolled down. Tied to intersection, it
   * starts as the panel comes into view and never repeats. Skipped entirely for
   * readers who asked for less motion; the play button still works for them.
   */
  React.useEffect(() => {
    if (!autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const host = hostRef.current;
    if (!host) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => play(0), 250);
      },
      // Most of the panel has to be on screen, not a sliver of its top edge.
      { threshold: 0.5 },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [autoPlay, play]);

  React.useEffect(() => stop, [stop]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = Math.min(1, progressRef.current + step);
    else if (event.key === "ArrowLeft") next = Math.max(0, progressRef.current - step);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggle();
      return;
    }
    if (next === null) return;
    event.preventDefault();
    stop();
    setPlaying(false);
    write(next);
    setElapsed(next * durationMs);
  }

  return (
    <div ref={hostRef} style={{ ["--trace-progress" as string]: "1" }}>
      {/* The bar itself is the scrub surface — dragging the thing you are
          reading beats dragging a separate control below it. */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Scrub the recorded turn"
        aria-valuemin={0}
        aria-valuemax={Math.round(durationMs)}
        aria-valuenow={Math.round(elapsed)}
        aria-valuetext={`${formatMs(elapsed)} of ${formatMs(durationMs)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="cursor-ew-resize touch-none select-none"
      >
        {children}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="border-rule-strong text-ink hover:border-ink flex size-7 cursor-pointer items-center justify-center border transition-colors"
          aria-label={playing ? "Pause" : "Play the recorded turn"}
        >
          {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
        </button>
        <button
          type="button"
          onClick={() => {
            stop();
            setPlaying(false);
            write(0);
            setElapsed(0);
          }}
          className="border-rule text-ink-faint hover:text-ink hover:border-rule-strong flex size-7 cursor-pointer items-center justify-center border transition-colors"
          aria-label="Rewind to the start"
        >
          <RotateCcw className="size-3" />
        </button>
        <span className="tnum text-ink-faint text-xs">
          {formatMs(elapsed)} / {formatMs(durationMs)}
        </span>
        <span className="letter ml-auto hidden sm:block">Drag the bar to scrub</span>
      </div>
    </div>
  );
}
