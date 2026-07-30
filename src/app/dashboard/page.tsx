"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  buscarPokemon,
  buscarSugerenciasPokemon,
  PokemonData,
} from "@/lib/pokeapi";
import {
  guardarPokemonSlotAction,
  eliminarPokemonSlotAction,
  actualizarPerfilAction,
} from "./actions";
import {
  TwitchIcon,
  YoutubeIcon,
  KickIcon,
  TiktokIcon,
} from "@/components/SocialIcons";
import type {
  PerfilData,
  ClasificacionData,
  PokemonSlot,
  NotificacionItem,
} from "./dashboard";
import { TYPE_COLORS, LISTA_PAISES } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [stats, setClasificacion] = useState<ClasificacionData | null>(null);
  const [equipo, setEquipo] = useState<PokemonSlot[]>([]);
  const [starterData, setStarterData] = useState<PokemonData | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [faseActual, setFaseActual] = useState<string>("REGISTRO");

  // Modal para agregar/cambiar Pokémon en un slot
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const [busquedaPoke, setBusquedaPoke] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [selectedPoke, setSelectedPoke] = useState<PokemonData | null>(null);
  const [savingSlot, setSavingSlot] = useState(false);

  // Modal para editar perfil
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editMinecraft, setEditMinecraft] = useState("");
  const [editPais, setEditPais] = useState("ND");
  const [editTwitch, setEditTwitch] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [editKick, setEditKick] = useState("");
  const [editTiktok, setEditTiktok] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Notificaciones estáticas o dinámicas
  const [notificaciones] = useState<NotificacionItem[]>([
    {
      id: "1",
      titulo: "Fase de Registro Activa",
      mensaje:
        "Asegúrate de configurar los 6 slots de tu equipo antes del inicio oficial.",
      fecha: "Hoy",
      tipo: "info",
    },
    {
      id: "2",
      titulo: "Reglamento del Torneo",
      mensaje:
        "El Slot #1 está reservado obligatoriamente para tu Pokémon Inicial.",
      fecha: "Ayer",
      tipo: "warning",
    },
    {
      id: "3",
      titulo: "Dispositivo Rotom Conectado",
      mensaje:
        "Tu perfil ha sido vinculado exitosamente con Supabase y Discord.",
      fecha: "Reciente",
      tipo: "success",
    },
  ]);

  const loadTrainerData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: configData } = await supabase
      .from("configuracion_torneo")
      .select("fase_actual")
      .eq("id", 1)
      .single();

    if (configData) {
      setFaseActual(configData.fase_actual);
    }

    if (!user) {
      router.push("/");
      return;
    }
    setUserAvatar(user.user_metadata?.avatar_url || "/rotom-avatar.png");
    // 1. Cargar perfil desde Supabase
    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!perfilData) {
      router.push("/registro");
      return;
    }
    // 2. Cargar clasificación
    const { data: clasificacionData } = await supabase
      .from("clasificacion")
      .select("elo, rango, victorias, derrotas")
      .eq("perfil_id", user.id)
      .single();
    // 3. Cargar equipo de 6 slots
    const { data: equipoData } = await supabase
      .from("equipos_pokemon")
      .select("slot, pokemon_id, nombre, sprite_url")
      .eq("perfil_id", user.id);
    const equipoConTipos = await Promise.all(
      (equipoData || []).map(async (slot) => {
        const poke = await buscarPokemon(slot.nombre);
        return { ...slot, tipos: poke?.types || ["normal"] };
      }),
    );
    let slotsActuales: PokemonSlot[] = equipoConTipos;
    // Lógica del Slot #1: Sincronizar automáticamente con el Pokémon Inicial
    if (perfilData.pokemon_inicial_nom) {
      const pStarter = await buscarPokemon(perfilData.pokemon_inicial_nom);
      if (pStarter) {
        setStarterData(pStarter);
        // Auto-guardar en Slot #1 si no existe en la BD
        const slot1Existe = slotsActuales.some((p) => p.slot === 1);
        if (!slot1Existe) {
          const resSlot1 = await guardarPokemonSlotAction(
            user.id,
            1,
            pStarter.id,
            pStarter.name,
            pStarter.sprite,
          );
          if (resSlot1.success && resSlot1.equipo) {
            slotsActuales = [resSlot1.equipo as PokemonSlot, ...slotsActuales];
          }
        }
      }
    }
    setPerfil(perfilData);
    setClasificacion(clasificacionData);
    setEquipo(slotsActuales);
    // Preparar estado del formulario de edición
    setEditNombre(perfilData.nombre_streamer);
    setEditMinecraft(perfilData.minecraft_uuid);
    setEditPais(perfilData.pais || "ND");
    setEditTwitch(perfilData.redes_sociales?.twitch || "");
    setEditYoutube(perfilData.redes_sociales?.youtube || "");
    setEditKick(perfilData.redes_sociales?.kick || "");
    setEditTiktok(perfilData.redes_sociales?.tiktok || "");
    setLoading(false);
  }, [router]);
  useEffect(() => {
    const init = async () => {
      await loadTrainerData();
    };

    init();
  }, [loadTrainerData]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  // Autocomplete de Pokémon para el Modal
  const handleInputChangePoke = async (text: string) => {
    setBusquedaPoke(text);
    if (text.length >= 2) {
      const sug = await buscarSugerenciasPokemon(text);
      setSugerencias(sug);
    } else {
      setSugerencias([]);
    }
  };
  const seleccionarPokemon = async (nombre: string) => {
    setSugerencias([]);
    setBusquedaPoke(nombre);
    const poke = await buscarPokemon(nombre);
    setSelectedPoke(poke);
  };
  const handleSaveSlot = async () => {
    if (!perfil || !modalSlot || !selectedPoke) return;
    setSavingSlot(true);
    const res = await guardarPokemonSlotAction(
      perfil.id,
      modalSlot,
      selectedPoke.id,
      selectedPoke.name,
      selectedPoke.sprite,
    );
    if (res.success && res.equipo) {
      setEquipo((prev) => {
        const filtrado = prev.filter((p) => p.slot !== modalSlot);
        return [...filtrado, res.equipo as PokemonSlot];
      });
      closeModal();
    } else {
      alert("Error al guardar el Pokémon en el slot");
    }
    setSavingSlot(false);
  };
  const handleRemoveSlot = async (slot: number) => {
    if (!perfil) return;
    if (slot === 1) {
      alert(
        "El Slot #1 es reservado para tu Pokémon Inicial y no se puede eliminar.",
      );
      return;
    }
    if (!confirm(`¿Deseas quitar el Pokémon del Slot #${slot}?`)) return;
    const res = await eliminarPokemonSlotAction(perfil.id, slot);
    if (res.success) {
      setEquipo((prev) => prev.filter((p) => p.slot !== slot));
    }
  };
  const closeModal = () => {
    setModalSlot(null);
    setBusquedaPoke("");
    setSugerencias([]);
    setSelectedPoke(null);
  };
  // Guardar Edición del Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    setSavingProfile(true);
    const res = await actualizarPerfilAction({
      perfilId: perfil.id,
      nombreStreamer: editNombre,
      minecraftUuid: editMinecraft,
      pais: editPais,
      redesSociales: {
        twitch: editTwitch || undefined,
        youtube: editYoutube || undefined,
        kick: editKick || undefined,
        tiktok: editTiktok || undefined,
      },
    });
    if (res.success) {
      setIsEditProfileOpen(false);
      await loadTrainerData();
    } else {
      alert(`Error al actualizar perfil: ${res.error}`);
    }
    setSavingProfile(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 font-mono flex items-center justify-center">
        CONECTANDO DISPOSITIVO ROTOM...
      </div>
    );
  }
  const paisObj = LISTA_PAISES.find((p) => p.code === perfil?.pais);
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-8 pt-28 text-white">
      {/* Fondo conceptual */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/70 backdrop-blur-md" />
      {/* CONTENEDOR PRINCIPAL: ESTRUCTURA DE 3 COLUMNAS EXACTAS */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =============== LADO IZQUIERDO =============== */}
        <div className="lg:col-span-3 space-y-5 bg-gray-900/90 border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.12)]">
          {/* Header con Foto y Nombre */}
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-gray-800">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              />
              <span className="absolute bottom-0 right-1 bg-cyan-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                MAESTRO
              </span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl font-black uppercase text-white tracking-wide">
                  {perfil?.nombre_streamer}
                </h1>
                {paisObj?.iso ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://flagcdn.com/w40/${paisObj.iso}.png`}
                    alt={paisObj.name}
                    className="w-5 h-3.5 object-cover rounded shadow"
                  />
                ) : (
                  <span className="text-xs">🌐</span>
                )}
              </div>
              <p className="text-xs font-mono text-gray-400 mt-0.5">
                MC:{" "}
                <span className="text-cyan-300 font-bold">
                  {perfil?.minecraft_uuid}
                </span>
              </p>
            </div>
            {/* Iconos de Redes Sociales */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 w-full">
              {perfil?.redes_sociales?.twitch && (
                <a
                  href={perfil.redes_sociales.twitch}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/30 border border-purple-500/50 hover:bg-purple-600/50 rounded-lg text-purple-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <TwitchIcon className="w-3.5 h-3.5" /> Twitch
                </a>
              )}
              {perfil?.redes_sociales?.youtube && (
                <a
                  href={perfil.redes_sociales.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 border border-red-500/50 hover:bg-red-600/50 rounded-lg text-red-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" /> YouTube
                </a>
              )}
              {perfil?.redes_sociales?.kick && (
                <a
                  href={perfil.redes_sociales.kick}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 border border-green-500/50 hover:bg-green-600/50 rounded-lg text-green-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <KickIcon className="w-3.5 h-3.5" /> Kick
                </a>
              )}
              {perfil?.redes_sociales?.tiktok && (
                <a
                  href={perfil.redes_sociales.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-900/30 border border-pink-500/50 hover:bg-pink-600/50 rounded-lg text-pink-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <TiktokIcon className="w-3.5 h-3.5" /> TikTok
                </a>
              )}
            </div>
          </div>
          {/* Tarjeta del Pokémon Inicial asignado */}
          <div className="bg-black/50 border border-cyan-500/20 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">
              ⭐ Pokémon Inicial
            </span>
            {starterData ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={starterData.sprite}
                  alt={starterData.name}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="font-extrabold uppercase text-white text-sm">
                    {starterData.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    ID PokéAPI: #{starterData.id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No asignado</p>
            )}
          </div>
          {/* Estadísticas Competitivas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/60 border border-yellow-500/30 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block">
                ELO
              </span>
              <span className="text-lg font-black text-yellow-400">
                {stats?.elo ?? 1000}
              </span>
            </div>
            <div className="bg-black/60 border border-cyan-500/30 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block">
                RANGO
              </span>
              <span className="text-lg font-black text-cyan-400">
                {stats?.rango ?? "Normal"}
              </span>
            </div>
            <div className="bg-black/60 border border-green-500/30 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block">
                VICTORIAS
              </span>
              <span className="text-lg font-black text-green-400">
                {stats?.victorias ?? 0}
              </span>
            </div>
            <div className="bg-black/60 border border-red-500/30 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block">
                DERROTAS
              </span>
              <span className="text-lg font-black text-red-400">
                {stats?.derrotas ?? 0}
              </span>
            </div>
          </div>
          {/* Botones de Acción del Perfil */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full bg-cyan-600/30 border border-cyan-500/50 hover:bg-cyan-600 text-cyan-300 hover:text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              ⚙️ Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600/20 border border-red-500/40 hover:bg-red-600 text-red-300 hover:text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
        {/* =============== GESTOR DE EQUIPO =============== */}
        <div className="lg:col-span-6 space-y-4 bg-gray-900/90 border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.12)]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                ⚡ Equipo Pokémon (6 Slots)
              </h2>
              <p className="text-xs text-gray-400">
                El Slot #1 es reservado para tu Pokémon Inicial.
              </p>
              <p className="text-xs text-gray-400">
                {faseActual === "REGISTRO"
                  ? "Fase de Edición Activa: Modifica tus slots antes del inicio."
                  : "🔒 Fase Bloqueada: El equipo está congelado para la competencia."}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  faseActual === "REGISTRO"
                    ? "bg-green-500/20 text-green-300 border-green-500/40"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                }`}
              >
                {faseActual === "REGISTRO" ? "EDITABLE" : "🔒 BLOQUEADO"}
              </span>
              <span className="text-xs font-mono font-bold bg-black/60 border border-cyan-500/40 px-3 py-1 rounded-full text-cyan-300">
                {equipo.length}/6 Slots
              </span>
            </div>
          </div>
          {/* Grid de 6 Slots de Pokémon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((slotNum) => {
              const pokemonEnSlot = equipo.find((p) => p.slot === slotNum);
              const esSlotStarter = slotNum === 1;
              // Determinar color del borde y sombra según el tipo principal del Pokémon
              const tipoPrincipal = pokemonEnSlot?.tipos?.[0] || "normal";
              const colorHex = TYPE_COLORS[tipoPrincipal] || "#06b6d4";
              return (
                <div
                  key={slotNum}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-between min-h-[220px] ${
                    pokemonEnSlot
                      ? "bg-gray-900/90"
                      : "bg-black/40 border-dashed border-gray-800 hover:border-cyan-500/30"
                  }`}
                  style={
                    pokemonEnSlot
                      ? {
                          borderColor: colorHex,
                          boxShadow: `0 0 20px ${colorHex}25`,
                        }
                      : undefined
                  }
                >
                  {/* Badge del Slot dinámico */}
                  <span
                    className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border`}
                    style={
                      pokemonEnSlot
                        ? {
                            backgroundColor: `${colorHex}20`,
                            color: colorHex,
                            borderColor: `${colorHex}50`,
                          }
                        : {
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#9ca3af",
                            borderColor: "#1f2937",
                          }
                    }
                  >
                    {esSlotStarter ? "⭐ Starter" : `Slot #${slotNum}`}
                  </span>
                  {pokemonEnSlot ? (
                    <>
                      {/* Imagen con Drop Shadow del color de su tipo */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pokemonEnSlot.sprite_url}
                        alt={pokemonEnSlot.nombre}
                        className="w-24 h-24 object-contain mt-2 transition-transform hover:scale-110"
                        style={{
                          filter: `drop-shadow(0 0 12px ${colorHex}90)`,
                        }}
                      />
                      <div className="text-center mt-1">
                        <p
                          className="font-black uppercase text-sm"
                          style={{ color: colorHex }}
                        >
                          {pokemonEnSlot.nombre}
                        </p>
                        {/* Renderizado de los Tipos */}
                        <div className="flex justify-center gap-1.5 mt-1.5">
                          {pokemonEnSlot.tipos?.map((t) => (
                            <span
                              key={t}
                              className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border"
                              style={{
                                backgroundColor: `${TYPE_COLORS[t]}20`,
                                borderColor: TYPE_COLORS[t],
                                color: TYPE_COLORS[t],
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full mt-3">
                        {!esSlotStarter && faseActual === "REGISTRO" && (
                          <>
                            <button
                              onClick={() => setModalSlot(slotNum)}
                              className="flex-1 bg-gray-800 hover:bg-gray-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors uppercase text-white"
                            >
                              Cambiar
                            </button>
                            <button
                              onClick={() => handleRemoveSlot(slotNum)}
                              className="px-3 bg-red-900/40 border border-red-500/40 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {!esSlotStarter && faseActual !== "REGISTRO" && (
                          <span
                            className="w-full text-center text-[10px] font-bold py-1.5 rounded-lg border uppercase"
                            style={{
                              backgroundColor: `${colorHex}15`,
                              color: colorHex,
                              borderColor: `${colorHex}40`,
                            }}
                          >
                            🔒 Slot Confirmado
                          </span>
                        )}
                      </div>
                    </>
                  ) : faseActual === "REGISTRO" ? (
                    <div className="flex flex-col items-center justify-center my-auto space-y-3 w-full">
                      <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 text-lg font-bold">
                        +
                      </div>
                      <button
                        onClick={() => setModalSlot(slotNum)}
                        className="w-full py-2 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-bold uppercase rounded-lg transition-all"
                      >
                        Añadir Pokémon
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-auto space-y-3 w-full">
                      <div className="w-full text-center text-[10px] font-bold py-2 rounded-lg border border-gray-700 bg-gray-900/70 text-gray-300 uppercase">
                        🔒 Slot bloqueado
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* =============== NOTIFICACIONES =============== */}
        <div className="lg:col-span-3 space-y-4 bg-gray-900/90 border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.12)]">
          <div className="border-b border-gray-800 pb-3">
            <h2 className="text-lg font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              🔔 Notificaciones
            </h2>
            <p className="text-xs text-gray-400">
              Centro de alertas del Dispositivo Rotom
            </p>
          </div>
          <div className="space-y-3">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className="bg-black/50 border border-gray-800 p-3.5 rounded-xl space-y-1.5 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      notif.tipo === "warning"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : notif.tipo === "success"
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    }`}
                  >
                    {notif.tipo}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {notif.fecha}
                  </span>
                </div>
                <h3 className="font-bold text-xs uppercase text-white">
                  {notif.titulo}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {notif.mensaje}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =============== MODALES =============== */}
      {/* BUSCADOR AUTOCOMPLETE DE POKÉMON                         */}
      {modalSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/40 w-full max-w-md p-6 rounded-2xl space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-black uppercase text-cyan-400">
                Seleccionar Pokémon - Slot #{modalSlot}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 relative">
              <input
                type="text"
                value={busquedaPoke}
                onChange={(e) => handleInputChangePoke(e.target.value)}
                placeholder="Escribe el nombre (ej. Lucario, Gengar, Dragonite)..."
                className="w-full bg-black/70 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              {sugerencias.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-gray-900 border border-cyan-500/40 rounded-lg mt-1 z-50 shadow-2xl overflow-hidden">
                  {sugerencias.map((item) => (
                    <li
                      key={item}
                      onClick={() => seleccionarPokemon(item)}
                      className="px-4 py-2.5 hover:bg-cyan-600/30 text-sm font-bold uppercase cursor-pointer border-b border-gray-800 last:border-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedPoke && (
              <div className="flex items-center gap-4 bg-black/60 p-4 rounded-xl border border-cyan-500/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPoke.sprite}
                  alt={selectedPoke.name}
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <p className="font-extrabold uppercase text-cyan-400 text-lg">
                    {selectedPoke.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tipos: {selectedPoke.types.join(", ")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-xs font-bold py-3 rounded-lg uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSlot}
                disabled={!selectedPoke || savingSlot}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-lg uppercase tracking-wider transition-all"
              >
                {savingSlot ? "Guardando..." : "Confirmar Slot"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EDITAR PERFIL Y REDES SOCIALES                          */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/40 w-full max-w-lg p-6 rounded-2xl space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.2)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-black uppercase text-cyan-400">
                Editar Datos del Entrenador
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-300 mb-1">
                  Nombre de Streamer
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-300 mb-1">
                  Nick de Minecraft
                </label>
                <input
                  type="text"
                  required
                  value={editMinecraft}
                  onChange={(e) => setEditMinecraft(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-300 mb-1">
                  País de Representación
                </label>
                <select
                  value={editPais}
                  onChange={(e) => setEditPais(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {LISTA_PAISES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 border-t border-gray-800 pt-3">
                <label className="block text-xs font-bold uppercase text-cyan-300">
                  Redes Sociales
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-purple-400 mb-1">
                      Twitch
                    </label>
                    <input
                      type="url"
                      value={editTwitch}
                      onChange={(e) => setEditTwitch(e.target.value)}
                      placeholder="https://twitch.tv/..."
                      className="w-full bg-black/60 border border-purple-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-red-400 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={editYoutube}
                      onChange={(e) => setEditYoutube(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-black/60 border border-red-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-green-400 mb-1">
                      Kick
                    </label>
                    <input
                      type="url"
                      value={editKick}
                      onChange={(e) => setEditKick(e.target.value)}
                      placeholder="https://kick.com/..."
                      className="w-full bg-black/60 border border-green-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-pink-400 mb-1">
                      TikTok
                    </label>
                    <input
                      type="url"
                      value={editTiktok}
                      onChange={(e) => setEditTiktok(e.target.value)}
                      placeholder="https://tiktok.com/..."
                      className="w-full bg-black/60 border border-pink-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2.5 rounded-lg uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all"
                >
                  {savingProfile ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
