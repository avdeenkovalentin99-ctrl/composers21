import { optimizedImages } from "./optimizedImages.generated";

const ileThelemeLogoBlack = optimizedImages["brand/ile-theleme"].src;
const gnessinLogo = optimizedImages["brand/gnessin"].src;
const tarusaLogo = optimizedImages["brand/tarusa"].src;

export function getParticipantImage(fileName: string) {
  return optimizedImages["participants/" + fileName]?.src ?? "";
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
  tarusaLogo,
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
