import {C,path,ellipse,group,sunflower,meiHead,documentSVG} from '../svg-kit/index.mjs';

// Hand-authored story construction from the canonical Joy visual brief.
export function renderJoy(){
const layers=[
`<rect width="960" height="640" fill="${C.paper}"/>`,
path("M0 452 Q163 414 299 455 Q467 423 616 452 Q796 428 960 448 L960 640 L0 640Z",C.paperLight,"none",0),
path("M54 506 Q198 498 313 507 M514 510 Q739 498 911 511","none","#DDDAC9",3.4),
ellipse(369,563,267,25,"#CFCFC0","none",0,{opacity:".37"}),
ellipse(707,569,133,16,"#CFCFC0","none",0,{opacity:".42"}),
path("M100 447 Q123 421 141 446 M160 455 Q181 422 198 447 M838 452 Q851 429 869 451 M885 449 Q897 421 916 446","none",C.sage,7.5,{opacity:".57"}),
path("M146 446 Q152 415 171 398 M835 450 Q824 418 812 412","none",C.sageDark,2.4,{opacity:".65"}),
sunflower({x:714,y:238,scale:1.03}),
path("M653 492 Q718 471 775 490 L758 562 Q718 583 664 564 Z",C.pot,C.graphite,3.7),
ellipse(714,489,69,16,"#9D7158",C.graphite,3.1),
path("M646 488 Q712 471 780 489 L778 503 Q718 518 650 503Z",C.terracotta,C.graphite,3),
path("M667 533 Q714 548 753 531 M672 548 Q702 558 725 551","none",C.potDark,2.3),
path("M671 502 Q676 511 683 509 M751 509 Q759 503 762 497","none","#E6B395",2),
path("M786 537 Q795 514 829 519 Q851 539 840 567 Q813 578 790 560Z",C.slate,C.graphite,3.2),
path("M839 535 Q871 517 876 507 Q883 500 890 514 Q870 543 842 547","none",C.slateShadow,6),
path("M800 530 Q799 511 814 502 Q828 500 834 516","none",C.graphite,3.5),
path("M806 529 Q820 519 831 528","none","#C8D2CF",2.2),
path("M210 526 Q232 516 279 525 Q307 546 281 559 Q238 572 205 553Z",C.cream,C.graphite,3.6),
path("M355 544 Q382 528 433 537 Q474 542 470 561 Q437 578 389 567 L350 561Z",C.cream,C.graphite,3.6),
path("M229 548 Q263 559 290 550 M376 558 Q426 565 456 556","none",C.skinShade,2.5),
path("M250 524 L280 537 M261 520 L293 532 M392 540 L423 546 M389 550 L427 554","none","#8B9794",2.6),
path("M272 437 Q207 454 213 511 Q230 547 309 538 L380 514 Q385 546 412 551 Q478 551 481 502 Q466 459 405 438Z",C.slate,C.graphite,4.5),
path("M260 483 Q274 502 315 500 M348 518 Q366 500 384 488 M423 471 Q455 488 450 516","none",C.slateShadow,3.2),
path("M258 501 Q272 518 287 524 M427 532 Q446 530 454 517","none","#9CB1B5",2.7),
path("M295 343 Q333 323 393 339 Q436 345 472 378 Q494 430 470 481 Q379 499 278 464 Q259 399 295 343Z",C.mustard,C.graphite,4.3),
path("M279 457 Q360 480 474 470 L474 489 Q371 512 278 477Z","#C39A4F",C.graphite,3.2),
path("M319 358 Q340 375 382 372 Q406 364 411 351","none","#EED391",4.1),
path("M315 373 Q341 389 371 382 M281 446 Q308 460 344 463 M407 462 Q436 461 462 453","none","#F0CC77",3.1),
path("M282 380 Q256 391 246 427 Q240 450 252 468 Q266 470 279 449 Q295 426 310 418Z",C.mustard,C.graphite,3.5),
path("M251 460 Q237 469 238 485 Q248 493 257 482 Q261 498 271 488 Q277 495 286 482 L289 462",C.skin,C.graphite,3.1),
path("M437 373 Q461 365 483 380 L536 389 Q561 394 566 382 Q577 373 582 385 Q585 397 572 406 Q583 408 581 418 Q577 429 563 426 Q549 429 533 417 L487 410 Q458 422 446 408Z",C.mustard,C.graphite,3.8),
path("M533 389 Q548 391 553 389 M556 415 Q565 412 572 408","none",C.skinShade,2.8),
path("M534 389 Q553 375 569 380 Q581 389 573 400 Q558 411 542 408Z",C.skin,C.graphite,3),
path("M464 377 Q462 398 471 412 M447 388 Q453 398 465 397","none","#F0D88F",2.5),
path("M345 327 Q348 344 346 360 Q364 378 395 353 L391 327",C.skin,C.graphite,3.1),
meiHead({x:262,y:144,scale:1,emotion:"joy"}),
path("M324 421 l17 9 M346 434 l13 8 M394 447 l23 3 M299 453 l12 7","none","#EACB81",2.2,{opacity:".84"}),
path("M230 492 l8 9 M238 501 l8 7 M402 508 l18 8","none","#8DA1AB",1.8,{opacity:".65"}),
path("M584 513 Q578 491 560 480 M586 514 Q598 488 618 479","none",C.sageDark,2.8),
path("M558 483 Q557 466 542 468 Q542 483 558 483Z M617 481 Q627 467 641 467 Q640 483 617 481Z",C.sage,C.sageDark,2)
];
return documentSVG(layers.join(""),"Joy — Mei discovers her sunflower's first bloom","Mei in a mustard sweater smiles at the first yellow flower on a sunflower she planted, with a watering can and clay pot nearby.");
}
