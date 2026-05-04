import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { composers } from "../data/composers";
import { performers } from "../data/performers";
import { PageContainer } from "../layout/PageContainer";

const fallbackNames = [
  "Леонид Десятников",
  "Александр Чайковский",
  "Павел Карманов",
  "Владимир Мартынов",
  "Георг Пелецис",
  "Эрик Эшенвальдс",
  "Эдисон Денисов",
  "Янис Ксенакис",
  "Арво Пярт",
  "Алексей Ретинский",
  "Григорий Смирнов",
  "Максим Новиков",
  "Алексей Гориболь",
  "Алексей Лундин",
  "Андрей Березин",
  "Владимир Спиваков",
  "Федор Строганов",
  "Никита Борисоглебский",
  "Ольга Томилова",
  "Борис Андрианов",
  "Петр Айду",
  "Солисты Нижнего Новгорода",
  "OpensoundOrchestra",
  "Brezel Ensemble",
  "Ансамбль Classica Plus",
  "Квартет имени Глинки",
  "Хоровой ансамбль Мелодия",
  "Île Thélème Ensemble",
  "Виртуозы Москвы",
];

const SCENE_SCROLL_HEIGHT_CLASS = "relative h-[440vh]";
const STAFF_TOP = 22;
const STAFF_LINE_COUNT = 5;
const STAFF_SYSTEM_GAP = 23;
const STAFF_BASE_LINE_STEP = 2.55;
const STAFF_SLOT_STEP = STAFF_BASE_LINE_STEP / 2;
const TIMELINE_DURATIONS_MS = {
  faintIntro: 1650,
  build: 4300,
  readyPause: 700,
  chordOneIn: 920,
  chordOneHold: 1500,
  chordOneOut: 960,
  pauseOne: 980,
  chordTwoIn: 980,
  chordTwoHold: 1720,
  chordTwoOut: 980,
  pauseTwo: 1040,
  chordThreeIn: 0,
  chordThreeHold: 0,
  chordThreeOut: 0,
  staffFade: 680,
  silence: 1000,
  ctaIn: 920,
  ctaHold: 1200,
} as const;
const VISUAL_PROGRESS_RESPONSE = 4.1;
const MAX_VISUAL_PROGRESS_SPEED = 0.052;
const MAX_VISUAL_PROGRESS_ACCELERATION = 0.11;
const MAX_VISUAL_PROGRESS_DECELERATION = 0.22;
const MAX_SCENE_SCROLL_SPEED_PX = 540;
const MAX_SCENE_SCROLL_ACCELERATION_PX = 1600;
const MAX_SCENE_SCROLL_DECELERATION_PX = 2800;
const MAX_SCENE_SCROLL_QUEUE_PX = 420;
const SCENE_SCROLL_INTERCEPT_DAMPING = 0.7;
const EARLY_SCENE_SCROLL_INTERCEPT_DAMPING = 0.9;
const FINAL_SCENE_LOCK_RAW_PROGRESS = 0.985;
const FINAL_SCENE_LOCK_VISUAL_PROGRESS = 0.94;

type StaffSceneProps = {
  names: string[];
  sceneProgress: number;
};

type ClusterNameItem = {
  id: string;
  label: string;
  stepOffset: number;
  dx: number;
  xNudge: number;
  rotation: number;
  yNudge: number;
};

type NameCluster = {
  id: string;
  systemIndex: number;
  left: number;
  centerStep: number;
  items: ClusterNameItem[];
};

type NameComposition = {
  id: string;
  clusters: NameCluster[];
};

type SceneDensity = "desktop" | "tablet" | "mobile";

type ClusterBlueprint = {
  systemIndex: number;
  left: number;
  centerStep: number;
  shapeIndex: number;
};

type PhaseWindow = {
  start: number;
  end: number;
};

type ScenePhases = Record<keyof typeof TIMELINE_DURATIONS_MS, PhaseWindow> & {
  totalDuration: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0;
  }

  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function uniqueNames(names: string[]) {
  return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
}

function getStaffSlotY(systemIndex: number, slot: number) {
  return STAFF_TOP + systemIndex * STAFF_SYSTEM_GAP + slot * STAFF_SLOT_STEP;
}

function getLineAvoidanceOffset(slot: number, itemIndex: number, density: SceneDensity) {
  const roundedSlot = Math.round(slot);
  const isOnStaffLine = Math.abs(slot - roundedSlot) < 0.08 && roundedSlot % 2 === 0;
  const baseOffset = density === "mobile" ? 5.5 : density === "tablet" ? 4.5 : 3.8;

  if (isOnStaffLine) {
    return (itemIndex % 2 === 0 ? -1 : 1) * baseOffset;
  }

  const distanceToNearestLine = Math.min(
    ...[0, 2, 4, 6, 8].map((lineSlot) => Math.abs(slot - lineSlot)),
  );

  if (distanceToNearestLine < 0.34) {
    return (itemIndex % 2 === 0 ? -1 : 1) * (baseOffset * 0.65);
  }

  return 0;
}

function buildNamePool() {
  const realNames = uniqueNames([...composers, ...performers].map((person) => person.name));
  return realNames.length > 0 ? realNames : fallbackNames;
}

function getNamesForDensity(names: string[], density: SceneDensity) {
  if (density === "mobile") {
    return names.slice(0, 14);
  }

  if (density === "tablet") {
    return names.slice(0, 26);
  }

  return names;
}

function buildScenePhases(): ScenePhases {
  let cursor = 0;
  const phases = {} as ScenePhases;

  for (const [key, duration] of Object.entries(TIMELINE_DURATIONS_MS) as Array<
    [keyof typeof TIMELINE_DURATIONS_MS, number]
  >) {
    phases[key] = { start: cursor, end: cursor + duration };
    cursor += duration;
  }

  phases.totalDuration = cursor;
  return phases;
}

