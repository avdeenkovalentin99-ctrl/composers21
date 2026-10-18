import { useCallback, useEffect, useRef } from "react";

type DriftTrajectory = {
  selector: string;
  x: number;
  y: number;
  periodX: number;
  periodY: number;
  phaseX: number;
  phaseY: number;
};

type Trajectory = DriftTrajectory | { selector: string; rotationAmplitude: number; rotationPeriod: number };

// Each axis combines two smooth, bounded waves. Their starting value is
// subtracted, so every offset stays relative to the original composition.
const trajectories: readonly (readonly Trajectory[])[] = [
  [
    { selector: ".home-year-square", x: 5.5, y: 4.2, periodX: 5.4, periodY: 6.7, phaseX: 2.4, phaseY: 3 },
    { selector: ".home-year-diagonal", x: 3, y: 5.7, periodX: 4.7, periodY: 7.8, phaseX: 0.15, phaseY: 0.8 },
  ],
  [
    { selector: ".home-year-inversion", x: 5.8, y: 5.4, periodX: 4.8, periodY: 4.6, phaseX: 0.15, phaseY: 5.7 },
  ],
  [
    { selector: ".home-year-hairline", rotationAmplitude: 6, rotationPeriod: 5.6 },
    { selector: ".home-year-inversion", x: 5.3, y: 1.7, periodX: 4.8, periodY: 7.1, phaseX: 0.1, phaseY: 2.7 },
  ],
  [
    { selector: ".home-year-square", x: 4.2, y: 5, periodX: 7.6, periodY: 5.1, phaseX: 4.3, phaseY: 2.6 },
  ],
];

function offset(time: number, amplitude: number, period: number, phase: number) {
  const angle = time * Math.PI * 2 / period;
  return amplitude * (
    0.7 * (Math.sin(angle + phase) - Math.sin(phase))
    + 0.3 * (Math.sin(angle / 0.91 + phase * 1.7) - Math.sin(phase * 1.7))
  );
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// Exact integral of smoothstep: phase remains continuous even between
// irregular frames or when a hover reverses an unfinished speed ramp.
function integratedSmoothstep(t: number) {
  return t * t * t - 0.5 * t * t * t * t;
}

export function useFestivalFigureMotion() {
  const ref = useRef<HTMLElement | null>(null);
  const controller = useRef<(index: number, hovered: boolean) => void>(() => {});

  const setColumnHovered = useCallback((index: number, hovered: boolean) => {
    controller.current(index, hovered);
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const columns = root.querySelectorAll<HTMLElement>(".home-year-column");
    const states = trajectories.map((figures, index) => ({
      figures: figures.flatMap((trajectory) => {
        const element = columns[index]?.querySelector<HTMLElement>(trajectory.selector);
        return element ? [{ element, trajectory }] : [];
      }),
      phase: 0,
      speed: 0,
      fromSpeed: 0,
      targetSpeed: 0,
      rampTime: 0,
      rampDuration: 0,
      hovered: false,
    }));

    let enabled = desktop.matches && !reducedMotion.matches;
    let frame: number | null = null;
    let lastTime: number | null = null;
    let disposed = false;

    const canHover = () => root.closest<HTMLElement>("[data-year-entrance]")?.dataset.yearEntrance === "complete";
    const isMoving = () => states.some((state) => state.speed > 0 || state.targetSpeed > 0);

    const advance = (now: number) => {
      const dt = lastTime === null ? 0 : Math.max(0, now - lastTime) / 1000;
      lastTime = now;
      for (const state of states) {
        if (state.speed === 0 && state.targetSpeed === 0) continue;

        let remaining = dt;
        let travel = 0;
        if (state.rampTime < state.rampDuration) {
          const step = Math.min(remaining, state.rampDuration - state.rampTime);
          const start = state.rampTime / state.rampDuration;
          const end = (state.rampTime + step) / state.rampDuration;
          travel += state.fromSpeed * step
            + (state.targetSpeed - state.fromSpeed) * state.rampDuration
              * (integratedSmoothstep(end) - integratedSmoothstep(start));
          state.rampTime += step;
          state.speed = state.fromSpeed
            + (state.targetSpeed - state.fromSpeed) * smoothstep(end);
          remaining -= step;
          if (state.rampTime >= state.rampDuration) state.speed = state.targetSpeed;
        }
        travel += remaining * state.targetSpeed;
        if (travel === 0) continue;
        state.phase += travel;

        for (const { element, trajectory } of state.figures) {
          if ("rotationAmplitude" in trajectory) {
            const angle = trajectory.rotationAmplitude * (1 - Math.cos(state.phase * Math.PI * 2 / trajectory.rotationPeriod)) / 2;
            element.style.setProperty("--figure-angle", angle.toFixed(4) + "deg");
            continue;
          }
          element.style.setProperty("--figure-x", offset(state.phase, trajectory.x, trajectory.periodX, trajectory.phaseX).toFixed(3) + "px");
          element.style.setProperty("--figure-y", offset(state.phase, trajectory.y, trajectory.periodY, trajectory.phaseY).toFixed(3) + "px");
        }
      }
    };

    const cancel = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
    };

    const tick = (now: number) => {
      frame = null;
      if (disposed || !enabled || document.hidden) {
        lastTime = null;
        return;
      }
      advance(now);
      if (isMoving()) frame = window.requestAnimationFrame(tick);
      else lastTime = null;
    };

    const schedule = () => {
      if (!disposed && enabled && !document.hidden && frame === null && isMoving()) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(tick);
      }
    };

    const ramp = (state: typeof states[number], target: number) => {
      state.fromSpeed = state.speed;
      state.targetSpeed = target;
      state.rampTime = 0;
      state.rampDuration = target === 1 ? 0.22 : 0.35;
    };

    controller.current = (index, hovered) => {
      if (hovered && !canHover()) return;
      const state = states[index];
      if (!state || state.hovered === hovered) return;
      if (enabled && lastTime !== null) advance(performance.now());
      state.hovered = hovered;
      if (enabled) ramp(state, hovered ? 1 : 0);
      schedule();
    };

    const updatePreference = () => {
      enabled = desktop.matches && !reducedMotion.matches;
      if (!enabled) {
        cancel();
        for (const state of states) {
          state.speed = 0;
          state.targetSpeed = 0;
          state.rampTime = state.rampDuration;
          state.hovered = false;
        }
      } else {
        states.forEach((state, index) => {
          state.hovered = canHover() && (columns[index]?.matches(":hover") ?? false);
          if (state.hovered) ramp(state, 1);
        });
        schedule();
      }
    };

    const updateVisibility = () => {
      if (document.hidden) cancel();
      else schedule();
    };

    desktop.addEventListener("change", updatePreference);
    reducedMotion.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      disposed = true;
      cancel();
      controller.current = () => {};
      desktop.removeEventListener("change", updatePreference);
      reducedMotion.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return { ref, setColumnHovered };
}
