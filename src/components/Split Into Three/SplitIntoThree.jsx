import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./SplitIntoThree.css";
import img1 from "./img1.png";
import img2 from "./img2.png";
import img3 from "./img3.png";
import { gsap, ScrollTrigger } from "gsap/all";
import Lenis from "lenis";

function SplitIntoThree() {
  gsap.registerPlugin(ScrollTrigger);

  const cardContainer = useRef();
  const stickyHeader = useRef();

  useGSAP(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    let isGapAnimationCompleted = false;
    let isFlipAnimationCompleted = false;

    function initAnimations() {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      const mm = gsap.matchMedia();
      mm.add("(max-width: 999px)", () => {
        document
          .querySelectorAll(".card, .card-container, .sticky-header h1")
          .forEach((el) => (el.style = ""));
        return {};
      });

      mm.add("(min-width: 1000px)", () => {
        ScrollTrigger.create({
          trigger: ".sticky",
          start: "top top",
          end: `+=${window.innerHeight * 4}px`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            if (progress >= 0.1 && progress <= 0.25) {
              const headerProgress = gsap.utils.mapRange(
                0.1,
                0.25,
                0,
                1,
                progress,
              );

              const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
              const opacityValue = gsap.utils.mapRange(
                0,
                1,
                0,
                1,
                headerProgress,
              );

              gsap.set(stickyHeader.current, {
                y: yValue,
                opacity: opacityValue,
              });
            } else if (progress < 0.1) {
              gsap.set(stickyHeader.current, { y: 40, opacity: 0 });
            } else if (progress > 0.25) {
              gsap.set(stickyHeader.current, { y: 0, opacity: 1 });
            }

            if (progress <= 0.25) {
              const widthPercentage = gsap.utils.mapRange(
                0,
                0.25,
                75,
                60,
                progress,
              );
              gsap.set(cardContainer.current, { width: `${widthPercentage}%` });
            } else {
              gsap.set(cardContainer.current, { width: "60%" });
            }

            if (progress >= 0.35 && !isGapAnimationCompleted) {
              gsap.to(cardContainer.current, {
                gap: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(["#card-1", "#card-2", "#card-3"], {
                borderRadius: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              isGapAnimationCompleted = true;
            } else if (progress < 0.35 && isGapAnimationCompleted) {
              gsap.to(cardContainer.current, {
                gap: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to("#card-1", {
                borderRadius: "20px 0 0 20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to("#card-2", {
                borderRadius: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to("#card-3", {
                borderRadius: "0 20px 20px 0 ",
                duration: 0.5,
                ease: "power3.out",
              });

              isGapAnimationCompleted = false;
            }

            if (progress >= 0.7 && !isFlipAnimationCompleted) {
              gsap.to(".card", {
                rotationY: 180,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: 0.1,
              });

              gsap.to(["#card-1", "#card-3"], {
                y: 30,
                rotationZ: (i) => [-15, 15][i],
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted = true;
            } else if (progress < 0.7 && isFlipAnimationCompleted) {
              gsap.to(".card", {
                rotationY: 0,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: -0.1,
              });

              gsap.to(["#card-1", "#card-3"], {
                y: 0,
                rotationZ: 0,
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted = false;
            }
          },
        });
      });
    }

    initAnimations();

    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initAnimations();
      }, 250);
    });
  });

  return (
    <div className="background-split">
      <section className="intro">
        <h1>Every idea begins as a single image</h1>
      </section>
      <section className="sticky">
        <div className="sticky-header">
          <h1 ref={stickyHeader}>Three pillars with one purpose</h1>
        </div>

        <div ref={cardContainer} className="card-container">
          <div className="card" id="card-1">
            <div className="card-front">
              <img src={img1} alt="img1" />
            </div>
            <div className="card-back">
              <span>( 01 )</span>
              <p>Shoujo</p>
            </div>
          </div>
          <div className="card" id="card-2">
            <div className="card-front">
              <img src={img2} alt="img2" />
            </div>
            <div className="card-back">
              <span>( 02 )</span>
              <p>Josei</p>
            </div>
          </div>
          <div className="card" id="card-3">
            <div className="card-front">
              <img src={img3} alt="img3" />
            </div>
            <div className="card-back">
              <span>( 03 )</span>
              <p>Girls' Love</p>
            </div>
          </div>
        </div>
      </section>
      <section className="outro">
        <h1>Every transition leaves a trace</h1>
      </section>
    </div>
  );
}

export default SplitIntoThree;
