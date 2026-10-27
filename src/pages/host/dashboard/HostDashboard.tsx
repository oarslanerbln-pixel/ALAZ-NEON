import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import { SoundManager, sounds } from "../../../lib/audio";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import type { Room, Player, GameType } from "../../../types/database";

import { GameSettingsModal } from "../components/GameSettingsModal";
import { GAME_CARDS as GAMES, GAME_CATEGORY_KEY } from "../../../lib/gameCatalog";
import { activePlayers as activePlayersOf } from "../../../lib/liveness";
import { useLocale } from "../../../hooks/useLocale";
import { useIsStaff } from "../../../hooks/useIsStaff";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVenue } from "../../../contexts/VenueContextCore";
import { AuroraBackdrop } from "../../../components/fx/AuroraBackdrop";
import { BeamBorder } from "../../../components/fx/BeamBorder";
import { GridPattern } from "../../../components/fx/GridPattern";
import { NumberTicker, ShimmerButton, GameAnimatedLogo } from "../../../components/fx";
import { NIGHT_ROUND_OPEN } from "../../../lib/nightAwards";
import { clearRoomAnswers, resetPlayersForNewGame } from "../../../lib/gameReset";
import { nextBombCategory } from "../../../lib/bomb";
import { NightFinale } from "../views/NightFinale";
import { nightStandings, rankDeltas } from "../../../lib/nightLeague";
import { SHOWCASE_IDLE_MS } from "../../../lib/showcase";
import { useIdle } from "../../../hooks/useIdle";
import { HostShowcase } from "./HostShowcase";
import { getJoinUrl } from "../../../lib/roomUrls";

/** QR kartının altında 1080'lik tuvale kaydırmasız sığan misafir satırı. */
const DASHBOARD_LIST_MAX = 6;




