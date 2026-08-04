import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Importamos la instancia de prisma que ya tiene el adapter configurado
import { prisma } from "../src/lib/prisma";

const JUGADORES_PRUEBA = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Piray",
    mc: "Piray",
    pais: "ES",
    elo: 1850,
    rango: "Maestro",
    pokemon: "charizard",
    pokeId: 6,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    nombre: "Rovar",
    mc: "Gengar",
    pais: "MX",
    elo: 1720,
    rango: "Maestro",
    pokemon: "gengar",
    pokeId: 94,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    nombre: "Saliah",
    mc: "Lucario",
    pais: "AR",
    elo: 1680,
    rango: "Maestro",
    pokemon: "lucario",
    pokeId: 448,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    nombre: "Horado",
    mc: "Snorlax",
    pais: "CO",
    elo: 1610,
    rango: "Maestro",
    pokemon: "snorlax",
    pokeId: 143,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    nombre: "Bluii",
    mc: "Pikachu",
    pais: "CL",
    elo: 1550,
    rango: "Ultra",
    pokemon: "pikachu",
    pokeId: 25,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    nombre: "Marka",
    mc: "Blastoise",
    pais: "PE",
    elo: 1490,
    rango: "Ultra",
    pokemon: "blastoise",
    pokeId: 9,
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    nombre: "Uiy",
    mc: "Venusaur",
    pais: "EC",
    elo: 1410,
    rango: "Ultra",
    pokemon: "venusaur",
    pokeId: 3,
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    nombre: "Kote",
    mc: "Dragonite",
    pais: "VE",
    elo: 1350,
    rango: "Súper",
    pokemon: "dragonite",
    pokeId: 149,
  },
];

async function main() {
  console.log("Cargando datos de prueba...");

  for (const j of JUGADORES_PRUEBA) {
    // 1. Crear Perfil
    await prisma.perfil.upsert({
      where: { id: j.id },
      update: {},
      create: {
        id: j.id,
        nombre_streamer: j.nombre,
        minecraft_uuid: j.mc,
        pais: j.pais,
        pokemon_inicial_nom: j.pokemon,
        pokemon_inicial_id: j.pokeId,
        redes_sociales: { twitch: "https://twitch.tv" },
      },
    });

    // 2. Crear Clasificación ELO
    await prisma.clasificacion.upsert({
      where: { perfil_id: j.id },
      update: { elo: j.elo, rango: j.rango },
      create: {
        perfil_id: j.id,
        elo: j.elo,
        rango: j.rango,
        victorias: Math.floor(j.elo / 100),
        derrotas: 2,
      },
    });

    // 3. Crear Slot 1 (Starter)
    await prisma.equipoPokemon.upsert({
      where: { perfil_id_slot: { perfil_id: j.id, slot: 1 } },
      update: {},
      create: {
        perfil_id: j.id,
        slot: 1,
        pokemon_id: j.pokeId,
        nombre: j.pokemon,
        sprite_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${j.pokeId}.png`,
      },
    });
  }

  // Al final del seed.ts:
  await prisma.enfrentamiento.upsert({
    where: { id: "99999999-9999-9999-9999-999999999999" },
    update: {},
    create: {
      id: "99999999-9999-9999-9999-999999999999",
      tipo: "FASE_REGULAR",
      fase: "JORNADA 1",
      jugador1_id: "11111111-1111-1111-1111-111111111111", // Piray
      jugador2_id: "22222222-2222-2222-2222-222222222222", // Rovar
      ganador_id: "11111111-1111-1111-1111-111111111111", // Piray Ganó
      elo_cambio_j1: 25,
      elo_cambio_j2: -18,
      equipo_j1: [
        {
          slot: 1,
          nombre: "charizard",
          sprite_url:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
        },
      ],
      equipo_j2: [
        {
          slot: 1,
          nombre: "gengar",
          sprite_url:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
        },
      ],
    },
  });

  console.log("¡Datos de prueba cargados con éxito!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
