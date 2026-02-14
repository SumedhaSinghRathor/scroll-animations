import { useRef } from "react";
import "./Shuffle.css";
import { gsap, ScrollTrigger } from "gsap/all";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";
import set1 from "./set1/set1";
import set2 from "./set2/set2";
import set3 from "./set3/set3";

gsap.registerPlugin(ScrollTrigger);
function Shuffle() {
  const imageSets = [set1, set2, set3];

  const gallery = useRef();
  const galleryHeading = useRef();

  useGSAP(() => {
    if (!gallery.current) return;

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const CONFIG = {
      cardCount: 10,
      cardWidth: 200,
      cardHeight: 300,
      animationDuration: 0.75,
      animationOverlap: 0.5,
      headingFadeDuration: 0.5,
      headings: ["Hana to Yume", "LaLa", "Melody"],
    };

    let viewport = {
      centerX: window.innerWidth / 2,
      centerY: window.innerHeight / 2,
      rangeMin: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      rangeMax: Math.min(window.innerWidth, window.innerHeight) * 0.7,
    };

    let state = {
      activeCards: [],
      currentSection: 0,
      isAnimating: false,
    };

    function updateViewport() {
      viewport.centerX = window.innerWidth / 2;
      viewport.centerY = window.innerHeight / 2;
      viewport.rangeMin =
        Math.min(window.innerWidth, window.innerHeight) * 0.35;
      viewport.rangeMax = Math.min(window.innerWidth, window.innerHeight) * 0.7;
    }

    function getEdgePosition(centerX, centerY) {
      const distances = {
        left: centerX,
        right: window.innerWidth - centerX,
        top: centerY,
        bottom: window.innerHeight - centerY,
      };

      const minDistance = Math.min(...Object.values(distances));
      const cardCenterOffsetX = CONFIG.cardWidth / 2;
      const cardCenterOffsetY = CONFIG.cardHeight / 2;
      const offsetVariation = () => (Math.random() - 0.5) * 400;

      if (minDistance === distances.left) {
        return {
          x: -300 - Math.random() * 200,
          y: centerY - cardCenterOffsetY + offsetVariation(),
        };
      }
      if (minDistance === distances.right) {
        return {
          x: window.innerWidth + 50 + Math.random() * 200,
          y: centerY - cardCenterOffsetY + offsetVariation(),
        };
      }
      if (minDistance === distances.top) {
        return {
          x: centerX - cardCenterOffsetX + offsetVariation(),
          y: -400 - Math.random() * 200,
        };
      }
      return {
        x: centerX - cardCenterOffsetX + offsetVariation(),
        y: window.innerHeight + 50 + Math.random() * 200,
      };
    }

    function createCards(setNumber) {
      const cards = [];
      const images = imageSets[setNumber - 1];
      if (!images) return cards;

      for (let i = 0; i < CONFIG.cardCount; i++) {
        if (!images[i]) continue;

        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = images[i];
        card.appendChild(img);

        const angle = Math.random() * Math.PI * 2;
        const radius =
          viewport.rangeMin +
          Math.random() * (viewport.rangeMax - viewport.rangeMin);

        const centerX = viewport.centerX + Math.cos(angle) * radius;
        const centerY = viewport.centerY + Math.sin(angle) * radius;

        gsap.set(card, {
          position: "absolute",
          left: centerX - CONFIG.cardWidth / 2,
          top: centerY - CONFIG.cardHeight / 2,
          rotation: Math.random() * 50 - 25,
          force3D: true,
        });

        gallery.current.appendChild(card);

        cards.push({ element: card, centerX, centerY });
      }

      return cards;
    }

    function animateHeading(newText) {
      return gsap
        .timeline()
        .to(galleryHeading.current, {
          opacity: 0,
          duration: CONFIG.headingFadeDuration,
          ease: "power2.inOut",
        })
        .call(() => {
          galleryHeading.current.textContent = newText;
        })
        .to(galleryHeading.current, {
          opacity: 1,
          duration: CONFIG.headingFadeDuration,
          ease: "power2.inOut",
        });
    }

    function animateCards(exitingCards, enteringCards) {
      const tl = gsap.timeline();

      exitingCards.forEach(({ element, centerX, centerY }) => {
        const targetEdge = getEdgePosition(centerX, centerY);

        tl.to(
          element,
          {
            left: targetEdge.x,
            top: targetEdge.y,
            rotation: Math.random() * 180 - 90,
            duration: CONFIG.animationDuration,
            ease: "power2.in",
            onComplete: () => element.remove(),
          },
          0,
        );
      });

      enteringCards.forEach(({ element, centerX, centerY }) => {
        const targetEdge = getEdgePosition(centerX, centerY);
        gsap.set(element, {
          left: targetEdge.x,
          top: targetEdge.y,
          rotation: Math.random() * 180 - 90,
        });

        tl.to(
          element,
          {
            left: centerX - CONFIG.cardWidth / 2,
            top: centerY - CONFIG.cardHeight / 2,
            rotation: Math.random() * 50 - 25,
            duration: CONFIG.animationDuration,
            ease: "power2.out",
          },
          CONFIG.animationOverlap,
        );
      });

      return tl;
    }

    function getSelectionIndex(progress) {
      const totalSections = CONFIG.headings.length;
      return Math.min(totalSections - 1, Math.floor(progress * totalSections));
    }

    function reinitialize() {
      gallery.current.innerHTML = "";
      state.activeCards.forEach(({ element }) => element.remove());
      updateViewport();
      state.activeCards = createCards(state.currentSection + 1);
    }

    state.activeCards = createCards(1);
    galleryHeading.current.textContent = CONFIG.headings[0];
    gsap.set(galleryHeading.current, { opacity: 1 });

    ScrollTrigger.create({
      trigger: gallery.current,
      start: "top top",
      end: () => `+=${window.innerHeight * 6}`,
      pin: true,
      pinSpacing: true,
      onUpdate: ({ progress }) => {
        if (state.isAnimating) return;

        const targetSection = getSelectionIndex(progress);
        if (targetSection === state.currentSection) return;

        state.isAnimating = true;
        const newCards = createCards(targetSection + 1);

        const cardsTL = animateCards(state.activeCards, newCards);
        const headingTL = animateHeading(CONFIG.headings[targetSection]);

        gsap
          .timeline()
          .add(cardsTL)
          .add(headingTL, 0)
          .eventCallback("onComplete", () => {
            state.activeCards = newCards;
            state.currentSection = targetSection;
            state.isAnimating = false;
          });
      },
    });

    window.addEventListener("resize", () => {
      reinitialize();
      ScrollTrigger.refresh();
    });
  }, []);

  return (
    <div className="background-shuffle">
      <section className="intro">
        <h1>Time loosens its grip and the stack begins to shift</h1>
      </section>
      <section ref={gallery} className="gallery">
        <h1 ref={galleryHeading}></h1>
      </section>
      <section className="outro">
        <h1>Eventually, the stack settles and the scroll continues</h1>
      </section>
    </div>
  );
}

export default Shuffle;