interface HostDashboardProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostDashboard({ room, players, updateRoomStatus }: HostDashboardProps) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { venue } = useVenue();
  // Ödülü yalnızca personel hesabı yazabiliyor (bkz. lib/rewards.ts): TV
  // anonim açıldıysa oyun oynanır ama kazanana ödül düşmez — mekan bunu
  // oyun bittikten sonra değil, burada görsün.
  const { isStaff } = useIsStaff();
  const rewardsBlocked = venue.rewards_enabled && Boolean(venue.reward_title?.trim()) && isStaff === false;
  const [isKioskMode, setIsKioskMode] = useState(false);

  // Game Setup State
  const [setupGameMode, setSetupGameMode] = useState<GameType | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  // Gece lobisi bir süre boş kalınca TV tanıtım döngüsüne geçer; kurulum
  // penceresi ya da finale açıkken geçmez. İlk dokunuşta kapanır.
  const idle = useIdle(SHOWCASE_IDLE_MS, room.status === "night_lobby" && !setupGameMode && !showFinale && !isKioskMode);
  const showShowcase = isKioskMode || idle;

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    let next = carouselIndex + newDirection;
    if (next < 0) next = GAMES.length - 1;
    if (next >= GAMES.length) next = 0;
    setCarouselIndex(next);
  };



  /**
   * Geceyi bitirir: odayı "closed" durumuna alır ve ana sayfaya döner.
   *
   * "closed" durumu ve oyuncu tarafındaki kapanış ekranı (PlayerGame,
   * `game.roomClosed`) baştan yazılmıştı ama hiçbir yerde tetiklenmiyordu —
   * kod tabanında tek bir yazma yoktu. Yani odaların bir sonu yoktu:
   * misafirlerin telefonu gece bitince de açık kalıyor, oda sonsuza kadar
   * "canlı" görünüyordu (oda kodu tahsisi de bundan etkileniyordu,
   * bkz. lib/roomCodes.ts).
   */
  const endNight = async () => {
    try {
      await updateRoomStatus("closed", { active_game: "none" });
    } catch (err) {
      console.error("[HostDashboard] Oda kapatılamadı:", err);
    } finally {
      navigate("/");
    }
  };

  const handleStartGame = (game: GameType) => {
    const card = GAMES.find((g) => g.id === game);
    if (card?.isComingSoon) {
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      return;
    }
    setSetupGameMode(game);
  };

  const executeStartGame = async (game: GameType, settings?: Partial<Room>) => {
    const card = GAMES.find((g) => g.id === game);
    if (card?.isComingSoon) return;
    SoundManager.getInstance().playSFX(sounds.START);
    // Her oyun temiz başlar: önceki oyunun cevapları, skoru ve canları yeni
    // oyuna taşınmasın (bkz. lib/gameReset.ts). Sunucu onayı BEKLENMİYOR:
    // yazımlar yerel önbellekte hemen uygulanıp sırayla gönderiliyor; kafe
    // wifi'si yavaşken TV ayar penceresinde donup kalmasın (oda durumu
    // yazımı skor sıfırlamasından sonra kuyruğa giriyor).
    const resetFailed = (err: unknown) => console.error("[HostDashboard] Yeni oyun sıfırlaması başarısız:", err);
    resetPlayersForNewGame(players.map((p) => p.id)).catch(resetFailed);
    clearRoomAnswers(room.id).catch(resetFailed);

    // Scattegories "lobby" ile başlar. Buraya kalıcı olarak "intro" yazmak
    // oyunu tamamen kilitliyordu: "intro" host'un YEREL sinematik animasyonu,
    // odaya ait bir durum değil. Yerel animasyon bitip gameState "lobby"ye
    // geçince senkron efekti odadan hâlâ "intro" okuyup geri çeviriyor, bu da
    // sonsuz döngü kurup lobiye hiç ulaşılamamasına yol açıyordu.
    // Quiz/bomba/sapan kendi intro DURUMLARINI ekranlarında yönettiği için
    // onlarda böyle bir sorun yok.
    let initialStatus: Room["status"] = "lobby";
    let extraUpdates: Partial<Room> = { active_game: game, current_round: 0, ...settings, ...NIGHT_ROUND_OPEN };

    if (game === "quiz") {
      Promise.all([
        import("../../../lib/quizQuestions"),
        import("../../../lib/questionHistory"),
        import("../../../lib/quizReveal"),
        import("../../../lib/quizAnswerKey"),
      ]).then(async ([{ getQuizQuestions }, { recentQuestionIds, rememberQuestions }, { splitAnswerKey }, { saveQuizAnswerKey }]) => {
        const questions = getQuizQuestions(room.locale || "tr", settings?.total_rounds || 3, {
          topics: settings?.quiz_topics,
          recentIds: recentQuestionIds(),
        });
        rememberQuestions(questions.map((q) => q.id));
        // Doğru şıklar herkese açık odaya değil, host'a özel anahtara gider
        // (bkz. lib/quizReveal); anahtar sorulardan önce yazılıyor.
        const { questions: publicQuestions, answerKey } = splitAnswerKey(questions);
        await saveQuizAnswerKey(room.id, answerKey).catch((err) =>
          console.error("[HostDashboard] Cevap anahtarı kaydedilemedi:", err),
        );
        const startState = (settings?.current_round === 0 || room.current_round === 0) ? "tutorial" : "quiz_intro";
        updateRoomStatus(startState, {
          ...extraUpdates,
          current_question_index: 0,
          quiz_questions: publicQuestions,
          quiz_reveal: null,
          ...(startState === "tutorial" ? { tutorial_step: 0 } : {})
        });
      });
      return; // Async update handled above
    }
    
    if (game === "bomb") {
      // Canı olan VE hâlâ sinyal gönderen oyuncular: bomba, telefonu cebine
      // koyup gitmiş bir misafire verilirse tur süre dolana kadar kilitlenir.
      // Canlar yukarıda dolduruldu: yalnızca hâlâ sinyal gönderenlere bak.
      const activePlayers = activePlayersOf(players);
      const randomPlayer = activePlayers.length > 0 ? activePlayers[Math.floor(Math.random() * activePlayers.length)] : null;
      const { category, used } = nextBombCategory(settings?.categories || room.categories, []);

      initialStatus = "tutorial";
      extraUpdates = {
        ...extraUpdates,
        tutorial_step: 0,
        current_round: 1,
        // undefined Firestore'da yazım hatası (TV hata ekranına düşüyordu):
        // kimse yoksa alan hiç yazılmaz.
        ...(randomPlayer ? { bomb_target_player: randomPlayer.id } : {}),
        active_letter: category,
        used_bomb_categories: used,
        used_words: [],
        bomb_speed_multiplier: 1.0,
      };
    }

    if (game === "slingshot") {
      initialStatus = "slingshot_intro";
      extraUpdates = { ...extraUpdates, slingshot_end_time: 0 };
    }

    await updateRoomStatus(initialStatus, extraUpdates);
  };

  const joinUrl = getJoinUrl(room.code);

  // Gecenin liderleri: night_score F1 sıra puanlarıyla birikir (lib/nightLeague).
  // Eşitlikte ada göre — snapshot sırası değişince liste titremesin.
  const leaderboard = nightStandings(players);
  const order = leaderboard.map((p) => p.id);
  const orderKey = order.join("|");
  // Sıra değiştiğinde önceki sırayı sakla: kim kaç basamak çıktı/düştü (▲/▼).
  // Render sırasında state ayarı — effect'te setState fazladan tur doğururdu.
  const [ranks, setRanks] = useState(() => ({ key: orderKey, prev: order, cur: order }));
  if (ranks.key !== orderKey) setRanks({ key: orderKey, prev: ranks.cur, cur: order });
  const deltas = rankDeltas(ranks.prev, ranks.cur);

  return (
    <TVScaleFrame>
    <div className="w-full h-full relative overflow-hidden font-sans selection:bg-alaz-orange selection:text-black">
      {/* Koyu sahne. Eskiden açık pastel bir arka plan ve 100–120 px
          bulanıklık filtreli, nabız atan beyaz bloblar vardı: loş mekânda göz
          alıyor, ürünün geri kalanıyla çelişiyor ve TV'nin zayıf GPU'sunu
          her karede yeniden boyamaya zorluyordu. */}
      <div className="absolute inset-0 bg-[#05050a] z-0" />
      <AuroraBackdrop colors={["255,85,0", "168,85,247", "34,211,238"]} intensity={0.16} className="z-0" />
      <GridPattern className="z-0" />

      <div className="p-6 md:p-10 flex flex-col h-full relative z-10">
        <HostHeader
          room={room}
          exitConfirmKey="common.confirmEndNight"
          onExitToHome={endNight}
        />

        <div className="flex-1 mt-4 w-full max-w-[1600px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* QR Code and Players Column */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="bg-[#0b0b14]/90 backdrop-blur-3xl p-5 rounded-[1.5rem] border border-white/10 flex flex-col items-center shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] relative overflow-hidden group/qr">
              <div className="absolute inset-0 bg-gradient-to-b from-alaz-orange/10 to-transparent pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-alaz-orange/20 rounded-full blur-[60px] pointer-events-none group-hover/qr:bg-alaz-orange/30 transition-colors duration-700" />

              <div className="relative z-10 flex flex-col items-center w-full">
                <p className="flex items-center gap-3 text-alaz-orange font-black text-xs uppercase tracking-[0.3em] mb-2">
                  <span className="h-px w-6 bg-current opacity-50" aria-hidden="true" />
                  {t("dashboard.step1")}
                  <span className="h-px w-6 bg-current opacity-50" aria-hidden="true" />
                </p>

                {/* Misafire konuşuyor: TV'yi okuyan, mekân sahibi değil misafir. */}
                <h3 className="text-white font-black text-3xl mb-2 uppercase tracking-wide text-center leading-tight">
                  {t("dashboard.joinTitle")}
                </h3>

                <p className="text-white/65 text-base font-medium text-center px-2 mb-3 leading-snug text-balance">
                  {t("dashboard.joinBody")}
                </p>

                {/* Odanın öbür ucundan okunabilsin: BeamBorder ile vurgulu QR */}
                <BeamBorder
                  rgb="255,85,0"
                  duration={6}
                  thickness={2}
                  radius="1.25rem"
                  innerClassName="bg-white p-3.5 shadow-[0_0_40px_rgba(255,85,0,0.2)] flex items-center justify-center"
                >
                  <QRCodeSVG data-testid="join-qr" value={joinUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" marginSize={1} />
                </BeamBorder>

                <div className="mt-3 flex flex-col items-center">
                  <span className="text-white/50 text-sm uppercase tracking-[0.3em] font-bold mb-1.5">{t("hostHeader.roomCode")}</span>
                  <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl flex items-center justify-center">
                    <p className="text-alaz-orange font-mono font-black text-3xl tracking-widest drop-shadow-[0_0_15px_rgba(255,85,0,0.5)]">{room.code}</p>
                  </div>
                </div>

                {rewardsBlocked && (
                  <p className="mt-4 text-amber-300/80 text-[11px] font-bold uppercase tracking-[0.15em] text-center text-balance">
                    {t("dashboard.rewardsNeedStaff")}
                  </p>
                )}

                {venue.promo_images && venue.promo_images.length > 0 && (
                  <button
                    onClick={() => setIsKioskMode(true)}
                    className="mt-8 w-full py-3 bg-white/5 hover:bg-white/15 border border-white/20 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] transition-colors"
                  >
                    {t("dashboard.kioskStart")}
                  </button>
                )}
              </div>
            </div>

            {/* Eskiden max-h-[250px] + overflow-y-auto: QR kartının altında
                ~157px kalıyordu, TV'de kimse kaydıramadığı için 8 misafirden
                yalnız 3'ü görünüyordu. Artık kalan yüksekliği dolduruyor,
                satırlar sıkı ve sığmayanlar tek satırda özetleniyor. */}
            <div className="flex-1 min-h-0 bg-[#0b0b14]/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-gray-300 font-black text-base uppercase tracking-widest">
                  {t("dashboard.playersCount", players.length)}
                </h3>
                {/* Gece puanı dağıtılmışsa finale geçilebilir (bkz. NightFinale). */}
                {players.some((p) => (p.night_score ?? 0) > 0) && (
                  <ShimmerButton
                    onClick={() => setShowFinale(true)}
                    color="yellow"
                    thickness={1.5}
                    radius="9999px"
                    innerClassName="px-3 py-1 bg-amber-300/15 text-amber-200 text-[11px] font-black uppercase tracking-[0.2em]"
                  >
                    🏆 {t("finale.open")}
                  </ShimmerButton>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden space-y-1.5">
                {players.length === 0 ? (
                  <div className="text-gray-400 text-base text-center mt-10">{t("dashboard.waiting")}</div>
                ) : (
                  leaderboard.slice(0, DASHBOARD_LIST_MAX).map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex justify-between items-center gap-3"
                    >
                      <span className="w-6 text-center text-sm font-black text-white/40 tabular-nums" aria-hidden="true">
                        {(p.night_score ?? 0) > 0 && i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </span>
                      <span className="flex-1 min-w-0 truncate font-bold text-lg text-white">{p.nickname}</span>
                      {deltas[p.id] !== 0 && (
                        <motion.span
                          key={`${p.id}-${ranks.key}`}
                          initial={{ opacity: 0, y: deltas[p.id] > 0 ? 6 : -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-xs font-black tabular-nums ${deltas[p.id] > 0 ? "text-emerald-400" : "text-red-400"}`}
                          aria-label={t(deltas[p.id] > 0 ? "dashboard.rankUp" : "dashboard.rankDown", Math.abs(deltas[p.id]))}
                        >
                          {deltas[p.id] > 0 ? "▲" : "▼"}{Math.abs(deltas[p.id])}
                        </motion.span>
                      )}
                      <span className="text-alaz-orange font-mono text-sm tabular-nums">
                        <NumberTicker value={p.night_score || 0} suffix={` ${t("dashboard.pointsSuffix", "").trim()}`} className="text-alaz-orange font-mono text-sm" />
                      </span>
                    </motion.div>
                  ))
                )}
                {players.length > DASHBOARD_LIST_MAX && (
                  <p className="pt-1 text-center text-base font-bold text-white/50">
                    {t("common.morePlayers", players.length - DASHBOARD_LIST_MAX)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Game Selection Column */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[500px]">
              <h2 className="text-lg font-black text-white/45 uppercase tracking-[0.3em] mb-6">
                {t("host.step2")}<span className="text-white">{t("host.selectGame")}</span>
              </h2>
              
              <div className="relative w-full max-w-4xl aspect-[21/9] flex items-center justify-center perspective-1000">
                {/* Carousel Left Arrow */}
                <button
                  onClick={() => paginate(-1)}
                  className="absolute left-0 z-20 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-xl -ml-8"
                >
                  <ChevronLeft className="w-8 h-8 text-white opacity-80" />
                </button>

                <div className="w-full h-full relative overflow-visible flex items-center justify-center px-4">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={carouselIndex}
                      custom={direction}
                      initial={{ opacity: 0, x: direction > 0 ? 300 : -300, scale: 0.8, rotateY: direction > 0 ? -15 : 15 }}
                      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, x: direction < 0 ? 300 : -300, scale: 0.8, rotateY: direction < 0 ? -15 : 15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 flex items-center justify-center p-4"
                    >
                      {(() => {
                        const game = GAMES[carouselIndex];
                        return (
                          <BeamBorder
                            rgb={rgbOf(game.shadowColor)}
                            duration={7}
                            radius="2rem"
                            className="w-full h-full"
                            innerClassName="bg-[#0b0b14]"
                            style={{ boxShadow: `0 30px 80px ${game.shadowColor}` }}
                          >
                          <button
                            onClick={() => handleStartGame(game.id)}
                            disabled={game.isComingSoon}
                            className={`w-full h-full relative group overflow-hidden rounded-[calc(2rem-1.5px)] p-8 sm:p-10 text-left transition-all duration-500 ${
                              game.isComingSoon ? "cursor-not-allowed" : ""
                            }`}
                          >
                            {/* Devasa Filigran Animasyonlu Logo */}
                            <div className="absolute -right-12 -bottom-12 opacity-[0.05] group-hover:opacity-15 transition-all duration-1000 pointer-events-none scale-150 rotate-12">
                              <GameAnimatedLogo game={game.id} size="watermark" glow={false} />
                            </div>

                            {/* Arka Plan Glow */}
                            <div className={`absolute -right-20 -top-20 w-72 h-72 ${game.bgAccent} rounded-full blur-[90px] ${game.hoverBgAccent} transition-colors duration-700 pointer-events-none`} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 flex items-center justify-between h-full gap-6">
                              {/* Sol Taraf: Kategori, Başlık, Açıklama, Başlat Butonu */}
                              <div className="flex-1 flex flex-col justify-between h-full pr-2">
                                <div>
                                  <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${game.iconAccent} border-2 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-xl backdrop-blur-md relative overflow-hidden shrink-0`}>
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
                                      <GameAnimatedLogo game={game.id} size="md" glow={!game.isComingSoon} className="w-12 h-12" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="self-start rounded-full border border-white/15 bg-white/[0.08] px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-white/80">
                                          {t(GAME_CATEGORY_KEY[game.category])}
                                        </span>
                                        {game.isComingSoon && (
                                          <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5">
                                            <span>🔒</span>
                                            <span>{t("dashboard.comingSoon", "BALD VERFÜGBAR")}</span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 font-bold">
                                        MOD {carouselIndex + 1} / {GAMES.length}
                                      </span>
                                    </div>
                                  </div>

                                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-widest transition-colors uppercase leading-tight font-sans">
                                    {game.titlePrefix} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${game.gradientText}`}>{game.titleHighlight}</span>
                                  </h3>
                                  <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mt-3 max-w-xl font-medium">
                                    {t(game.descKey)}
                                  </p>
                                </div>
                                
                                <div className="mt-6 flex items-center gap-4 text-white text-xs sm:text-sm font-black tracking-[0.25em] uppercase">
                                  {game.isComingSoon ? (
                                    <div className="bg-white/5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md border border-white/10 text-white/40 cursor-not-allowed shadow-none">
                                      <span className="text-base">🔒</span>
                                      <span>{t("dashboard.comingSoon", "BALD VERFÜGBAR")}</span>
                                    </div>
                                  ) : (
                                    <div className="bg-white/10 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all shadow-lg group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                                      <span>{t("dashboard.startSession", "SESSION STARTEN")}</span>
                                      <span className="text-xl sm:text-2xl leading-none group-hover:translate-x-2 transition-transform">➔</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Sağ Taraf: Büyük Canlı Hareketli Logo Sahnesi (TV için WOW Etkisi) */}
                              <div className="hidden sm:flex relative items-center justify-center w-48 h-48 md:w-60 md:h-60 shrink-0">
                                <motion.div
                                  className="absolute inset-0 rounded-full border border-white/10 opacity-50 pointer-events-none"
                                  animate={{ rotate: 360, scale: [1, 1.06, 1] }}
                                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                  className="absolute inset-4 rounded-full border border-dashed border-white/15 opacity-35 pointer-events-none"
                                  animate={{ rotate: -360 }}
                                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                                />
                                <div className={`absolute inset-6 rounded-full ${game.bgAccent} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                                
                                <div className={`relative z-10 transition-transform duration-700 ${game.isComingSoon ? "opacity-75 grayscale-[25%]" : "group-hover:scale-110"}`}>
                                  <GameAnimatedLogo game={game.id} size="xl" glow={!game.isComingSoon} className="w-44 h-44 md:w-52 md:h-52 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                                </div>
                                {game.isComingSoon && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                      🔒
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          </BeamBorder>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Right Arrow */}
                <button
                  onClick={() => paginate(1)}
                  className="absolute right-0 z-20 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-xl -mr-8"
                >
                  <ChevronRight className="w-8 h-8 text-white opacity-80" />
                </button>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8 max-w-md">
                {GAMES.map((g, idx) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setDirection(idx > carouselIndex ? 1 : -1);
                      setCarouselIndex(idx);
                    }}
                    aria-label={`${g.titlePrefix} ${g.titleHighlight}${g.isComingSoon ? " (Locked)" : ""}`}
                    aria-current={idx === carouselIndex}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === carouselIndex
                        ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                        : g.isComingSoon
                          ? 'w-2 bg-white/15 hover:bg-white/30'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showShowcase && (
          <HostShowcase
            key="showcase"
            joinUrl={joinUrl}
            roomCode={room.code}
            venuePromos={venue.promo_images}
            onClose={() => setIsKioskMode(false)}
          />
        )}
      </AnimatePresence>

      {/* Game Setup Modal */}
      {showFinale && <NightFinale players={players} onClose={() => setShowFinale(false)} onEndNight={endNight} />}

      <GameSettingsModal
        isOpen={!!setupGameMode}
        game={setupGameMode}
        room={room}
        onClose={() => setSetupGameMode(null)}
        onStart={executeStartGame}
      />
    </div>
    </TVScaleFrame>
  );
}

/** "rgba(255,85,0,0.4)" → "255,85,0" (BeamBorder ışık rengi için). */
function rgbOf(color: string): string {
  const m = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? `${m[1]},${m[2]},${m[3]}` : "255,85,0";
}