const SCENE_PHASES = buildScenePhases();

const clusterShapes = [
  [
    { stepOffset: -3, dx: -0.36, xNudge: -4, rotation: -0.55, yNudge: -6 },
    { stepOffset: 0, dx: 0.2, xNudge: 2, rotation: 0.2, yNudge: 1 },
    { stepOffset: 3, dx: -0.18, xNudge: -1, rotation: 0.55, yNudge: 6 },
  ],
  [
    { stepOffset: -4, dx: -0.42, xNudge: -5, rotation: -0.6, yNudge: -8 },
    { stepOffset: -1, dx: 0.18, xNudge: 3, rotation: -0.18, yNudge: -2 },
    { stepOffset: 1, dx: -0.16, xNudge: -2, rotation: 0.18, yNudge: 2 },
    { stepOffset: 4, dx: 0.38, xNudge: 4, rotation: 0.62, yNudge: 8 },
  ],
  [
    { stepOffset: -4, dx: -0.35, xNudge: -5, rotation: -0.55, yNudge: -8 },
    { stepOffset: -2, dx: 0.16, xNudge: 2, rotation: 0.12, yNudge: -4 },
    { stepOffset: 0, dx: -0.06, xNudge: -1, rotation: -0.1, yNudge: 0 },
    { stepOffset: 2, dx: 0.24, xNudge: 3, rotation: 0.26, yNudge: 4 },
    { stepOffset: 4, dx: -0.12, xNudge: -2, rotation: 0.62, yNudge: 8 },
  ],
  [
    { stepOffset: -4, dx: -0.38, xNudge: -6, rotation: -0.68, yNudge: -9 },
    { stepOffset: -2, dx: 0.14, xNudge: 2, rotation: -0.22, yNudge: -4 },
    { stepOffset: -1, dx: -0.08, xNudge: -2, rotation: 0.08, yNudge: -1 },
    { stepOffset: 1, dx: 0.18, xNudge: 2, rotation: 0.16, yNudge: 1 },
    { stepOffset: 2, dx: -0.16, xNudge: -3, rotation: 0.34, yNudge: 4 },
    { stepOffset: 4, dx: 0.34, xNudge: 5, rotation: 0.68, yNudge: 9 },
  ],
  [{ stepOffset: 0, dx: 0, xNudge: 0, rotation: 0.08, yNudge: 0 }],
] as const;

const blueprintHorizontalRhythm = [-0.9, 0.45, 1.05, -0.35, 0.8, -1.1, 0.55, 1.15, -0.5, 0.35] as const;
const blueprintVerticalRhythm = [0, 1, -1, 0, 1, -1, 0, 1, -1, 0] as const;
const staffBaseLineOpacity = [0.08, 0.1, 0.12, 0.095, 0.08] as const;
const staffBaseLineYOffset = [-0.08, 0.05, 0, -0.04, 0.07] as const;
const primaryLineBreathAmplitude = [0.016, 0.028, 0.02] as const;
const primaryLineSettleDirection = [-1.2, 0.5, 1.1] as const;
const primarySplitOffsetMultiplier = [1.18, 0, -1.05] as const;
const primarySplitLagOffsets = [0.01, 0.028, 0.018] as const;
const primaryLineLengthTrim = [
  { start: 0.1, end: 0.2 },
  { start: 0, end: 0 },
  { start: 0.18, end: 0.12 },
] as const;

function constrainCenterStep(step: number) {
  return Math.max(1, Math.min(7, step));
}

function applyBlueprintRhythm(blueprints: ClusterBlueprint[], phase = 0) {
  return blueprints.map((blueprint, index) => {
    const rhythmIndex = (index + phase + blueprint.systemIndex) % blueprintHorizontalRhythm.length;

    return {
      ...blueprint,
      left: Math.max(5, Math.min(94, blueprint.left + blueprintHorizontalRhythm[rhythmIndex])),
      centerStep: constrainCenterStep(blueprint.centerStep + blueprintVerticalRhythm[rhythmIndex]),
    };
  });
}

function takeSequentialNames(names: string[], start: number, count: number) {
  const poolSize = Math.max(names.length, 1);
  return Array.from({ length: count }, (_, index) => names[(start + index) % poolSize]);
}

function createCluster(id: string, labels: string[], blueprint: ClusterBlueprint): NameCluster {
  const shape = clusterShapes[blueprint.shapeIndex];

  return {
    id,
    systemIndex: blueprint.systemIndex,
    left: blueprint.left,
    centerStep: blueprint.centerStep,
    items: labels.map((label, index) => {
      const note = shape[index];

      return {
        id: `${id}-${index}`,
        label,
        stepOffset: note.stepOffset,
        dx: note.dx,
        xNudge: note.xNudge,
        rotation: note.rotation,
        yNudge: note.yNudge,
      };
    }),
  };
}

function nudgeCluster(cluster: NameCluster, leftDelta: number, centerStepDelta: number): NameCluster {
  return {
    ...cluster,
    left: Math.max(5, Math.min(94, cluster.left + leftDelta)),
    centerStep: constrainCenterStep(cluster.centerStep + centerStepDelta),
  };
}

