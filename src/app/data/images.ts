import ileThelemeLogoBlack from "../../../Ile_theleme_logo_black.png";
import gnessinLogo from "../../../Gnessinlogo.png";

const participantImageModules = import.meta.glob("../../assets/participants/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const participantImagesByFileName = Object.fromEntries(
  Object.entries(participantImageModules).map(([filePath, imageUrl]) => [filePath.split("/").pop() ?? "", imageUrl]),
);

export function getParticipantImage(fileName: string) {
  return participantImagesByFileName[fileName] ?? "";
}

const aleksandrChaikovskyImage = getParticipantImage("2401_aleksandr-chajk.jpg");
const akhunovImage = getParticipantImage("Akhunov.jpeg");
const alisaTenImage = getParticipantImage("Alisaten.jpg");
const desyatnikovImage = getParticipantImage("desyatnikov2.jpg");
const juliaIgoninaImage = getParticipantImage("JuliaIgonina.jpg");
const karmanovImage = getParticipantImage("Karmanov.webp");
const martynovImage = getParticipantImage("martynov.jpg");
const nataliMuradymovaImage = getParticipantImage("NataliMuradymova.jpg");
const peletsisImage = getParticipantImage("peletsis.png");
const sergPoltavskiyImage = getParticipantImage("SergPoltavskiy.jpg");
const tursunovImage = getParticipantImage("tursunov.jpg");

export const localImages = {
  ileThelemeLogoBlack,
  gnessinLogo,
  aleksandrChaikovskyImage,
  akhunovImage,
  alisaTenImage,
  desyatnikovImage,
  juliaIgoninaImage,
  karmanovImage,
  martynovImage,
  nataliMuradymovaImage,
  peletsisImage,
  sergPoltavskiyImage,
  tursunovImage,
};
