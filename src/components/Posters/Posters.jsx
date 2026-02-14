import { gsap, CustomEase } from "gsap/all";
import "./Posters.css";
import { items, images } from "./items.js";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

function Posters() {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  const container = useRef();
  const canvas = useRef();
  const overlay = useRef();
  const projectTitleElement = useRef();

  useGSAP(
    () => {
      const itemGap = 150;
      const itemWidth = 120;
      const itemHeight = 180;

      let isDragging = false;
      let startX, startY;
      let currentX = 0,
        currentY = 0;
      let targetX = currentX,
        targetY = currentY;
      let dragVelocityX = 0,
        dragVelocityY = 0;
      let lastDragTime = 0;
      let mouseHasMoved = false;
      let visibleItems = new Set();
      let lastUpdateTime = 0;
      let lastX = 0,
        lastY = 0;
      let isExpanded = false;
      let activeItem = null;
      let canDrag = true;
      let originalPosition = null;
      let expandedItem = null;
      let activeItemId = null;
      let titleSplit = null;

      function setAndAnimateTitle(title) {
        if (!projectTitleElement.current) return;
        if (titleSplit) titleSplit.revert();

        projectTitleElement.current.textContent = title;

        titleSplit = new SplitType(projectTitleElement.current, {
          types: "words",
        });

        if (!titleSplit.words) return;

        gsap.set(titleSplit.words, { y: "100%" });
      }

      function animateTitleIn() {
        if (!titleSplit || !titleSplit.words) return;

        gsap.to(titleSplit.words, {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        });
      }

      function animateTitleOut() {
        if (!titleSplit || !titleSplit.words) return;

        gsap.to(titleSplit.words, {
          y: "-100%",
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        });
      }

      function updateVisibleItems() {
        const viewWidth = window.innerWidth * 2;
        const viewHeight = window.innerHeight * 2;

        const stepX = itemWidth + itemGap;
        const stepY = itemHeight + itemGap;

        const startCol = Math.floor((-currentX - viewWidth / 2) / stepX);
        const endCol = Math.ceil((-currentX + viewWidth / 2) / stepX);

        const startRow = Math.floor((-currentY - viewHeight / 2) / stepY);
        const endRow = Math.ceil((-currentY + viewHeight / 2) / stepY);

        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const itemId = `${col},${row}`;
            if (visibleItems.has(itemId)) continue;

            const item = document.createElement("div");
            item.className = "item";
            item.id = itemId;
            item.style.left = `${col * stepX}px`;
            item.style.top = `${row * stepY}px`;
            item.addEventListener("click", () => {
              if (isDragging) return;
              handleItemClick(item);
            });

            const img = document.createElement("img");
            img.src = images[Math.abs(col + row) % images.length];

            item.appendChild(img);
            canvas.current.appendChild(item);
            visibleItems.add(itemId);
          }
        }
      }

      function handleItemClick(item) {
        if (isExpanded) {
          if (expandedItem) closeExpandedItem();
        } else {
          expandItem(item);
        }
      }

      function expandItem(item) {
        isExpanded = true;
        activeItem = item;
        activeItemId = item.id;
        canDrag = false;
        container.current.style.cursor = "auto";

        const imgSrc = item.querySelector("img").src;
        const imgMatch = imgSrc.match(/\/img(\d+)\.jpg/);
        const imgNum = imgMatch ? parseInt(imgMatch[1]) : 1;
        const titleIndex = (imgNum - 1) % items.length;

        setAndAnimateTitle(items[titleIndex]);
        item.style.visibility = "hidden";

        const rect = item.getBoundingClientRect();
        const targetImg = item.querySelector("img").src;

        originalPosition = {
          id: item.id,
          rect: rect,
          imgSrc: targetImg,
        };

        overlay.current.classList.add("active");

        expandedItem = document.createElement("div");
        expandedItem.className = "expanded-item";
        expandedItem.style.width = `${itemWidth}px`;
        expandedItem.style.height = `${itemHeight}px`;

        const img = document.createElement("img");
        img.src = targetImg;
        expandedItem.appendChild(img);
        expandedItem.addEventListener("click", closeExpandedItem);
        document.body.appendChild(expandedItem);

        document.querySelectorAll(".item").forEach((el) => {
          if (el !== activeItem) {
            gsap.to(el, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });

        const viewportWidth = window.innerWidth;
        const targetWidth = viewportWidth * 0.25;
        const targetHeight = targetWidth * 1.5;

        gsap.delayedCall(0.5, animateTitleIn);

        gsap.fromTo(
          expandedItem,
          {
            x: rect.left,
            y: rect.top,
            width: itemWidth,
            height: itemHeight,
          },
          {
            width: targetWidth,
            height: targetHeight,
            x: 0,
            y: 0,
            duration: 1,
            ease: "hop",
          },
        );
      }

      function closeExpandedItem() {
        if (!expandedItem || !originalPosition) return;

        animateTitleOut();
        overlay.current.classList.remove("active");
        const originalRect = originalPosition.rect;

        document.querySelectorAll(".item").forEach((el) => {
          if (el.id !== activeItemId) {
            gsap.to(el, {
              opacity: 1,
              duration: 0.5,
              delay: 0.5,
              ease: "power2.out",
            });
          }
        });

        const originalItem = activeItem;

        gsap.to(expandedItem, {
          width: itemWidth,
          height: itemHeight,
          x: originalRect.left + itemWidth / 2 - window.innerWidth / 2,
          y: originalRect.top + itemHeight / 2 - window.innerHeight / 2,
          duration: 1,
          ease: "hop",
          onComplete: () => {
            if (expandedItem && expandedItem.parentNode) {
              document.body.removeChild(expandedItem);
            }

            if (originalItem) {
              originalItem.style.visibility = "visible";
            }

            expandedItem = null;
            isExpanded = false;
            activeItem = null;
            originalPosition = null;
            activeItemId = null;
            canDrag = true;
            container.current.style.cursor = "grab";
            dragVelocityX = 0;
            dragVelocityY = 0;
          },
        });
      }

      function animate() {
        if (canDrag) {
          const ease = 0.075;
          currentX += (targetX - currentX) * ease;
          currentY += (targetY - currentY) * ease;

          canvas.current.style.transform = `translate(${currentX}px, ${currentY}px)`;

          const now = Date.now();
          const distMoved = Math.sqrt(
            Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2),
          );

          if (distMoved > 100 || now - lastUpdateTime > 120) {
            updateVisibleItems();
            lastX = currentX;
            lastY = currentY;
            lastUpdateTime = now;
          }
        }

        requestAnimationFrame(animate);
      }

      container.current.addEventListener("mousedown", (e) => {
        if (!canDrag) return;
        isDragging = true;
        mouseHasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        container.current.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging || !canDrag) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          mouseHasMoved = true;
        }

        const now = Date.now();
        const dt = Math.max(10, now - lastDragTime);
        lastDragTime = now;

        dragVelocityX = dx / dt;
        dragVelocityY = dy / dt;

        targetX += dx;
        targetY += dy;

        startX = e.clientX;
        startY = e.clientY;
      });

      window.addEventListener("mouseup", (e) => {
        if (!isDragging) return;
        isDragging = false;
        mouseHasMoved = false;

        if (canDrag) {
          container.current.style.cursor = "grab";

          if (Math.abs(dragVelocityX) > 0.1 || Math.abs(dragVelocityY) > 0.1) {
            const momentumFactor = 200;
            targetX += dragVelocityX * momentumFactor;
            targetY += dragVelocityY * momentumFactor;
          }
        }
      });

      overlay.current.addEventListener("click", () => {
        if (isExpanded) closeExpandedItem();
      });

      container.current.addEventListener(
        "touchstart",
        (e) => {
          if (!canDrag) return;
          isDragging = true;
          mouseHasMoved = false;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        },
        { passive: true },
      );

      window.addEventListener(
        "touchmove",
        (e) => {
          if (!isDragging || !canDrag) return;

          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;

          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            mouseHasMoved = true;
          }

          targetX += dx;
          targetY += dy;

          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        },
        { passive: true },
      );

      window.addEventListener(
        "touchend",
        () => {
          isDragging = false;
          mouseHasMoved = false;
        },
        { passive: true },
      );

      window.addEventListener("resize", () => {
        if (isExpanded && expandedItem) {
          const viewportWidth = window.innerWidth;
          const targetWidth = viewportWidth * 0.4;
          const targetHeight = targetWidth * 1.2;

          gsap.to(expandedItem, {
            width: targetWidth,
            height: targetHeight,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          updateVisibleItems();
        }
      });

      updateVisibleItems();
      animate();
    },
    { scope: container },
  );

  return (
    <div className="background-poster">
      <nav>
        <div className="logo">
          <a href="#">Codegrid</a>
        </div>
        <div className="links">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <div className="socials">
            <a href="#">IG</a>
            <a href="#">FB</a>
            <a href="#">YT</a>
          </div>
        </div>
      </nav>
      <footer>
        <p>Experiment 445</p>
        <p>Unlock Source Code with PRO</p>
      </footer>
      <div ref={container} className="container">
        <div ref={canvas} className="canvas"></div>
        <div ref={overlay} className="overlay"></div>
      </div>
      <div className="project-title">
        <p ref={projectTitleElement}></p>
      </div>
    </div>
  );
}

export default Posters;
