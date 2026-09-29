import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const NeuralSkinCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const container = mountRef.current;
    if (!container) return;

    // WebGL support test
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported, falling back to 2D aesthetic gradient:', e);
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7;

    // 1. Central Abstract Medical Sphere (representing cellular skin architecture)
    const sphereGeo = new THREE.IcosahedronGeometry(2.0, 2);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 2. Neural Nodes (Points on the vertices)
    const pointGeo = new THREE.BufferGeometry();
    const posAttribute = sphereGeo.getAttribute('position');
    pointGeo.setAttribute('position', posAttribute);

    const pointMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
    });
    const neuralNodes = new THREE.Points(pointGeo, pointMat);
    scene.add(neuralNodes);

    // 3. Floating Ambient Particles (Medical research data points)
    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const floatingParticles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(floatingParticles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 20);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x6366f1, 1.8, 20);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsedTime = clock.getElapsedTime();
        sphereMesh.rotation.y = elapsedTime * 0.12;
        sphereMesh.rotation.x = Math.sin(elapsedTime * 0.08) * 0.2;

        neuralNodes.rotation.y = elapsedTime * 0.12;
        neuralNodes.rotation.x = Math.sin(elapsedTime * 0.08) * 0.2;

        floatingParticles.rotation.y = elapsedTime * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      pointMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};
