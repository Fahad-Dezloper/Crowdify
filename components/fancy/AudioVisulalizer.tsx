import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AudioVisualizer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 3000;
    const positionArray = new Float32Array(particleCount * 3);
    const scaleArray = new Float32Array(particleCount);
    const speedArray = new Float32Array(particleCount);
    
    for(let i = 0; i < particleCount; i++) {
      // Create a layered sphere distribution
      const layer = Math.floor(Math.random() * 3); // 0, 1, or 2
      const radius = 10 + layer * 8; // 10, 18, or 26
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positionArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positionArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positionArray[i * 3 + 2] = radius * Math.cos(phi);
      
      scaleArray[i] = 0.3 + Math.random() * 0.7; // More varied sizes
      speedArray[i] = 0.5 + Math.random() * 0.5; // Individual particle speeds
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));
    particlesGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(speedArray, 1));

    // Enhanced shader material
    const particlesMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMouseX: { value: 0 },
        uMouseY: { value: 0 },
        uHover: { value: 0 }
      },
      vertexShader: `
        attribute float aScale;
        attribute float aSpeed;
        uniform float uTime;
        uniform float uMouseX;
        uniform float uMouseY;
        uniform float uHover;
        
        varying float vDistance;
        
        void main() {
          vec3 pos = position;
          
          // Complex orbital motion
          float angle = aSpeed * uTime * 0.2;
          float radius = length(pos.xz);
          float y = pos.y;
          
          pos.x = radius * cos(angle);
          pos.z = radius * sin(angle);
          pos.y = y + sin(uTime * 0.5 + radius * 0.2) * 2.0;
          
          // Enhanced mouse interaction
          vec3 mousePos = vec3(uMouseX * 20.0, uMouseY * 20.0, 0.0);
          vec3 direction = normalize(mousePos - pos);
          float dist = length(mousePos - pos);
          float strength = (1.0 - smoothstep(0.0, 15.0, dist)) * uHover;
          pos += direction * strength * 5.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Dynamic size based on position and mouse proximity
          float size = (40.0 * aScale) / length(mvPosition.xyz);
          size *= (1.0 + strength * 0.5);
          gl_PointSize = size;
          
          vDistance = dist;
        }
      `,
      fragmentShader: `
        varying float vDistance;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.45, 0.5, dist);
          
          // Create a more ethereal gradient effect
          vec3 color1 = vec3(0.45, 0.75, 1.0); // Light blue
          vec3 color2 = vec3(0.8, 0.3, 0.9);   // Purple
          vec3 color3 = vec3(1.0, 0.4, 0.6);   // Pink
          
          float colorMix = gl_PointCoord.x + gl_PointCoord.y;
          vec3 color = mix(
            mix(color1, color2, colorMix * 0.5),
            color3,
            sin(colorMix * 3.14) * 0.5 + 0.5
          );
          
          // Add subtle pulsing
          float pulse = sin(vDistance * 0.5) * 0.5 + 0.5;
          alpha *= 0.7 + pulse * 0.3;
          
          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 35;

    let isHovering = false;
    let hoverValue = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      // Smooth hover transition
      hoverValue += (isHovering ? (1 - hoverValue) : -hoverValue) * 0.1;
      
      // Update uniforms
      particlesMaterial.uniforms.uTime.value = performance.now() * 0.001;
      particlesMaterial.uniforms.uMouseX.value += (mousePosition.current.x - particlesMaterial.uniforms.uMouseX.value) * 0.1;
      particlesMaterial.uniforms.uMouseY.value += (mousePosition.current.y - particlesMaterial.uniforms.uMouseY.value) * 0.1;
      particlesMaterial.uniforms.uHover.value = hoverValue;
      
      // Camera movement
      camera.position.x += (mousePosition.current.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mousePosition.current.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frame);
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />;
};

export default AudioVisualizer;