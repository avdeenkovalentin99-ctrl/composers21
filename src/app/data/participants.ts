import { composers } from "./composers";
import { generatedEnsembleSlugs } from "./participants.generated";
import { performers } from "./performers";
import type { PersonItem } from "./types";

const legacyEnsembleSlugs = new Set([
  "2k7b12lg01-solisti-nizhnego-novgoroda",
  "opensoundorchestra",
  "185385o731-brezel-ensemble",
  "bcix09uev1-ansambl-classica-plus",
  "kvartet_glinki",
  "2ci5ibo0z1-horovoi-ansambl-melodiya",
  "jsspbiezo1-le-thlme-ensemble",
]);

const ensembleSlugs = new Set([...legacyEnsembleSlugs, ...generatedEnsembleSlugs]);

export function isEnsemble(person: PersonItem) {
  return ensembleSlugs.has(person.slug);
}

export function getPersonSlug(person: PersonItem) {
  return person.slug;
}

export function findComposerBySlug(slug: string) {
  return composers.find((person) => getPersonSlug(person) === slug) ?? null;
}

export const soloists = performers.filter((person) => !isEnsemble(person));
export const ensembles = performers.filter((person) => isEnsemble(person));

export function findSoloistBySlug(slug: string) {
  return soloists.find((person) => getPersonSlug(person) === slug) ?? null;
}

export function findEnsembleBySlug(slug: string) {
  return ensembles.find((person) => getPersonSlug(person) === slug) ?? null;
}
