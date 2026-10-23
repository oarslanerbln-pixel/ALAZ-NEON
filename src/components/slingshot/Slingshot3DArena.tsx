import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { SoundManager, sounds } from "../../lib/audio";
import type { SlingshotLaunchData } from "./SlingshotController";

export interface SlingshotPlayer {
  id: string;
  nickname: string;
  color: string;
  score: number;
}

interface Slingshot3DArenaProps {
  players: SlingshotPlayer[];
  currentShooter?: SlingshotPlayer;
  incomingShot?: SlingshotLaunchData | null;
  onGoal?: (playerId: string, points: number) => void;
  onSave?: (playerId: string) => void;
}

export function Slingshot3DArena({
  players,
  currentShooter,
  incomingShot,
  onGoal,
  onSave,
}: Slingshot3DArenaProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [shotResult, setShotResult] = useState<"goal" | "saved" | "crossbar" | "out" | null>(null);
  const [wind, setWind] = useState<number>(1.2); // m/s rüzgar

  // Atışı fırlatma ref'i
  const fireShotRef = useRef<((shot: SlingshotLaunchData) => void) | null>(null);

  useEffect(() => {
    if (incomingShot && fireShotRef.current) {
      fireShotRef.current(incomingShot);
    }
  }, [incomingShot]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Three.js Sahnesi, Kamera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.018);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 4, 28);
    camera.lookAt(0, 3, -15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Stadyum Işıklandırması (Blender Volumetric Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const goalSpot = new THREE.PointLight(0x00f3ff, 3, 60);
    goalSpot.position.set(0, 15, -18);
    scene.add(goalSpot);

    const flareRight = new THREE.PointLight(0xff5500, 2.5, 50);
    flareRight.position.set(22, 10, 5);
    scene.add(flareRight);

    // 3D Çim Saha Zemin Grid'i
    const pitchGeom = new THREE.PlaneGeometry(60, 80);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0x071b12,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: true,
    });
    const pitch = new THREE.Mesh(pitchGeom, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = -1;
    scene.add(pitch);

    // ═══════════════════════════════════════════════════════════════
    // 3D NEON KALE DİREKLERİ & FİLE
    // ═══════════════════════════════════════════════════════════════
    const goalGroup = new THREE.Group();
    goalGroup.position.set(0, 0, -22);

    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });

    const postRadius = 0.35;
    const goalW = 16;
    const goalH = 7.5;

    // Sol Direk
    const leftPostGeom = new THREE.CylinderGeometry(postRadius, postRadius, goalH);
    const leftPost = new THREE.Mesh(leftPostGeom, postMat);
    leftPost.position.set(-goalW / 2, goalH / 2 - 1, 0);
    goalGroup.add(leftPost);

    // Sağ Direk
    const rightPostGeom = new THREE.CylinderGeometry(postRadius, postRadius, goalH);
    const rightPost = new THREE.Mesh(rightPostGeom, postMat);
    rightPost.position.set(goalW / 2, goalH / 2 - 1, 0);
    goalGroup.add(rightPost);

    // Üst Üst Direk (Crossbar)
    const crossbarGeom = new THREE.CylinderGeometry(postRadius, postRadius, goalW);
    const crossbar = new THREE.Mesh(crossbarGeom, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, goalH - 1, 0);
    goalGroup.add(crossbar);

    // File Teli
    const netGeom = new THREE.BoxGeometry(goalW, goalH, 4);
    const netMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const net = new THREE.Mesh(netGeom, netMat);
    net.position.set(0, goalH / 2 - 1, -2);
    goalGroup.add(net);

    scene.add(goalGroup);

    // ═══════════════════════════════════════════════════════════════
    // 3D SİBER KALECİ
    // ═══════════════════════════════════════════════════════════════
    const keeperGroup = new THREE.Group();
    keeperGroup.position.set(0, 2, -21.5);

    const keeperBodyGeom = new THREE.CapsuleGeometry(1.0, 2.2, 8, 16);
    const keeperMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0044,
      emissiveIntensity: 0.8,
      metalness: 0.8,
    });
    const keeperBody = new THREE.Mesh(keeperBodyGeom, keeperMat);
    keeperGroup.add(keeperBody);

    // Kaleci Göz Siperliği
    const visorGeom = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const visor = new THREE.Mesh(visorGeom, visorMat);
    visor.position.set(0, 1.2, 0.6);
    keeperGroup.add(visor);

    scene.add(keeperGroup);

    // ═══════════════════════════════════════════════════════════════
    // 3D FUTBOL TOPU & PARÇACIKLAR
    // ═══════════════════════════════════════════════════════════════
    const ballGeom = new THREE.SphereGeometry(1.1, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffaa00,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.6,
    });
    const ball = new THREE.Mesh(ballGeom, ballMat);
    ball.position.set(0, 0, 16);
    ball.visible = false;
    scene.add(ball);

    // Top Hareket Fiziği Değişkenleri
    let ballActive = false;
    let ballVx = 0;
    let ballVy = 0;
    let ballVz = 0;
    let ballSpin = 0;

    fireShotRef.current = (shot: SlingshotLaunchData) => {
      ball.position.set(0, 0.5, 16);
      ball.visible = true;
      ballActive = true;

      // Fırlatma vektörü hesaplama
      const speed = 0.5 + (shot.power / 100) * 1.35;
      const angleRad = (shot.angle * Math.PI) / 180;

      ballVx = -Math.sin(angleRad) * speed;
      ballVy = 0.25 + (shot.power / 100) * 0.45;
      ballVz = -speed * 1.5;
      ballSpin = shot.curve * 0.08;

      setShotResult(null);
      SoundManager.getInstance().playSFX(sounds.VOTE_TICK, 0.7);
    };

    // Animasyon Döngüsü
    let animId: number;
    let running = true;
    let keeperDir = 1;

    const animate = () => {
      if (!running) return;

      // Kaleci Yapay Zekası: Kalenin içinde sağa-sola süzülür
      keeperGroup.position.x += 0.08 * keeperDir;
      if (keeperGroup.position.x > 6) keeperDir = -1;
      if (keeperGroup.position.x < -6) keeperDir = 1;

      // Top Fiziği Simülasyonu
      if (ballActive) {
        ball.position.x += ballVx + ballSpin;
        ball.position.y += ballVy;
        ball.position.z += ballVz;
        ballVy -= 0.016; // Yerçekimi

        ball.rotation.x += 0.15;
        ball.rotation.y += ballSpin * 2;

        // Kale Çizgisine Ulaşma (Z <= -21.5)
        if (ball.position.z <= -21.5) {
          ballActive = false;

          const bx = ball.position.x;
          const by = ball.position.y;
          const kx = keeperGroup.position.x;

          // Kaleci Kurtardı mı?
          if (Math.abs(bx - kx) < 2.5 && by >= 0 && by <= 5.5) {
            setShotResult("saved");
            SoundManager.getInstance().playSFX(sounds.FAILURE, 0.8);
            if (onSave && currentShooter) onSave(currentShooter.id);
          }
          // Gol mü?
          else if (Math.abs(bx) < goalW / 2 - 0.5 && by > 0 && by < goalH - 1) {
            setShotResult("goal");
            SoundManager.getInstance().playSFX(sounds.FANFARE, 1.0);
            if (onGoal && currentShooter) {
              onGoal(currentShooter.id, 100);
            }
          }
          // Direkten mi Döndü?
          else if (
            (Math.abs(Math.abs(bx) - goalW / 2) < 0.8 && by <= goalH) ||
            (Math.abs(by - (goalH - 1)) < 0.8 && Math.abs(bx) <= goalW / 2)
          ) {
            setShotResult("crossbar");
            SoundManager.getInstance().playSFX(sounds.CLICK, 1.0);
          }
          // Dışarı mı Gitti?
          else {
            setShotResult("out");
            SoundManager.getInstance().playSFX(sounds.FAILURE, 0.5);
          }

          // 2 saniye sonra topu sıfırla
          setTimeout(() => {
            ball.visible = false;
          }, 2000);
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [currentShooter, onGoal, onSave]);

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-black text-white">
      {/* 3D WebGL Tuvali */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Üst HUD: Maç Önü Penaltı Arenası Başlığı */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-alaz-orange/20 border-2 border-alaz-orange flex items-center justify-center text-xl shadow-[0_0_20px_#ff5500]">
            ⚽
          </div>
          <div>
            <div className="text-xs font-mono tracking-[0.3em] uppercase text-alaz-orange font-bold">
              HENGAME MAÇ ÖNÜ DÜELLOSU
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              YÖRÜNGE SAPANI
            </h1>
          </div>
        </div>

        {/* Canlı Rüzgar Vektörü Göstergesi */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
          <span className="text-lg">🌬️</span>
          <div className="font-mono text-xs">
            <span className="text-white/60">RÜZGAR: </span>
            <span className="text-cyan-300 font-bold">+{wind} m/s SAĞ</span>
          </div>
        </div>

        {/* Skor Tablosu */}
        <div className="flex items-center gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md"
            >
              <span className="font-mono text-xs font-bold">{p.nickname}</span>
              <span className="font-mono text-sm font-black text-alaz-orange ml-1">
                {p.score} GOL
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Büyük Şut Sonucu Animasyonu (GOL / KURTARILDI / DİREK) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {shotResult === "goal" && (
          <div className="flex flex-col items-center animate-bounce">
            <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-alaz-orange drop-shadow-[0_0_50px_rgba(255,85,0,0.9)]">
              GOOOOOL! ⚽
            </h1>
            <span className="font-mono text-xl tracking-[0.4em] uppercase text-amber-300 font-black mt-2">
              +100 PUAN KAZANILDI
            </span>
          </div>
        )}

        {shotResult === "saved" && (
          <div className="flex flex-col items-center">
            <h1 className="text-7xl md:text-8xl font-black italic tracking-tight text-rose-500 drop-shadow-[0_0_40px_rgba(244,63,94,0.9)]">
              KALECİ UZANDI! 🧤
            </h1>
          </div>
        )}

        {shotResult === "crossbar" && (
          <div className="flex flex-col items-center">
            <h1 className="text-7xl md:text-8xl font-black italic tracking-tight text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.9)]">
              DİREKTEN DÖNDÜ! 💥
            </h1>
          </div>
        )}

        {shotResult === "out" && (
          <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white/50">
              AUTA GİTTİ 💨
            </h1>
          </div>
        )}
      </div>

      {/* Alt HUD: Kılavuz */}
      <div className="relative z-20 flex items-center justify-center p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
          <span className="w-2 h-2 rounded-full bg-alaz-orange animate-ping" />
          <span>Telefonda topu geriye doğru çek, rüzgarı ve falsoyu hesaplayıp fırlat!</span>
        </div>
      </div>
    </div>
  );
}
