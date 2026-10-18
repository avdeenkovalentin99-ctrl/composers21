import { VideoHomeHero } from "./VideoHomeHero";
import "./MobileHomeHero.css";

export function MobileHomeHero() {
  return (
    <section id="home-old-hero" className="mobile-festival-hero" aria-labelledby="mobile-festival-hero-title">
      <h1 id="mobile-festival-hero-title" className="sr-only">Фестиваль современной музыки «Композиторы XXI века»</h1>
      <VideoHomeHero />
      <div className="mobile-festival-hero__stage">
        {/* Outlined lettering preserves the reference's proportions and overlaps at every width. */}
        <svg className="mobile-festival-hero__lettering" viewBox="0 0 941 1672" fill="none" aria-hidden="true" focusable="false">
          <g fill="#690e28">
            <path d="M178 94H269V381H178Z" />
            <path d="M531 789H588V920H531Z" />
          </g>
          <g stroke="#98213c" strokeWidth="1.5">
            <path d="M464 244L563 106" />
            <path d="M140 1172L295 971" />
          </g>
          <g fill="#f8f8f6">
            {/* К О М */}
            <path d="M110 144H127V390H110Z M125 264L265 144H270L139 258L272 390H254L125 266Z" />
            <path fillRule="evenodd" d="M343 165C407 165 459 214 459 277C459 341 407 392 343 392C278 392 227 342 227 279C227 215 278 165 343 165ZM343 168C287 168 248 215 248 279C248 342 287 389 343 389C399 389 438 342 438 277C438 214 399 168 343 168Z" />
            <path d="M468 271H474L533 407L604 281V450H588V312L532 428L473 291V450H468Z" />
            {/* П О */}
            <path d="M213 405L365 403V633H348V407L230 409V631H213Z" />
            <path fillRule="evenodd" d="M474 449C535 449 584 494 584 550C584 609 536 654 474 654C413 654 365 609 365 552C365 494 413 449 474 449ZM474 452C422 452 385 494 385 552C385 609 422 651 474 651C526 651 563 609 563 550C563 494 526 452 474 452Z" />
            {/* З И */}
            <path d="M299 679C320 655 345 645 374 645C412 645 441 667 441 694C441 716 420 734 390 738C424 742 448 759 448 789C448 822 418 847 377 847C343 847 315 834 298 816L302 812C321 832 346 844 377 844C410 844 430 821 430 789C430 757 406 741 371 740H349V736H371C404 736 421 718 421 694C421 666 402 648 374 648C347 648 323 661 305 684Z" />
            <path d="M464 666H481V831L648 671V906H631V686L470 847H464Z" />
            {/* Т О */}
            <path d="M236 858H402V862H322V1077H305V862H236Z" />
            <path fillRule="evenodd" d="M466 853C533 853 586 901 586 964C586 1028 533 1076 466 1076C398 1076 346 1028 346 964C346 901 398 853 466 853ZM466 856C408 856 368 902 368 964C368 1028 408 1073 466 1073C524 1073 564 1028 564 964C564 902 524 856 466 856Z" />
            {/* Р Ы */}
            <path fillRule="evenodd" d="M344 1078H411C476 1078 511 1101 511 1138C511 1176 476 1197 411 1197H361V1301H344ZM361 1081V1194H411C464 1194 490 1175 490 1138C490 1102 464 1081 411 1081Z" />
            <path fillRule="evenodd" d="M526 1078H543V1144H578C642 1144 679 1167 679 1206C679 1247 642 1271 578 1271H526ZM543 1147V1268H578C631 1268 659 1247 659 1206C659 1167 631 1147 578 1147Z" />
            <path d="M688 1078H705V1271H688Z" />
          </g>
        </svg>
        <p className="mobile-festival-hero__status">Фестиваль<br />состоялся</p>
        <p className="mobile-festival-hero__century" aria-hidden="true">XXI века</p>
      </div>
      <div className="mobile-festival-hero__footer">
        <p className="mobile-festival-hero__metadata">
          <span>10–31 мая 2026</span><span>Москва</span><span>Галерея НИКО</span><span>15 концертов</span>
        </p>
      </div>
    </section>
  );
}