function spreadClusterItems(
  cluster: NameCluster,
  config: {
    vertical?: number;
    horizontal?: number;
    yOffset?: number;
    xOffset?: number;
  },
): NameCluster {
  const vertical = config.vertical ?? 1;
  const horizontal = config.horizontal ?? 1;
  const yOffset = config.yOffset ?? 0;
  const xOffset = config.xOffset ?? 0;
  const centerIndex = (cluster.items.length - 1) / 2;

  return {
    ...cluster,
    items: cluster.items.map((item, itemIndex) => {
      const distanceFromCenter = itemIndex - centerIndex;

      return {
        ...item,
        stepOffset: Math.round(item.stepOffset * vertical),
        xNudge: item.xNudge + distanceFromCenter * horizontal + xOffset,
        yNudge: item.yNudge + distanceFromCenter * 2.4 * vertical + yOffset,
      };
    }),
  };
}

function tuneCompositionOneClusters(clusters: NameCluster[]) {
  return clusters.map((cluster, index) => {
    let nextCluster = cluster;

    if (index >= 7 && index <= 10) {
      nextCluster = nudgeCluster(nextCluster, -1.4, index % 2 === 0 ? -1 : 1);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.15, horizontal: 1.4 });
    }

    if (index >= 14 && index <= 17) {
      nextCluster = nudgeCluster(nextCluster, 2.4, index === 15 ? 1 : 0);
    }

    if (index >= 24 && index <= 28) {
      nextCluster = nudgeCluster(nextCluster, 1.2, 0);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.12, horizontal: 0.9, yOffset: 1.5 });
    }

    if (index >= 33 && index <= 36) {
      nextCluster = nudgeCluster(nextCluster, -0.9, index % 2 === 0 ? 1 : -1);
    }

    if (index === 41) {
      nextCluster = nudgeCluster(nextCluster, 3.4, -1);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.22, horizontal: 1.8, yOffset: 2 });
    }

    if (index >= 42 && index <= 45) {
      nextCluster = nudgeCluster(nextCluster, index % 2 === 0 ? -1.6 : 1.8, index % 3 === 0 ? 1 : 0);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.16, horizontal: 1.2 });
    }

    if (index >= 49 && index <= 52) {
      nextCluster = nudgeCluster(nextCluster, -1.2, index % 2 === 0 ? -1 : 1);
    }

    return nextCluster;
  });
}

function tuneCompositionTwoClusters(clusters: NameCluster[]) {
  return clusters.map((cluster, index) => {
    let nextCluster = cluster;

    if (index === 1 || index === 2) {
      nextCluster = nudgeCluster(nextCluster, -1.8, index === 1 ? -1 : 1);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.18, horizontal: 1.6 });
    }

    if (index === 4) {
      nextCluster = nudgeCluster(nextCluster, 3.2, 0);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.28, horizontal: 2.1, yOffset: 1 });
    }

    if (index >= 6 && index <= 8) {
      nextCluster = nudgeCluster(nextCluster, index === 7 ? 0.6 : -0.8, index === 6 ? 1 : 0);
    }

    if (index === 10) {
      nextCluster = nudgeCluster(nextCluster, -2.2, 1);
    }

    if (index === 11 || index === 12) {
      nextCluster = nudgeCluster(nextCluster, 1.4, index === 11 ? -1 : 1);
      nextCluster = spreadClusterItems(nextCluster, { vertical: 1.14, horizontal: 1.1, yOffset: -1.2 });
    }

    if (index >= 13) {
      nextCluster = nudgeCluster(nextCluster, 2.6, index % 2 === 0 ? -1 : 1);
    }

    return nextCluster;
  });
}

function adaptClustersForDensity(clusters: NameCluster[], density: SceneDensity) {
  if (density === "desktop") {
    return clusters;
  }

  const isMobile = density === "mobile";
  const minLeft = isMobile ? 18 : 12;
  const maxLeft = isMobile ? 82 : 88;
  const dxScale = isMobile ? 0.34 : 0.74;
  const xNudgeScale = isMobile ? 0.28 : 0.68;
  const yNudgeScale = isMobile ? 0.92 : 0.88;
  const rotationScale = isMobile ? 0.72 : 0.84;
  const verticalSpreadBoost = isMobile ? 1.42 : 1.08;

  return clusters.map((cluster, clusterIndex) => ({
    ...cluster,
    left: Math.max(minLeft, Math.min(maxLeft, cluster.left)),
    items: cluster.items.map((item, itemIndex) => {
      const distanceFromCenter = itemIndex - (cluster.items.length - 1) / 2;

      return {
        ...item,
        dx: item.dx * dxScale,
        xNudge: item.xNudge * xNudgeScale + distanceFromCenter * (isMobile ? 0.35 : 0.45),
        yNudge: item.yNudge * yNudgeScale,
        stepOffset: Math.round(item.stepOffset * verticalSpreadBoost),
        rotation: item.rotation * rotationScale,
      };
    }),
    centerStep: constrainCenterStep(cluster.centerStep + (isMobile && clusterIndex % 3 === 0 ? 1 : 0)),
  }));
}

