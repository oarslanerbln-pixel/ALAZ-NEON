import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface TargetEntity {
  id: string;
  type: "football" | "drone" | "bonus";
  x: number;
  y: number;
  z: number;
  radius: number;
  hp: number;
  maxHp: number;
  points: number;
  speedX: number;
  speedY: number;
  mesh?: THREE.Mesh | THREE.Group;
}

export interface PlayerCrosshair {
  id: string;
  nickname: string;
  color: string;
  x: number; // -1 to +1
  y: number; // -1 to +1
  score: number;
  lastShotTime?: number;
}

interface CyberTargetArenaProps {
  players: PlayerCrosshair[];
  timeLeft?: number;
  onTargetHit?: (playerId: string, targetId: string, points: number) => void;
  onRoundComplete?: () => void;
}

export function CyberTargetArena({
  players,
  timeLeft = 30,
}: CyberTargetArenaProps) {
  // TODO(sniper): onTargetHit/onRoundComplete henüz bağlı değil — vuruş
  // tespiti yok, bu yüzden mod katalogda kilitli (bkz. gameCatalog).
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [scoreList, setScoreList] = useState(players);
  const [floatingHits] = useState<
    Array<{ id: number; x: number; y: number; text: string; color: string }>
  >([]);

  useEffect(() => {
    setScoreList(players);
  }, [players]);

  // Three.js 3D Sahnesi Kurulumu
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Sahne, Kamera ve Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Işıklandırma (Blender Studio Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const spotCyan = new THREE.PointLight(0x00f3ff, 2, 80);
    spotCyan.position.set(-20, 20, 20);
    scene.add(spotCyan);

    const spotOrange = new THREE.PointLight(0xff5500, 2.5, 80);
    spotOrange.position.set(20, -15, 20);
    scene.add(spotOrange);

    // 3D Grid Arka Planı
    const gridHelper = new THREE.GridHelper(80, 40, 0x00f3ff, 0x1f2937);
    gridHelper.position.y = -18;
    gridHelper.rotation.x = 0.2;
    scene.add(gridHelper);

    // Hedef Havuzu
    const targets: TargetEntity[] = [];

    const createTargetMesh = (type: TargetEntity["type"]) => {
      const group = new THREE.Group();

      if (type === "football") {
        // 3D Neon Futbol Topu
        const geom = new THREE.IcosahedronGeometry(2.4, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.8,
          wireframe: true,
          emissive: 0x00f3ff,
          emissiveIntensity: 0.4,
        });
        const sphere = new THREE.Mesh(geom, mat);
        group.add(sphere);

        // Çekirdek parıltısı
        const coreGeom = new THREE.SphereGeometry(1.8, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        group.add(new THREE.Mesh(coreGeom, coreMat));
      } else if (type === "drone") {
        // Hızlı Dönen Siber Drone
        const geom = new THREE.OctahedronGeometry(2.0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff0055,
          emissive: 0xff0055,
          emissiveIntensity: 0.6,
          metalness: 0.9,
          roughness: 0.1,
        });
        group.add(new THREE.Mesh(geom, mat));

        const ringGeom = new THREE.TorusGeometry(3.0, 0.1, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      } else {
        // Altın Bonus Yıldız
        const geom = new THREE.DodecahedronGeometry(2.2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffdd00,
          emissive: 0xffaa00,
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.1,
        });
        group.add(new THREE.Mesh(geom, mat));
      }

      return group;
    };

    // Başlangıç Hedefleri Üret
    const types: TargetEntity["type"][] = ["football", "drone", "bonus", "football", "drone"];
    for (let i = 0; i < 6; i++) {
      const type = types[i % types.length];
      const mesh = createTargetMesh(type);
      const x = (Math.random() - 0.5) * 36;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      mesh.position.set(x, y, z);
      scene.add(mesh);

      targets.push({
        id: `target_${i}_${Date.now()}`,
        type,
        x,
        y,
        z,
        radius: type === "drone" ? 2.8 : 2.4,
        hp: type === "drone" ? 1 : 2,
        maxHp: type === "drone" ? 1 : 2,
        points: type === "bonus" ? 250 : type === "drone" ? 150 : 100,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.08,
        mesh,
      });
    }

    // Ekran Yeniden Boyutlandırma
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animasyon Döngüsü
    let animId: number;
    let running = true;

    const animate = () => {
      if (!running) return;

      // Hedefleri hareket ettir ve döndür
      for (const t of targets) {
        if (!t.mesh) continue;

        t.x += t.speedX;
        t.y += t.speedY;

        // Sınır çarpışmaları
        if (t.x > 22 || t.x < -22) t.speedX *= -1;
        if (t.y > 12 || t.y < -12) t.speedY *= -1;

        t.mesh.position.x = t.x;
        t.mesh.position.y = t.y;

        t.mesh.rotation.x += 0.015;
        t.mesh.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-black text-white">
      {/* 3D WebGL Tuvali */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Üst HUD: Siber Nişancı Başlığı & Süre & Canlı Skorlar */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Sol: Oyun Başlığı */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-xl shadow-[0_0_20px_#00f3ff]">
            🎯
          </div>
          <div>
            <div className="text-xs font-mono tracking-[0.3em] uppercase text-cyan-400 font-bold">
              HENGAME DERBİ ARENASI
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              SİBER NİŞANCI
            </h1>
          </div>
        </div>

        {/* Orta: Süre Sayacı */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-mono font-black text-alaz-orange drop-shadow-[0_0_20px_rgba(255,85,0,0.8)]">
            {timeLeft}s
          </div>
          <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
            HEDEFLERİ VUR
          </div>
        </div>

        {/* Sağ: Oyuncu Skor Kartları */}
        <div className="flex items-center gap-3">
          {scoreList.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md shadow-lg"
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-mono text-xs font-bold text-white/90">{p.nickname}</span>
              <span className="font-mono text-sm font-black text-cyan-300 ml-1">{p.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Oyuncuların Canlı Lazer Retikülleri (Crosshairs) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {players.map((p) => {
          // -1..1 aralığını %0..100 ekran koordinatına çevir
          const leftPercent = (p.x + 1) * 50;
          const topPercent = (p.y + 1) * 50;

          return (
            <div
              key={p.id}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 0.05s linear, top 0.05s linear",
              }}
              className="absolute pointer-events-none flex flex-col items-center"
            >
              {/* Lazer Nişangahı */}
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: p.color,
                  boxShadow: `0 0 20px ${p.color}`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              </div>

              {/* Oyuncu İsmi Rozeti */}
              <div
                className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-black uppercase"
                style={{ backgroundColor: p.color }}
              >
                {p.nickname}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vurulma Skor Pop-up Animasyonları */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {floatingHits.map((h) => (
          <div
            key={h.id}
            style={{ left: `${h.x}px`, top: `${h.y}px` }}
            className="absolute text-2xl font-black font-mono tracking-wider animate-bounce"
          >
            <span style={{ color: h.color }}>{h.text}</span>
          </div>
        ))}
      </div>

      {/* Alt HUD: Kılavuz */}
      <div className="relative z-20 flex items-center justify-center p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Telefonunu havada hareket ettirerek hedeflere nişan al ve ateşle!</span>
        </div>
      </div>
    </div>
  );
}
