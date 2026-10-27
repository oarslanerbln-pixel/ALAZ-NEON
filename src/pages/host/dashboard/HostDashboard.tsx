import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import { SoundManager, sounds } from "../../../lib/audio";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import type { Room, Player, GameType } from "../../../types/database";

import { GameSettingsModal } from "../components/GameSettingsModal";
import { GAME_CARDS, GAME_CATEGORY_KEY } from "../../../lib/gameCatalog";
import { activePlayers as activePlayersOf } from "../../../lib/liveness";
import { useLocale } from "../../../hooks/useLocale";
import { useIsStaff } from "../../../hooks/useIsStaff";
import { useVenue } from "../../../contexts/VenueContextCore";
import { NumberTicker, GameAnimatedLogo } from "../../../components/fx";
import { DURATION } from "../../../lib/motion";
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
const DASHBOARD_LIST_MAX = 5;

/**
 * Kart sırası: oynanabilir modlar önce, kilitliler sonda (sıralama
 * kararlı; grup içinde katalog sırası korunur).
 */
const GAMES = [...GAME_CARDS].sort((a, b) => Number(Boolean(a.isComingSoon)) - Number(Boolean(b.isComingSoon)));

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

  // Game Setup State
  const [setupGameMode, setSetupGameMode] = useState<GameType | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  // Gece lobisi bir süre boş kalınca TV tanıtım döngüsüne geçer; kurulum
  // penceresi ya da finale açıkken geçmez. İlk dokunuşta kapanır.
  const showShowcase = useIdle(SHOWCASE_IDLE_MS, room.status === "night_lobby" && !setupGameMode && !showFinale);

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
      const { category, used } = nextBombCategory(settings?.categories || room.categories, [], room.locale);

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
    <div className="w-full h-full relative overflow-hidden">
      <div className="px-24 py-12 flex flex-col h-full relative">
        <HostHeader
          room={room}
          exitConfirmKey="common.confirmEndNight"
          exitLabelKey="common.endNight"
          onExitToHome={endNight}
        />

        <div className="flex-1 min-h-0 grid grid-cols-[560px_1fr] gap-12">
          {/* Katılım (misafire konuşur) + gecenin sıralaması */}
          <div className="flex flex-col gap-6 min-h-0">
            <div className="surface rounded-3xl p-8 flex flex-col items-center text-center">
              <h3 className="text-4xl font-extrabold text-ink tracking-tight">{t("dashboard.joinTitle")}</h3>
              <p className="mt-2 text-2xl text-ink-2 leading-snug text-balance">{t("dashboard.joinBody")}</p>
              <div className="mt-6 bg-white p-4 rounded-2xl">
                <QRCodeSVG data-testid="join-qr" value={joinUrl} size={240} bgColor="#ffffff" fgColor="#000000" level="H" marginSize={1} />
              </div>
              {rewardsBlocked && (
                <p className="mt-4 text-2xl text-accent text-balance">{t("dashboard.rewardsNeedStaff")}</p>
              )}
            </div>

            {/* Eskiden max-h-[250px] + overflow-y-auto: TV'de kimse
                kaydıramıyordu. Satırlar kalan yüksekliğe sığar, sığmayanlar
                tek satırda özetlenir. */}
            <div className="flex-1 min-h-0 surface rounded-3xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-2xl font-semibold text-ink-2">{t("dashboard.playersCount", players.length)}</h3>
                {/* Gece puanı dağıtılmışsa finale geçilebilir (bkz. NightFinale). */}
                {players.some((p) => (p.night_score ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={() => setShowFinale(true)}
                    className="btn-secondary px-4 h-12 text-2xl"
                  >
                    {t("finale.open")}
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
                {players.length === 0 ? (
                  <div className="text-ink-3 text-2xl text-center mt-8">{t("dashboard.waiting")}</div>
                ) : (
                  leaderboard.slice(0, DASHBOARD_LIST_MAX).map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: DURATION.base }}
                      className="flex items-center gap-4 h-12"
                    >
                      <span className="w-8 text-2xl font-semibold text-ink-3 tabular-nums" aria-hidden="true">{i + 1}</span>
                      <span className="flex-1 min-w-0 truncate text-2xl font-semibold text-ink">{p.nickname}</span>
                      {deltas[p.id] !== 0 && (
                        <span
                          className={`text-2xl font-semibold tabular-nums ${deltas[p.id] > 0 ? "text-ok" : "text-bad"}`}
                          aria-label={t(deltas[p.id] > 0 ? "dashboard.rankUp" : "dashboard.rankDown", Math.abs(deltas[p.id]))}
                        >
                          {deltas[p.id] > 0 ? "▲" : "▼"}{Math.abs(deltas[p.id])}
                        </span>
                      )}
                      <NumberTicker
                        value={p.night_score || 0}
                        suffix={` ${t("dashboard.pointsSuffix", "").trim()}`}
                        className="text-2xl text-accent tabular-nums"
                      />
                    </motion.div>
                  ))
                )}
                {players.length > DASHBOARD_LIST_MAX && (
                  <p className="pt-1 text-2xl text-ink-3">{t("common.morePlayers", players.length - DASHBOARD_LIST_MAX)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Oyun seçimi (personel): dört kart, karusel yok */}
          <div className="flex flex-col min-h-0">
            <h2 className="text-3xl font-semibold text-ink-2 mb-6">{t("host.selectGame")}</h2>
            <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-6">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleStartGame(game.id)}
                  // Kilitli kart tıklanabilir kalır (yalnız uyarı sesi): ad
                  // ekran okuyucuya ve testlere "(Locked)" ile duyurulur.
                  aria-label={`${game.titlePrefix} ${game.titleHighlight}${game.isComingSoon ? " (Locked)" : ""}`}
                  className={`group surface rounded-3xl p-8 flex flex-col text-left transition-colors ${
                    game.isComingSoon ? "opacity-50 cursor-not-allowed" : "hover:border-accent/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center text-accent">
                      <GameAnimatedLogo game={game.id} size="md" className="w-12 h-12" />
                    </span>
                    <span className="text-2xl text-ink-3">
                      {game.isComingSoon ? t("dashboard.comingSoon", "BALD VERFÜGBAR") : t(GAME_CATEGORY_KEY[game.category])}
                    </span>
                  </div>
                  <h3 className="mt-6 text-5xl font-extrabold text-ink tracking-tight">
                    {game.titlePrefix} <span className="text-accent">{game.titleHighlight}</span>
                  </h3>
                  <p className="mt-3 text-2xl text-ink-2 leading-snug line-clamp-3">{t(game.descKey)}</p>
                  {!game.isComingSoon && (
                    <span className="mt-auto pt-4 text-2xl font-semibold text-ink-3 group-hover:text-accent transition-colors">
                      {t("dashboard.startSession", "SESSION STARTEN")} →
                    </span>
                  )}
                </button>
              ))}
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