function buildNameCompositions(names: string[], density: SceneDensity): NameComposition[] {
  const pool = names.length > 0 ? names : fallbackNames;
  let cursor = 0;

  const buildCompositionClusters = (compositionId: string, blueprints: ClusterBlueprint[]) =>
    blueprints.map((blueprint, index) => {
      const labels = takeSequentialNames(pool, cursor, clusterShapes[blueprint.shapeIndex].length);
      cursor += Math.max(2, Math.floor(labels.length * 0.75));

      return createCluster(`${compositionId}-cluster-${index}`, labels, blueprint);
    });

  const compositionOneAirBlueprints = applyBlueprintRhythm([
    { systemIndex: 0, left: 6, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 0, left: 11, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 0, left: 16, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 0, left: 20, centerStep: 2, shapeIndex: 4 },
    { systemIndex: 0, left: 24, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 0, left: 29, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 0, left: 33, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 0, left: 37, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 0, left: 42, centerStep: 4, shapeIndex: 4 },
    { systemIndex: 0, left: 47, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 0, left: 51, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 0, left: 56, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 0, left: 61, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 0, left: 66, centerStep: 6, shapeIndex: 4 },
    { systemIndex: 0, left: 71, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 0, left: 76, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 0, left: 81, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 0, left: 86, centerStep: 2, shapeIndex: 4 },
    { systemIndex: 0, left: 92, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 7, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 1, left: 12, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 1, left: 17, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 21, centerStep: 6, shapeIndex: 4 },
    { systemIndex: 1, left: 26, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 1, left: 31, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 35, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 1, left: 40, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 1, left: 45, centerStep: 4, shapeIndex: 4 },
    { systemIndex: 1, left: 50, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 1, left: 54, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 59, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 1, left: 64, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 1, left: 69, centerStep: 6, shapeIndex: 4 },
    { systemIndex: 1, left: 73, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 78, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 1, left: 83, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 1, left: 88, centerStep: 2, shapeIndex: 4 },
    { systemIndex: 1, left: 93, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 2, left: 6, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 2, left: 10, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 2, left: 15, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 2, left: 20, centerStep: 2, shapeIndex: 4 },
    { systemIndex: 2, left: 25, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 2, left: 30, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 2, left: 34, centerStep: 6, shapeIndex: 4 },
    { systemIndex: 2, left: 39, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 2, left: 44, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 2, left: 49, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 2, left: 53, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 2, left: 58, centerStep: 4, shapeIndex: 4 },
    { systemIndex: 2, left: 63, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 2, left: 68, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 2, left: 73, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 2, left: 78, centerStep: 6, shapeIndex: 4 },
    { systemIndex: 2, left: 83, centerStep: 7, shapeIndex: 4 },
    { systemIndex: 2, left: 88, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 2, left: 93, centerStep: 2, shapeIndex: 4 },
  ], 1);

  const compositionOneBlueprints =
    density === "mobile"
      ? compositionOneAirBlueprints.filter((_, index) => index % 4 === 0)
      : density === "tablet"
        ? compositionOneAirBlueprints.filter((_, index) => index % 2 === 0)
        : compositionOneAirBlueprints;

  const compositionOne = adaptClustersForDensity(
    tuneCompositionOneClusters(buildCompositionClusters("composition-one", compositionOneBlueprints)),
    density,
  ).map((cluster) => ({
    ...cluster,
    items: cluster.items.map((item) => ({
      ...item,
      rotation: item.rotation * 0.5,
      xNudge: item.xNudge + (cluster.centerStep % 3 === 0 ? 1 : -1),
      yNudge: item.yNudge + (cluster.centerStep % 2 === 0 ? -3.2 : 3.2),
    })),
  }));

  const compositionTwoBlueprints = applyBlueprintRhythm([
    { systemIndex: 0, left: 12, centerStep: 4, shapeIndex: 2 },
    { systemIndex: 0, left: 28, centerStep: 1, shapeIndex: 4 },
    { systemIndex: 0, left: 44, centerStep: 6, shapeIndex: 1 },
    { systemIndex: 0, left: 60, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 0, left: 78, centerStep: 5, shapeIndex: 2 },
    { systemIndex: 1, left: 18, centerStep: 2, shapeIndex: 2 },
    { systemIndex: 1, left: 34, centerStep: 5, shapeIndex: 4 },
    { systemIndex: 1, left: 50, centerStep: 6, shapeIndex: 1 },
    { systemIndex: 1, left: 66, centerStep: 3, shapeIndex: 4 },
    { systemIndex: 1, left: 84, centerStep: 1, shapeIndex: 2 },
    { systemIndex: 2, left: 10, centerStep: 5, shapeIndex: 1 },
    { systemIndex: 2, left: 26, centerStep: 2, shapeIndex: 4 },
    { systemIndex: 2, left: 42, centerStep: 6, shapeIndex: 2 },
    { systemIndex: 2, left: 58, centerStep: 4, shapeIndex: 4 },
    { systemIndex: 2, left: 74, centerStep: 1, shapeIndex: 1 },
    { systemIndex: 2, left: 88, centerStep: 5, shapeIndex: 2 },
  ], 4);

  const compositionTwoVisibleBlueprints =
    density === "mobile"
      ? compositionTwoBlueprints.filter((_, index) => index % 2 === 0)
      : density === "tablet"
        ? compositionTwoBlueprints.filter((_, index) => index % 4 !== 1)
        : compositionTwoBlueprints;

  const compositionTwo = adaptClustersForDensity(
    tuneCompositionTwoClusters(buildCompositionClusters("composition-two", compositionTwoVisibleBlueprints)),
    density,
  ).map((cluster, clusterIndex) => ({
    ...cluster,
    items: cluster.items.map((item, itemIndex) => ({
      ...item,
      xNudge: item.xNudge + ((clusterIndex + itemIndex) % 2 === 0 ? -1 : 2),
      yNudge: item.yNudge + (itemIndex % 2 === 0 ? -1.6 : 1.6),
      rotation: item.rotation * 0.52,
    })),
  }));
  const repeatedNames = compositionOne[1]?.items.slice(0, 2).map((item) => item.label) ?? [];
  if (compositionTwo[1]) {
    compositionTwo[1].items = compositionTwo[1].items.map((item, index) => ({
      ...item,
      label: repeatedNames[index] ?? item.label,
    }));
  }
  if (compositionTwo[5]) {
    compositionTwo[5].items = compositionTwo[5].items.map((item) => ({
      ...item,
      label: compositionOne[3]?.items[1]?.label ?? item.label,
    }));
  }
  if (compositionTwo[9]) {
    compositionTwo[9].items = compositionTwo[9].items.map((item) => ({
      ...item,
      label: compositionOne[4]?.items[2]?.label ?? item.label,
    }));
  }

  return [
    { id: "composition-one", clusters: compositionOne },
    { id: "composition-two", clusters: compositionTwo },
  ];
}

