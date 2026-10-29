import { composers } from "./composers";
import { concerts } from "./concerts";
import { performers } from "./performers";

export const featuredConcerts = concerts.slice(0, 4);
export const featuredParticipants = [...performers.slice(0, 3), ...composers.slice(0, 3)];
