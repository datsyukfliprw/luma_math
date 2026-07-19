// NOTE: This file now only contains utility functions.
// The main star profile logic has been migrated to StudentProgressContext.

const RANDOM_STAR_NAMES = [
  "Nova",
  "Comet",
  "Spark",
  "Orbit",
  "Glimmer",
  "Pip",
  "Beam",
  "Cosmo",
  "Sunny",
  "Astro",
  "Glow",
  "Nimbus",
];

export function getRandomStarName() {
  const index = Math.floor(Math.random() * RANDOM_STAR_NAMES.length);
  return RANDOM_STAR_NAMES[index];
}
