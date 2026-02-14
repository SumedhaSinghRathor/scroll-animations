import bgImg from "./bg.jpg";
import "./Fractal.css";
import * as THREE from "three";
import { vertexShaders, fragmentShader } from "./shaders.js";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

function Fractal() {
  const config = {
    lerpFactor: 0.035,
    parallaxStrength: 0.1,
    distortionMultiplier: 10,
    glassStrength: 2.0,
    glassSmoothness: 0.0001,
    stripesFrequency: 35,
    edgePadding: 0.1,
  };

  const container = useRef();
  const imageElement = useRef();

  useGSAP(
    () => {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.current.appendChild(renderer.domElement);

      const mouse = { x: 0.5, y: 0.5 };
      const targetMouse = { x: 0.5, y: 0.5 };

      const lerp = (start, end, factor) => start + (end - start) * factor;

      const textureSize = { x: 1, y: 1 };
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: null },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          uTextureSize: {
            value: new THREE.Vector2(textureSize.x, textureSize.y),
          },
          uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
          uParallaxStrength: { value: config.parallaxStrength },
          uDistortionMultiplier: { value: config.distortionMultiplier },
          uGlassStrength: { value: config.glassStrength },
          ustripesFrequency: { value: config.stripesFrequency },
          uglassSmoothness: { value: config.glassSmoothness },
          uEdgePadding: { value: config.edgePadding },
        },
        vertexShader: vertexShaders,
        fragmentShader: fragmentShader,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      function loadImage() {
        if (!imageElement.current.complete) {
          imageElement.current.onload = loadImage;
          return;
        }

        const texture = new THREE.Texture(imageElement.current);
        textureSize.x =
          imageElement.current.naturalWidth || imageElement.current.width;
        textureSize.y =
          imageElement.current.naturalHeight || imageElement.current.height;

        texture.needsUpdate = true;
        material.uniforms.uTexture.value = texture;
        material.uniforms.uTextureSize.value.set(textureSize.x, textureSize.y);
      }

      if (imageElement.current.complete) {
        loadImage();
      } else {
        imageElement.current.onload = loadImage;
      }

      window.addEventListener("mousemove", (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - e.clientY / window.innerHeight;
      });

      window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(
          window.innerWidth,
          window.innerHeight,
        );
      });

      function animate() {
        requestAnimationFrame(animate);
        mouse.x = lerp(mouse.x, targetMouse.x, config.lerpFactor);
        mouse.y = lerp(mouse.y, targetMouse.y, config.lerpFactor);
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);

        renderer.render(scene, camera);
      }

      animate();
    },
    { scope: container },
  );

  return (
    <div className="background-fractal">
      <nav>
        <div className="logo">
          <a href="#">&#8486; Glassform</a>
        </div>
        <div className="nav-links">
          <a href="#">Experiments</a>
          <a href="#">Objects</a>
          <a href="#">Exhibits</a>
        </div>
      </nav>

      <section ref={container} className="hero">
        <img
          ref={imageElement}
          src={bgImg}
          alt="background"
          id="glassTexture"
        />

        <div className="hero-content">
          <h1>Designed for the space between silence and noise.</h1>
          <p>Developed by Codegrid</p>
        </div>
      </section>
    </div>
  );
}

export default Fractal;
