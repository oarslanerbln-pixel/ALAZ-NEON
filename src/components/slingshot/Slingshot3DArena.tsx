import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SoundManager, sounds } from "../../lib/audio";
import { useLocale } from "../../hooks/useLocale";
import { GOAL_HEIGHT, GOAL_WIDTH, SLINGSHOT_GOAL_POINTS, judgeShot, type ShotResult, type SlingshotShot } from "../../lib/slingshot";

export interface SlingshotPlayer {
  id: string;
  nickname: string;
  color: string;
  score: number;
}

/** TV'nin sıradaki şutu: `id` değişince top fırlatılır. */
export interface ArenaShot extends SlingshotShot {
  id: string;
  playerId: string;
  shooterName: string;
  color: string;
}

interface Slingshot3DArenaProps {
  players: SlingshotPlayer[];
  shot: ArenaShot | null;
  /** Top kale çizgisine ulaşınca bir kez çağrılır. */
  onShotResult?: (shot: ArenaShot, result: ShotResult) => void;
}

/** Sabit yan rüzgar (m/s); topu her karede biraz sağa iter. */
const WIND = 1.2;

export function Slingshot3DArena({ players, shot, onShotResult }: Slingshot3DArenaProps) {
  const { t } = useLocale();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [shotResult, setShotResult] = useState<ShotResult | null>(null);

  // Sahne yalnızca bir kez kurulur. Eskiden atıcı ve geri çağırmalar efektin
  // bağımlılığındaydı: her yeni atıcıda WebGL sahnesi yıkılıp kuruluyor, şut
  // da yıkılan sahneye fırlatılıp kayboluyordu.
  const fireShotRef = useRef<((shot: ArenaShot) => void) | null>(null);
  const onShotResultRef = useRef(onShotResult);
  useEffect(() => {
    onShotResultRef.current = onShotResult;
  }, [onShotResult]);

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
    const goalW = GOAL_WIDTH;
    const goalH = GOAL_HEIGHT;

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
    let activeShot: ArenaShot | null = null;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    fireShotRef.current = (shot: ArenaShot) => {
      activeShot = shot;
      // Önceki topun gizlenme zamanlayıcısı yeni topu söndürmesin.
      timers.forEach(clearTimeout);
      timers.clear();
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
        ball.position.x += ballVx + ballSpin + WIND * 0.01;
        ball.position.y += ballVy;
        ball.position.z += ballVz;
        ballVy -= 0.016; // Yerçekimi

        ball.rotation.x += 0.15;
        ball.rotation.y += ballSpin * 2;

        // Kale Çizgisine Ulaşma (Z <= -21.5)
        if (ball.position.z <= -21.5) {
          ballActive = false;

          const result = judgeShot(ball.position.x, ball.position.y, keeperGroup.position.x);
          setShotResult(result);
          if (result === "goal") SoundManager.getInstance().playSFX(sounds.FANFARE, 1.0);
          else if (result === "crossbar") SoundManager.getInstance().playSFX(sounds.CLICK, 1.0);
          else SoundManager.getInstance().playSFX(sounds.FAILURE, result === "saved" ? 0.8 : 0.5);
          if (activeShot) onShotResultRef.current?.(activeShot, result);
          activeShot = null;

          // 2 saniye sonra topu sıfırla
          const hide = setTimeout(() => {
            timers.delete(hide);
            ball.visible = false;
          }, 2000);
          timers.add(hide);
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      timers.forEach(clearTimeout);
      fireShotRef.current = null;
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sahne efektinden SONRA: ilk karede gelen şut da kurulmuş sahneye düşsün.
  const shotId = shot?.id;
  useEffect(() => {
    if (shot && fireShotRef.current) fireShotRef.current(shot);
    // Yalnızca yeni şutta fırlat; aynı şutun nesnesi yenilense de tekrar etme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotId]);

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-black text-white">
      {/* 3D WebGL Tuvali */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Üst HUD: Maç Önü Penaltı Arenası Başlığı */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-alaz-orange/20 border-2 border-alaz-orange flex items-center justify-center text-xl">
            ⚽
          </div>
          <div>
            <div className="text-xs tabular-nums tracking-[0.3em] uppercase text-alaz-orange font-bold">
              {t("slingshot.arenaEyebrow")}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {shot ? t("slingshot.shooter", shot.shooterName) : t("slingshot.title")}
            </h1>
          </div>
        </div>

        {/* Canlı Rüzgar Vektörü Göstergesi */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-white/15">
          <span className="text-lg">🌬️</span>
          <div className="tabular-nums text-xs">
            <span className="text-white/60">{t("slingshot.wind")}: </span>
            <span className="text-cyan-300 font-bold">{t("slingshot.windRight", WIND)}</span>
          </div>
        </div>

        {/* Skor Tablosu */}
        <div className="flex items-center gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15"
            >
              <span className="tabular-nums text-xs font-bold">{p.nickname}</span>
              <span className="tabular-nums text-sm font-black text-alaz-orange ml-1">
                {t("slingshot.goals", p.score)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Büyük Şut Sonucu Animasyonu (GOL / KURTARILDI / DİREK) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {shotResult === "goal" && (
          <div className="flex flex-col items-center">
            <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-alaz-orange">
              {t("slingshot.goal")}
            </h1>
            <span className="tabular-nums text-xl tracking-[0.4em] uppercase text-amber-300 font-black mt-2">
              {t("slingshot.goalPoints", SLINGSHOT_GOAL_POINTS)}
            </span>
          </div>
        )}

        {shotResult === "saved" && (
          <div className="flex flex-col items-center">
            <h1 className="text-7xl md:text-8xl font-black italic tracking-tight text-rose-500">
              {t("slingshot.saved")}
            </h1>
          </div>
        )}

        {shotResult === "crossbar" && (
          <div className="flex flex-col items-center">
            <h1 className="text-7xl md:text-8xl font-black italic tracking-tight text-amber-400">
              {t("slingshot.crossbar")}
            </h1>
          </div>
        )}

        {shotResult === "out" && (
          <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white/50">
              {t("slingshot.out")}
            </h1>
          </div>
        )}
      </div>

      {/* Alt HUD: Kılavuz */}
      <div className="relative z-20 flex items-center justify-center p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tabular-nums text-white/70">
          <span className="w-2 h-2 rounded-full bg-alaz-orange" />
          <span>{t("slingshot.arenaHint")}</span>
        </div>
      </div>
    </div>
  );
}