function getSceneScrollInterceptDamping(progress: number) {
  const stickyEntryProgress = 0.21;
  const firstSystemBuildEndProgress =
    stickyEntryProgress + (SCENE_PHASES.build.end / SCENE_PHASES.totalDuration - stickyEntryProgress) * 0.24;
  const buildPhaseProgress = SCENE_PHASES.build.end / SCENE_PHASES.totalDuration;

  if (progress < stickyEntryProgress || progress < firstSystemBuildEndProgress) {
    return 1;
  }

  return progress < buildPhaseProgress ? EARLY_SCENE_SCROLL_INTERCEPT_DAMPING : SCENE_SCROLL_INTERCEPT_DAMPING;
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useSceneDensity(): SceneDensity {
  const [density, setDensity] = useState<SceneDensity>(() => {
    if (typeof window === "undefined") {
      return "desktop";
    }

    if (window.innerWidth < 768) {
      return "mobile";
    }

    if (window.innerWidth < 1280) {
      return "tablet";
    }

    return "desktop";
  });

  useEffect(() => {
    const updateDensity = () => {
      if (window.innerWidth < 768) {
        setDensity("mobile");
        return;
      }

      if (window.innerWidth < 1280) {
        setDensity("tablet");
        return;
      }

      setDensity("desktop");
    };

    updateDensity();
    window.addEventListener("resize", updateDensity);

    return () => {
      window.removeEventListener("resize", updateDensity);
    };
  }, []);

  return density;
}

function useSmoothedSceneProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const rawProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const visualVelocityRef = useRef(0);
  const queuedScrollDeltaRef = useRef(0);
  const scrollVelocityPxRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const finalLockedRef = useRef(false);
  const [visualProgress, setVisualProgress] = useState(0);
  const [finalLocked, setFinalLocked] = useState(false);

  useEffect(() => {
    let frame = 0;
    let lastTimestamp: number | null = null;

    const updateRawProgress = () => {
      const element = ref.current;
      if (!element) {
        rawProgressRef.current = 0;
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollable = rect.height - viewportHeight;
      const entryLead = viewportHeight * 0.9;
      rawProgressRef.current = scrollable > 0 ? clamp((entryLead - rect.top) / (scrollable + entryLead)) : 0;
    };

    const isSceneActive = () => {
      const element = ref.current;
      if (!element || finalLockedRef.current) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return rect.top <= 0 && rect.bottom >= viewportHeight;
    };

    const queueSceneScroll = (deltaY: number) => {
      queuedScrollDeltaRef.current = clamp(
        queuedScrollDeltaRef.current + deltaY,
        -MAX_SCENE_SCROLL_QUEUE_PX,
        MAX_SCENE_SCROLL_QUEUE_PX,
      );
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      updateRawProgress();

      if (finalLockedRef.current) {
        visualProgressRef.current = 1;
        visualVelocityRef.current = 0;
        queuedScrollDeltaRef.current = 0;
        scrollVelocityPxRef.current = 0;
        setVisualProgress(1);
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = Math.max(0.001, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      if (isSceneActive()) {
        const queuedDelta = queuedScrollDeltaRef.current;
        const targetScrollVelocity =
          Math.sign(queuedDelta) *
          Math.min(MAX_SCENE_SCROLL_SPEED_PX, Math.abs(queuedDelta) * 2.4);
        const scrollVelocityDiff = targetScrollVelocity - scrollVelocityPxRef.current;
        const scrollAccelerationLimit =
          Math.sign(targetScrollVelocity) !== Math.sign(scrollVelocityPxRef.current) ||
          Math.abs(targetScrollVelocity) < Math.abs(scrollVelocityPxRef.current)
            ? MAX_SCENE_SCROLL_DECELERATION_PX
            : MAX_SCENE_SCROLL_ACCELERATION_PX;
        const maxScrollVelocityDelta = scrollAccelerationLimit * deltaSeconds;
        let nextScrollVelocity =
          scrollVelocityPxRef.current +
          clamp(scrollVelocityDiff, -maxScrollVelocityDelta, maxScrollVelocityDelta);

        if (Math.abs(queuedDelta) < 0.75 && Math.abs(nextScrollVelocity) < 18) {
          queuedScrollDeltaRef.current = 0;
          nextScrollVelocity = 0;
        } else {
          const intendedMove = nextScrollVelocity * deltaSeconds;
          const appliedMove =
            Math.sign(intendedMove) === Math.sign(queuedDelta) || queuedDelta === 0
              ? clamp(intendedMove, -Math.abs(queuedDelta), Math.abs(queuedDelta))
              : 0;

          if (appliedMove !== 0) {
            const maxScrollTop =
              document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollTop =
              window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const nextScrollTop = clamp(currentScrollTop + appliedMove, 0, maxScrollTop);
            const actualMove = nextScrollTop - currentScrollTop;

            if (actualMove !== 0) {
              window.scrollTo({ top: nextScrollTop, behavior: "auto" });
              queuedScrollDeltaRef.current -= actualMove;
            } else {
              queuedScrollDeltaRef.current = 0;
              nextScrollVelocity = 0;
            }
          }
        }

        scrollVelocityPxRef.current = nextScrollVelocity;
      } else {
        queuedScrollDeltaRef.current = 0;
        scrollVelocityPxRef.current = 0;
        touchYRef.current = null;
      }

      const raw = rawProgressRef.current;
      const current = visualProgressRef.current;
      const diff = raw - current;
      const targetVelocity = clamp(
        diff * VISUAL_PROGRESS_RESPONSE,
        -MAX_VISUAL_PROGRESS_SPEED,
        MAX_VISUAL_PROGRESS_SPEED,
      );
      const velocityDiff = targetVelocity - visualVelocityRef.current;
      const accelerationLimit =
        Math.sign(targetVelocity) !== Math.sign(visualVelocityRef.current) ||
        Math.abs(targetVelocity) < Math.abs(visualVelocityRef.current)
          ? MAX_VISUAL_PROGRESS_DECELERATION
          : MAX_VISUAL_PROGRESS_ACCELERATION;
      const maxVelocityDelta = accelerationLimit * deltaSeconds;
      let nextVelocity =
        visualVelocityRef.current + clamp(velocityDiff, -maxVelocityDelta, maxVelocityDelta);
      let next = current + nextVelocity * deltaSeconds;

      if ((diff > 0 && next > raw) || (diff < 0 && next < raw)) {
        next = raw;
        nextVelocity = 0;
      }

      if (Math.abs(diff) < 0.0006 && Math.abs(nextVelocity) < 0.002) {
        next = raw;
        nextVelocity = 0;
      }

      if (raw >= FINAL_SCENE_LOCK_RAW_PROGRESS && next >= FINAL_SCENE_LOCK_VISUAL_PROGRESS) {
        finalLockedRef.current = true;
        setFinalLocked(true);
        visualProgressRef.current = 1;
        visualVelocityRef.current = 0;
        setVisualProgress(1);
        frame = window.requestAnimationFrame(tick);
        return;
      }

      visualProgressRef.current = clamp(next);
      visualVelocityRef.current = nextVelocity;
      setVisualProgress((prev) => (Math.abs(prev - visualProgressRef.current) < 0.0005 ? prev : visualProgressRef.current));
      frame = window.requestAnimationFrame(tick);
    };

    const requestUpdate = () => updateRawProgress();
    const handleWheel = (event: WheelEvent) => {
      if (!isSceneActive()) {
        return;
      }

      event.preventDefault();
      queueSceneScroll(event.deltaY * getSceneScrollInterceptDamping(rawProgressRef.current));
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (!isSceneActive()) {
        touchYRef.current = null;
        return;
      }

      touchYRef.current = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (!isSceneActive()) {
        touchYRef.current = null;
        return;
      }

      const currentTouchY = event.touches[0]?.clientY;
      const previousTouchY = touchYRef.current;

      if (currentTouchY === undefined || previousTouchY === null) {
        return;
      }

      const deltaY = previousTouchY - currentTouchY;

      event.preventDefault();
      queueSceneScroll(deltaY * getSceneScrollInterceptDamping(rawProgressRef.current));
      touchYRef.current = currentTouchY;
    };
    const handleTouchEnd = () => {
      touchYRef.current = null;
    };

    updateRawProgress();
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return {
    ref,
    finalLocked,
    visualProgress,
  };
}

function getCompositionPresence(phases: ScenePhases, compositionIndex: number, elapsedMs: number) {
  const timingMap = [
    {
      inWindow: phases.chordOneIn,
      holdWindow: phases.chordOneHold,
      outWindow: phases.chordOneOut,
    },
    {
      inWindow: phases.chordTwoIn,
      holdWindow: phases.chordTwoHold,
      outWindow: phases.chordTwoOut,
    },
    {
      inWindow: phases.chordThreeIn,
      holdWindow: phases.chordThreeHold,
      outWindow: phases.chordThreeOut,
    },
  ] as const;
  const timing = timingMap[compositionIndex];
  const reveal = smoothstep(timing.inWindow.start, timing.inWindow.end, elapsedMs);
  const hold = elapsedMs >= timing.holdWindow.start && elapsedMs <= timing.holdWindow.end ? 1 : 0;
  const exit = smoothstep(timing.outWindow.start, timing.outWindow.end, elapsedMs);
  const presence = clamp(Math.max(reveal, hold) * (1 - exit));

  return {
    reveal,
    exit,
    presence,
  };
}

function StaffCtaOverlay({ elapsedMs }: { elapsedMs: number }) {
  const reveal = smoothstep(SCENE_PHASES.ctaIn.start, SCENE_PHASES.ctaIn.end, elapsedMs);
  const easedReveal = reveal * reveal * (3 - 2 * reveal);
  const ctas = [
    { to: "/festival", label: "О ФЕСТИВАЛЕ", top: "28%" },
    { to: "/afisha", label: "ПРОГРАММА / БИЛЕТЫ", top: "51%" },
  ] as const;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        opacity: easedReveal,
        filter: `blur(${(1 - easedReveal) * 9}px)`,
      }}
    >
      {ctas.map((cta, index) => (
        <div
          key={cta.to}
          className="absolute left-1/2 w-[calc(100%-2.5rem)] max-w-[34rem] px-5 sm:w-[min(76vw,40rem)] sm:px-0"
          style={{
            top: cta.top,
            opacity: clamp((reveal - index * 0.08) / (1 - index * 0.08)),
            transform: `translateX(-50%) translateY(${(1 - easedReveal) * (index === 0 ? 18 : 24)}px)`,
          }}
        >
          <Link
            to={cta.to}
            className="pointer-events-auto font-editorial-sans flex min-h-[92px] w-full items-center justify-center border border-black/12 bg-white/42 px-8 py-7 text-center text-[15px] uppercase tracking-[0.18em] text-black/50 backdrop-blur-[2px] transition-colors duration-300 ease-out hover:border-black/18 hover:text-black/62 sm:min-h-[108px] sm:px-12 sm:text-[19px] lg:text-[21px]"
            style={{ pointerEvents: reveal > 0.04 ? "auto" : "none" }}
          >
            {cta.label}
          </Link>
        </div>
      ))}
    </div>
  );
}

function StaffNotationScene({ names, sceneProgress, density }: StaffSceneProps & { density: SceneDensity }) {
  const reducedMotion = usePrefersReducedMotion();
  const nameCompositions = useMemo(() => buildNameCompositions(names, density), [density, names]);
  const isMobileDensity = density === "mobile";
  const isTabletDensity = density === "tablet";
  const elapsedMs = sceneProgress * SCENE_PHASES.totalDuration;
  const buildDuration = SCENE_PHASES.build.end - SCENE_PHASES.build.start;
  const buildProgress = smoothstep(SCENE_PHASES.build.start, SCENE_PHASES.build.end, elapsedMs);
  const splitProgress = smoothstep(
    SCENE_PHASES.build.start + buildDuration * 0.68,
    SCENE_PHASES.build.end,
    elapsedMs,
  );
  const settleProgress = smoothstep(SCENE_PHASES.build.end - 240, SCENE_PHASES.readyPause.end, elapsedMs);
  const primaryLineOffsets = [0, 2, 4] as const;
  const buildPassWindows = [
    { start: 0, end: 0.22 },
    { start: 0.24, end: 0.46 },
    { start: 0.48, end: 0.7 },
  ] as const;

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ opacity: elapsedMs >= SCENE_PHASES.silence.start ? 0 : 1 }}
      >
        {Array.from({ length: 3 }, (_, systemIndex) => {
          const baseY = STAFF_TOP + systemIndex * STAFF_SYSTEM_GAP;

          return (
            <g key={`staff-system-${systemIndex}`}>
              {Array.from({ length: STAFF_LINE_COUNT }, (_, lineIndex) => {
                const y = baseY + lineIndex * STAFF_BASE_LINE_STEP + staffBaseLineYOffset[lineIndex];

                return (
                  <line
                    key={`staff-system-${systemIndex}-base-${lineIndex}`}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke={`rgba(24,24,24,${staffBaseLineOpacity[lineIndex]})`}
                    strokeWidth="0.14"
                  />
                );
              })}

              {primaryLineOffsets.map((lineIndex, primaryIndex) => {
                const y = baseY + lineIndex * STAFF_BASE_LINE_STEP;
                const lineLag = primaryIndex * 0.05;
                const systemWindow = buildPassWindows[systemIndex];
                const systemProgress = smoothstep(systemWindow.start, systemWindow.end, buildProgress);
                const drawProgress = clamp((systemProgress - lineLag) / (1 - lineLag));
                const breath =
                  reducedMotion || elapsedMs < SCENE_PHASES.readyPause.start
                    ? 0
                    : Math.sin((elapsedMs / 1000) * 1.28 + systemIndex * 1.6 + lineIndex * 0.72) *
                      primaryLineBreathAmplitude[primaryIndex];
                const fadeLagMs = systemIndex * 55 + primaryIndex * 40;
                const lineFade = smoothstep(
                  SCENE_PHASES.staffFade.start + fadeLagMs,
                  SCENE_PHASES.staffFade.end + fadeLagMs,
                  elapsedMs,
                );
                const dashOpacity = drawProgress * (0.72 + breath) * (1 - lineFade);
                const origin = systemIndex === 1 ? "right center" : "left center";
                const settleShift =
                  (1 - settleProgress) * primaryLineSettleDirection[primaryIndex] * (systemIndex === 1 ? 0.92 : 1.06);
                const splitOffset = STAFF_BASE_LINE_STEP * primarySplitOffsetMultiplier[primaryIndex];
                const splitLag = systemIndex * 0.045 + primarySplitLagOffsets[primaryIndex];
                const splitReveal = clamp((splitProgress - splitLag) / (1 - splitLag));
                const splitY = y + splitOffset * splitReveal;
                const splitOpacity = dashOpacity * splitReveal * 0.92;
                const lineTrim = primaryLineLengthTrim[primaryIndex];
                const lineStart = lineTrim.start + systemIndex * 0.06;
                const lineEnd = 100 - lineTrim.end - systemIndex * 0.04;

                if (lineIndex === 2) {
                  return (
                    <line
                      key={`staff-system-${systemIndex}-primary-${lineIndex}`}
                      x1={lineStart}
                      y1={y}
                      x2={lineEnd}
                      y2={y}
                      stroke="rgba(18,18,18,0.74)"
                      strokeWidth="0.2"
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: origin,
                        transform: `translateY(${settleShift}px) scaleX(${drawProgress})`,
                        opacity: dashOpacity,
                      }}
                    />
                  );
                }

                return (
                  <g
                    key={`staff-system-${systemIndex}-primary-${lineIndex}`}
                  >
                    <line
                      x1={lineStart}
                      y1={y}
                      x2={lineEnd}
                      y2={y}
                      stroke="rgba(18,18,18,0.74)"
                      strokeWidth="0.18"
                      style={{
                        transformOrigin: origin,
                        transformBox: "fill-box",
                        transform: `translateY(${settleShift}px) scaleX(${drawProgress})`,
                        opacity: dashOpacity,
                      }}
                    />
                    <line
                      x1={lineStart}
                      y1={splitY}
                      x2={lineEnd}
                      y2={splitY}
                      stroke="rgba(18,18,18,0.74)"
                      strokeWidth="0.18"
                      style={{
                        transformOrigin: origin,
                        transformBox: "fill-box",
                        transform: `translateY(${settleShift}px) scaleX(${drawProgress})`,
                        opacity: splitOpacity,
                      }}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0" style={{ opacity: elapsedMs >= SCENE_PHASES.staffFade.end ? 0 : 1 }}>
        {nameCompositions.map((compositionLayer, layerIndex) => {
          const { reveal, exit, presence } = getCompositionPresence(SCENE_PHASES, layerIndex, elapsedMs);
          const layerBlur = (1 - reveal) * 10 + exit * 8;

          return (
            <div
              key={compositionLayer.id}
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: presence,
                filter: `blur(${layerBlur}px)`,
              }}
            >
              {compositionLayer.clusters.map((cluster, clusterIndex) => {
                const clusterDriftX =
                  reducedMotion || presence === 0
                    ? 0
                    : Math.sin((elapsedMs / 1000) * 0.52 + layerIndex * 1.2 + clusterIndex * 0.8) * 0.65;
                const clusterDriftY =
                  reducedMotion || presence === 0
                    ? 0
                    : Math.cos((elapsedMs / 1000) * 0.46 + layerIndex * 0.7 + clusterIndex * 0.65) * 0.38;
                const clusterSettleY = exit * 3.2;

                return (
                  <div
                    key={cluster.id}
                    className="absolute inset-0"
                    style={{
                      opacity: 1,
                      transform: `translate(${clusterDriftX}px, ${clusterDriftY + clusterSettleY}px)`,
                      transformOrigin: `${cluster.left}% ${getStaffSlotY(cluster.systemIndex, cluster.centerStep)}%`,
                    }}
                  >
                    {cluster.items.map((item, itemIndex) => {
                      const itemSlot = cluster.centerStep + item.stepOffset;
                      const lineAvoidanceOffset = getLineAvoidanceOffset(itemSlot, itemIndex, density);
                      const itemDriftX =
                        reducedMotion || presence === 0
                          ? 0
                          : Math.sin((elapsedMs / 1000) * 0.44 + clusterIndex + itemIndex * 0.45) * 0.18;
                      const itemDriftY =
                        reducedMotion || presence === 0
                          ? 0
                          : Math.cos((elapsedMs / 1000) * 0.4 + layerIndex + itemIndex * 0.5) * 0.12;

                      return (
                        <span
                          key={item.id}
                          className={[
                            "font-editorial-sans absolute uppercase text-black/70",
                            isMobileDensity
                              ? "text-[8px] leading-[1.38] tracking-[0.12em] whitespace-normal text-center"
                              : isTabletDensity
                                ? "text-[9px] leading-[1.42] tracking-[0.14em] whitespace-normal text-center"
                                : "whitespace-nowrap text-[10px] leading-[1.5] tracking-[0.18em] sm:text-[11px] sm:tracking-[0.2em]",
                          ].join(" ")}
                          style={{
                            left: `${cluster.left + item.dx}%`,
                            top: `${getStaffSlotY(cluster.systemIndex, itemSlot)}%`,
                            transform: `translate(${itemDriftX + item.xNudge}px, ${itemDriftY + item.yNudge + lineAvoidanceOffset}px) translate(-50%, -50%) rotate(${item.rotation}deg)`,
                            maxWidth: isMobileDensity ? "24vw" : isTabletDensity ? "18vw" : undefined,
                            overflowWrap: isMobileDensity || isTabletDensity ? "anywhere" : undefined,
                          }}
                        >
                          {item.label}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <StaffCtaOverlay elapsedMs={elapsedMs} />
    </div>
  );
}

function FestivalStaffScrollScene() {
  const density = useSceneDensity();
  const names = useMemo(() => getNamesForDensity(buildNamePool(), density), [density]);
  const { ref, finalLocked, visualProgress } = useSmoothedSceneProgress<HTMLDivElement>();

  return (
    <section ref={ref} className={finalLocked ? "relative h-screen" : SCENE_SCROLL_HEIGHT_CLASS}>
      <div className="sticky top-0 h-screen">
        <StaffNotationScene names={names} sceneProgress={visualProgress} density={density} />
      </div>
    </section>
  );
}

export function FestivalStaffSceneSection() {
  return (
    <div className="-mt-4 bg-[var(--color-bg)] text-neutral-950 sm:-mt-5 lg:-mt-6">
      <FestivalStaffScrollScene />
    </div>
  );
}

export function FestivalLabPage() {
  const density = useSceneDensity();
  const names = useMemo(() => getNamesForDensity(buildNamePool(), density), [density]);

  return (
    <div className="bg-[var(--color-bg)] pt-28 text-neutral-950">
      <PageContainer>
        <div className="max-w-3xl pb-14 pt-24">
          <p className="font-editorial-sans text-[12px] uppercase tracking-[0.14em] text-neutral-500">Festival Lab / Probe Variant</p>
          <h1 className="mt-5 font-editorial-serif text-[3rem] font-normal leading-none text-neutral-950 sm:text-[3.4rem]">
            Нотный стан как сцена
          </h1>
          <p className="mt-7 max-w-2xl font-editorial-serif text-[20px] leading-8 text-neutral-600">
            Пробный вариант: скролл только запускает сцену, а дальше стан, паузы, аккорды, тишина и CTA проигрываются в фиксированном
            внутреннем темпе.
          </p>
          <p className="mt-5 font-editorial-sans text-[12px] uppercase tracking-[0.14em] text-neutral-400">
            В сцене: {names.length} участников
          </p>
        </div>
      </PageContainer>

      <FestivalStaffScrollScene />
    </div>
  );
}
