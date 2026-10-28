import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import { prefersReducedMotion } from "../lib/motion";

// iOS Safari only: motion events need permission, asked from a user tap
type PermissionRequester = { requestPermission?: () => Promise<"granted" | "denied"> };
type Permission = "not-needed" | "prompt" | "granted" | "denied";

const STORAGE_KEY = "tilt-permission";

function initialPermission(): Permission {
  if (typeof DeviceOrientationEvent === "undefined") return "not-needed";
  const requester = DeviceOrientationEvent as unknown as PermissionRequester;
  if (typeof requester.requestPermission !== "function") return "not-needed";
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === "granted" || saved === "denied") return saved;
  } catch {
    // Storage blocked: ask again
  }
  return "prompt";
}

const clamp = (value: number) => Math.min(1, Math.max(-1, value));

// Tilts ref's element towards the phone's orientation (or the mouse on desktop)
// by writing --rx/--ry/--mx/--my straight onto the element; no React state per frame.
// Does nothing when the user prefers reduced motion.
export function useTilt(ref: RefObject<HTMLElement | null>, { max = 8 } = {}) {
  const [reduceMotion] = useState(prefersReducedMotion);
  const [permission, setPermission] = useState<Permission>(initialPermission);
  // Chrome also has requestPermission but sends readings without it, so the hint
  // only shows on a touch device that got no readings shortly after load (iOS)
  const [hintReady, setHintReady] = useState(false);

  useEffect(() => {
    if (reduceMotion || permission !== "prompt") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const timer = setTimeout(() => setHintReady(true), 600);
    return () => clearTimeout(timer);
  }, [reduceMotion, permission]);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;
    // Re-declared so the nested handlers see it as non-null
    const el: HTMLElement = node;

    let frame = 0;
    let next = { nx: 0, ny: 0 };

    // nx/ny are -1..1; several events per frame collapse into one write
    function tiltTo(nx: number, ny: number) {
      next = { nx, ny };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--ry", `${next.nx * max}deg`);
        el.style.setProperty("--rx", `${-next.ny * max}deg`);
        el.style.setProperty("--mx", `${50 + next.nx * 40}%`);
        el.style.setProperty("--my", `${50 + next.ny * 40}%`);
      });
    }

    function onOrientation(event: DeviceOrientationEvent) {
      if (event.gamma === null || event.beta === null) return;
      // Readings without asking: this browser doesn't need the permission prompt
      if (permission === "prompt") setPermission("not-needed");
      el.classList.add("is-tilting");
      // 45° beta is roughly how people hold a phone
      tiltTo(clamp(event.gamma / 25), clamp((event.beta - 45) / 25));
    }

    // Mouse/pen only; a finger moving over the plate is usually a scroll
    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      el.classList.add("is-tilting");
      tiltTo(
        clamp(((event.clientX - rect.left) / rect.width) * 2 - 1),
        clamp(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    }

    // Back to flat with the slow transition
    function onPointerLeave() {
      el.classList.remove("is-tilting");
      tiltTo(0, 0);
    }

    // While "prompt", listen anyway: iOS sends nothing until allowed, other browsers do
    const listenToDevice = permission !== "denied";
    if (listenToDevice) window.addEventListener("deviceorientation", onOrientation);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (listenToDevice) window.removeEventListener("deviceorientation", onOrientation);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(frame);
      el.classList.remove("is-tilting");
      for (const name of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(name);
    };
  }, [ref, max, reduceMotion, permission]);

  // Must be called from a tap; iOS rejects it otherwise
  const requestPermission = useCallback(async () => {
    const requester = DeviceOrientationEvent as unknown as PermissionRequester;
    let result: Permission = "denied";
    try {
      result = (await requester.requestPermission?.()) ?? "denied";
    } catch {
      // Not called from a user gesture, or the browser refused
    }
    setPermission(result);
    try {
      sessionStorage.setItem(STORAGE_KEY, result);
    } catch {
      // Storage blocked: the hint comes back on the next visit
    }
  }, []);

  return {
    needsPermission: !reduceMotion && permission === "prompt" && hintReady,
    requestPermission,
  };
}
