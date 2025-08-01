import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { gsap } from "gsap";
import "./styles/LoaderScene.scss";

/**
 * Full-screen Three.js intro animation.
 * Props:
 *  - word (string): brand text to animate (default "BrandName")
 *  - onComplete (): callback when finished (e.g. hide / unmount)
 */
export default function LoaderScene({ word = "BrandName", onComplete }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      2000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0); // let body white show through
    container.appendChild(renderer.domElement);

    const letters = [];
    const LETTER_SIZE = 60;
    const WORDMARK_OFFSET = { x: 100, y: 70 };

    // font load & build
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        buildLetters(font);
        startAnimation();
      },
      undefined,
      (err) => console.error(err)
    );

    function buildLetters(font) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const totalWidth = word.length * LETTER_SIZE;
      const startX = -totalWidth / 2 + LETTER_SIZE / 2;

      for (let i = 0; i < word.length; i++) {
        const geometry = new TextGeometry(word[i], {
          font,
          size: LETTER_SIZE,
          height: 2,
          curveSegments: 4,
        });
        geometry.center();

        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 600,
          (Math.random() - 0.5) * 300,
          0
        );
        mesh.userData.targetPos = new THREE.Vector3(startX + i * LETTER_SIZE, 0, 0);
        scene.add(mesh);
        letters.push(mesh);
      }
    }

    function startAnimation() {
      const tl = gsap.timeline();
      tl.to(
        letters.map((l) => l.position),
        {
          duration: 1,
          x: (i) => letters[i].userData.targetPos.x,
          y: 0,
          ease: "power3.out",
          stagger: { each: 0.02 },
        }
      )
        .addLabel("centered")
        .add(() => moveToNavbar(), "centered+=0.1")
        .add(() => finalize(), "+=1");
    }

    function moveToNavbar() {
      const targetX = -window.innerWidth / 2 + WORDMARK_OFFSET.x;
      const targetY = window.innerHeight / 2 - WORDMARK_OFFSET.y;
      gsap.to(letters.map((l) => l.position), {
        duration: 1,
        x: (i) => targetX + letters[i].userData.targetPos.x,
        y: targetY,
        ease: "power2.inOut",
        stagger: { each: 0.01 },
      });
    }

    function finalize() {
      gsap.to(container, {
        duration: 0.6,
        opacity: 0,
        pointerEvents: "none",
        onComplete: () => {
          renderer.dispose();
          // remove canvas nodes
          while (container.firstChild) container.removeChild(container.firstChild);
          onComplete && onComplete();
        },
      });
    }

    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [word, onComplete]);

  return <div className="loader-scene" ref={containerRef} />;
}
