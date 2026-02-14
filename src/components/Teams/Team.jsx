import { useRef } from "react";
import henry from "./assets/henry vi.jpg";
import richard from "./assets/richard.jpg";
import buckingham from "./assets/buckingham.jpg";
import "./Team.css";
import { gsap, ScrollTrigger } from "gsap/all";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";

function Team() {
  gsap.registerPlugin(ScrollTrigger);

  const teamSection = useRef();
  const teamMembers = useRef([]);
  const teamMemberCards = useRef([]);

  useGSAP(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    let cardPlaceholderEntrance = null;
    let cardSlideInAnimation = null;

    function initTeamAnimations() {
      if (window.innerWidth < 1000) {
        if (cardPlaceholderEntrance) cardPlaceholderEntrance.kill();
        if (cardSlideInAnimation) cardSlideInAnimation.kill();

        teamMembers.current.forEach((member) => {
          gsap.set(member, { clearProps: "all" });
          const teamMemberInitial = member.querySelector(
            ".team-member-name-initial h1",
          );
          gsap.set(teamMemberInitial, { clearProps: "all" });
        });

        teamMemberCards.current.forEach((card) => {
          gsap.set(card, { clearProps: "all" });
        });

        return;
      }

      if (cardPlaceholderEntrance) cardPlaceholderEntrance.kill();
      if (cardSlideInAnimation) cardSlideInAnimation.kill();

      cardPlaceholderEntrance = ScrollTrigger.create({
        trigger: teamSection.current,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          teamMembers.current.forEach((member, index) => {
            const entranceDelay = 0.15;
            const entranceDuration = 0.7;
            const entranceStart = index * entranceDelay;
            const entranceEnd = entranceStart + entranceDuration;

            if (progress >= entranceStart && progress <= entranceEnd) {
              const memberEntranceProgress =
                (progress - entranceStart) / entranceDuration;

              const entranceY = 125 - memberEntranceProgress * 125;
              gsap.set(member, { y: `${entranceY}%` });

              const teamMemberInitial = member.querySelector(
                ".team-member-name-initial h1",
              );
              const initialLetterScaleDelay = 0.4;
              const initialLetterScaleProgress = Math.max(
                0,
                (memberEntranceProgress - initialLetterScaleDelay) /
                  (1 - initialLetterScaleDelay),
              );
              gsap.set(teamMemberInitial, {
                scale: initialLetterScaleProgress,
              });
            } else if (progress > entranceEnd) {
              gsap.set(member, { y: "0%" });
              const teamMemberInitial = member.querySelector(
                ".team-member-name-initial h1",
              );
              gsap.set(teamMemberInitial, { scale: 1 });
            }
          });
        },
      });

      cardSlideInAnimation = ScrollTrigger.create({
        trigger: teamSection.current,
        start: "top top",
        end: `+=${window.innerHeight * 3}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          teamMemberCards.current.forEach((card, index) => {
            const slideInStagger = 0.075;
            const xRotationDuration = 0.4;
            const xRotationStart = index * slideInStagger;
            const xRotationEnd = xRotationStart + xRotationDuration;

            if (progress >= xRotationStart && progress <= xRotationEnd) {
              const cardProgress =
                (progress - xRotationStart) / xRotationDuration;

              const cardInitialX = 300 - index * 100;
              const cardTargetX = -50;
              const cardSlideInX =
                cardInitialX + cardProgress * (cardTargetX - cardInitialX);

              const cardSlideInRotation = 20 - cardProgress * 20;

              gsap.set(card, {
                x: `${cardSlideInX}%`,
                rotation: cardSlideInRotation,
              });
            } else if (progress > xRotationEnd) {
              gsap.set(card, {
                x: "-50%",
                rotation: 0,
              });
            }

            const cardScaleStagger = 0.12;
            const cardScaleStart = 0.4 + index * cardScaleStagger;
            const cardScaleEnd = 1;

            if (progress >= cardScaleStart && progress <= cardScaleEnd) {
              const scaleProgress =
                (progress - cardScaleStart) / (cardScaleEnd - cardScaleStart);

              const scaleValue = 0.75 + scaleProgress * 0.25;

              gsap.set(card, {
                scale: scaleValue,
              });
            } else if (progress > cardScaleEnd) {
              gsap.set(card, { scale: 1 });
            }
          });
        },
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initTeamAnimations();
        ScrollTrigger.refresh();
      }, 250);
    });

    initTeamAnimations();

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  });

  return (
    <div className="background-team">
      <section className="hero">
        <h1>Faces Behind the Frame</h1>
      </section>
      <section ref={teamSection} className="team">
        <div
          ref={(el) => (teamMembers.current[0] = el)}
          className="team-member"
        >
          <div className="team-member-name-initial">
            <h1>H</h1>
          </div>
          <div
            ref={(el) => (teamMemberCards.current[0] = el)}
            className="team-member-card"
          >
            <div className="team-member-img">
              <img src={henry} alt="" />
            </div>
            <div className="team-member-info">
              <p>( King of England )</p>
              <h1>
                Henry <br /> <span>VI</span>
              </h1>
            </div>
          </div>
        </div>

        <div
          ref={(el) => (teamMembers.current[1] = el)}
          className="team-member"
        >
          <div className="team-member-name-initial">
            <h1>R</h1>
          </div>
          <div
            ref={(el) => (teamMemberCards.current[1] = el)}
            className="team-member-card"
          >
            <div className="team-member-img">
              <img src={richard} alt="" />
            </div>
            <div className="team-member-info">
              <p>( Duke of Gloucester )</p>
              <h1>
                Richard <span>III</span>
              </h1>
            </div>
          </div>
        </div>

        <div
          ref={(el) => (teamMembers.current[2] = el)}
          className="team-member"
        >
          <div className="team-member-name-initial">
            <h1>B</h1>
          </div>
          <div
            ref={(el) => (teamMemberCards.current[2] = el)}
            className="team-member-card"
          >
            <div className="team-member-img">
              <img src={buckingham} alt="" />
            </div>
            <div className="team-member-info">
              <p>( Duke of Buckingham )</p>
              <h1>
                Henry <span>Stafford</span>
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section className="outro">
        <h1>Where Vision Becomes Work</h1>
      </section>
    </div>
  );
}

export default Team;
