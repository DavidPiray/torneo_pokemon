"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  buscarPokemon,
  buscarSugerenciasPokemon,
  PokemonData,
} from "@/lib/pokeapi";
import { registrarEntrenadorAction } from "./actions";
import {
  TwitchIcon,
  YoutubeIcon,
  KickIcon,
  TiktokIcon,
} from "@/components/SocialIcons";

const LISTA_PAISES = [
  { code: "ND", iso: "", name: "Prefiero no decir / No definido" },
  { code: "ES", iso: "es", name: "España" },
  { code: "MX", iso: "mx", name: "México" },
  { code: "AR", iso: "ar", name: "Argentina" },
  { code: "CO", iso: "co", name: "Colombia" },
  { code: "CL", iso: "cl", name: "Chile" },
  { code: "PE", iso: "pe", name: "Perú" },
  { code: "EC", iso: "ec", name: "Ecuador" },
  { code: "VE", iso: "ve", name: "Venezuela" },
  { code: "GT", iso: "gt", name: "Guatemala" },
  { code: "CR", iso: "cr", name: "Costa Rica" },
  { code: "UY", iso: "uy", name: "Uruguay" },
  { code: "PY", iso: "py", name: "Paraguay" },
  { code: "BO", iso: "bo", name: "Bolivia" },
  { code: "DO", iso: "do", name: "Rep. Dominicana" },
  { code: "US", iso: "us", name: "Estados Unidos" },
];

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [discordUser, setDiscordUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Datos Básicos
  const [nombreStreamer, setNombreStreamer] = useState("");
  const [minecraftUuid, setMinecraftUuid] = useState("");
  const [pais, setPais] = useState("ND");

  // Redes Sociales (Con Switches/Checkboxes)
  const [enableTwitch, setEnableTwitch] = useState(false);
  const [twitch, setTwitch] = useState("");

  const [enableYoutube, setEnableYoutube] = useState(false);
  const [youtube, setYoutube] = useState("");

  const [enableKick, setEnableKick] = useState(false);
  const [kick, setKick] = useState("");

  const [enableTiktok, setEnableTiktok] = useState(false);
  const [tiktok, setTiktok] = useState("");

  // Pokémon Starter (Autocomplete)
  const [busquedaPoke, setBusquedaPoke] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [pokemonSeleccionado, setPokemonSeleccionado] =
    useState<PokemonData | null>(null);
  const [loadingPoke, setLoadingPoke] = useState(false);

  // Términos y Privacidad
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const defaultName =
        user.user_metadata?.custom_claims?.global_name ||
        user.user_metadata?.full_name ||
        "Entrenador";

      setDiscordUser({ id: user.id, name: defaultName });
      setNombreStreamer(defaultName); // Autocompletar con el nombre de Discord por defecto
    }
    checkAuth();
  }, [router]);

  // Autocomplete Pokémon al escribir
  const handleInputChangePoke = async (text: string) => {
    setBusquedaPoke(text);
    if (text.length >= 2) {
      const sug = await buscarSugerenciasPokemon(text);
      setSugerencias(sug);
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarPokemonSugerido = async (nombre: string) => {
    setLoadingPoke(true);
    setSugerencias([]);
    setBusquedaPoke(nombre);
    const poke = await buscarPokemon(nombre);
    setPokemonSeleccionado(poke);
    setLoadingPoke(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordUser || !aceptaTerminos) return;

    setLoading(true);

    const result = await registrarEntrenadorAction({
      id: discordUser.id,
      nombreStreamer,
      minecraftUuid,
      pais,
      pokemonInicialId: pokemonSeleccionado?.id,
      pokemonInicialNom: pokemonSeleccionado?.name,
      redesSociales: {
        twitch: enableTwitch ? twitch : undefined,
        youtube: enableYoutube ? youtube : undefined,
        kick: enableKick ? kick : undefined,
        tiktok: enableTiktok ? tiktok : undefined,
      },
    });

    if (!result.success) {
      alert(`Error al registrar: ${result.error}`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  if (!discordUser) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 font-mono flex items-center justify-center">
        CARGANDO DATOS DE DISCORD...
      </div>
    );
  }

  const paisObj = LISTA_PAISES.find((p) => p.code === pais);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 text-white pt-28 pb-16">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/85 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-3xl bg-gray-900/90 border border-cyan-500/30 p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-6">
        <div className="text-center space-y-1 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-black uppercase text-cyan-400 tracking-wider">
            Inscripción del Entrenador
          </h1>
          <p className="text-gray-400 text-sm">
            Dispositivo Rotom vinculado a{" "}
            <span className="text-cyan-300 font-bold">{discordUser.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identidad en la Competencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
                Nombre de Streamer / PJS
              </label>
              <input
                type="text"
                required
                value={nombreStreamer}
                onChange={(e) => setNombreStreamer(e.target.value)}
                placeholder="Nombre público"
                className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Por defecto es tu usuario de Discord. Puedes cambiarlo si
                gustas.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
                Usuario Exacto de Minecraft
              </label>
              <input
                type="text"
                required
                value={minecraftUuid}
                onChange={(e) => setMinecraftUuid(e.target.value)}
                placeholder="Ej. MiNickEnJuego"
                className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* País / Bandera */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
              País de Representación
            </label>
            <div className="flex items-center gap-3">
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="flex-1 bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors"
              >
                {LISTA_PAISES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Bandera Renderizada en HD (SVG) */}
              <div className="w-12 h-9 bg-black/60 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {paisObj?.iso ? (
                  <img
                    src={`https://flagcdn.com/w80/${paisObj.iso}.png`}
                    alt={paisObj.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">🌐</span>
                )}
              </div>
            </div>
          </div>

          {/* Pokémon Inicial (Starter Autocomplete) */}
          <div className="bg-gray-800/40 border border-cyan-500/20 p-4 rounded-xl space-y-3 relative">
            <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300">
              Pokémon Inicial Elegido (Starter)
            </label>

            <div className="relative">
              <input
                type="text"
                value={busquedaPoke}
                onChange={(e) => handleInputChangePoke(e.target.value)}
                placeholder="Empieza a escribir para buscar (ej. Fuecoco, Froakie, Pikachu)..."
                className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              />

              {/* Menú Desplegable con Sugerencias */}
              {sugerencias.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-gray-900 border border-cyan-500/40 rounded-lg mt-1 z-50 shadow-2xl overflow-hidden">
                  {sugerencias.map((item) => (
                    <li
                      key={item}
                      onClick={() => seleccionarPokemonSugerido(item)}
                      className="px-4 py-2.5 hover:bg-cyan-600/30 text-sm font-bold uppercase tracking-wider cursor-pointer border-b border-gray-800/50 last:border-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {loadingPoke && (
              <p className="text-xs text-cyan-400 animate-pulse">
                Cargando datos de PokéAPI...
              </p>
            )}

            {/* Vista previa del Pokémon seleccionado */}
            {pokemonSeleccionado && (
              <div className="flex items-center gap-4 bg-black/60 p-3 rounded-lg border border-cyan-500/40 mt-2">
                {pokemonSeleccionado.sprite ? (
                  <img
                    src={pokemonSeleccionado.sprite}
                    alt={pokemonSeleccionado.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center text-xs">
                    Sin Foto
                  </div>
                )}
                <div>
                  <p className="font-extrabold uppercase text-cyan-400 text-base">
                    {pokemonSeleccionado.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID PokéAPI: #{pokemonSeleccionado.id}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Redes Sociales con Switches */}
          <div className="space-y-3 bg-gray-800/20 p-4 rounded-xl border border-gray-800">
            <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300">
              Canales & Transmisión (Opcional)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Marca la casilla si deseas mostrar tu canal en tu ficha pública:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Twitch */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <input
                    type="checkbox"
                    checked={enableTwitch}
                    onChange={(e) => setEnableTwitch(e.target.checked)}
                    className="accent-purple-500 w-4 h-4 rounded"
                  />
                  <TwitchIcon className="w-4 h-4 text-purple-400" />
                  Twitch
                </label>
                {enableTwitch && (
                  <input
                    type="url"
                    value={twitch}
                    onChange={(e) => setTwitch(e.target.value)}
                    placeholder="https://twitch.tv/tu_usuario"
                    className="w-full bg-black/60 border border-purple-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              {/* YouTube */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <input
                    type="checkbox"
                    checked={enableYoutube}
                    onChange={(e) => setEnableYoutube(e.target.checked)}
                    className="accent-red-500 w-4 h-4 rounded"
                  />
                  <YoutubeIcon className="w-4 h-4 text-red-400" />
                  YouTube
                </label>
                {enableYoutube && (
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@tu_canal"
                    className="w-full bg-black/60 border border-red-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              {/* Kick */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
                  <input
                    type="checkbox"
                    checked={enableKick}
                    onChange={(e) => setEnableKick(e.target.checked)}
                    className="accent-green-500 w-4 h-4 rounded"
                  />
                  <KickIcon className="w-4 h-4 text-green-400" />
                  Kick
                </label>
                {enableKick && (
                  <input
                    type="url"
                    value={kick}
                    onChange={(e) => setKick(e.target.value)}
                    placeholder="https://kick.com/tu_usuario"
                    className="w-full bg-black/60 border border-green-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              {/* TikTok */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <input
                    type="checkbox"
                    checked={enableTiktok}
                    onChange={(e) => setEnableTiktok(e.target.checked)}
                    className="accent-gray-500 w-4 h-4 rounded"
                  />
                  <TiktokIcon className="w-4 h-4 text-gray-400" />
                  TikTok
                </label>
                {enableTiktok && (
                  <input
                    type="url"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@tu_usuario"
                    className="w-full bg-black/60 border border-gray-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Aviso Legal de Protección de Datos */}
          <div className="bg-black/50 border border-gray-800 p-4 rounded-xl space-y-3 text-xs text-gray-400">
            <p>
              🔒{" "}
              <span className="font-bold text-gray-200">
                Aviso de Privacidad y Transparencia:
              </span>{" "}
              Los datos proporcionados (Nick de Minecraft, ID de Discord y
              enlaces) se utilizarán{" "}
              <span className="text-cyan-300">exclusivamente</span> para la
              visualización de estadísticas y marcadores en la web durante la
              Copa de Maestros. Una vez finalizado el evento, toda la
              información almacenada será eliminada definitivamente de los
              servidores.
            </p>
            <label className="flex items-center gap-2 text-white font-bold cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              Entiendo y acepto el uso de mis datos para el torneo.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !aceptaTerminos}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-500/30"
          >
            {loading
              ? "Sincronizando con Dispositivo Rotom..."
              : "Completar Registro Oficial"}
          </button>
        </form>
      </div>
    </main>
  );
}
