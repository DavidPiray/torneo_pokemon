"use server";

import { prisma } from "../../lib/prisma";

interface GuardarPerfilInput {
  id: string;
  nombreStreamer: string;
  minecraftUuid: string;
  pais: string;
  pokemonInicialId?: number;
  pokemonInicialNom?: string;
  redesSociales?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    tiktok?: string;
  };
}

export async function registrarEntrenadorAction(data: GuardarPerfilInput) {
  try {
    // 1. Crear o actualizar Perfil usando Prisma
    const perfil = await prisma.perfil.upsert({
      where: { id: data.id },
      update: {
        nombre_streamer: data.nombreStreamer,
        minecraft_uuid: data.minecraftUuid,
        pais: data.pais,
        pokemon_inicial_id: data.pokemonInicialId,
        pokemon_inicial_nom: data.pokemonInicialNom,
        redes_sociales: data.redesSociales || {},
      },
      create: {
        id: data.id,
        discord_id: data.id,
        nombre_streamer: data.nombreStreamer,
        minecraft_uuid: data.minecraftUuid,
        pais: data.pais,
        pokemon_inicial_id: data.pokemonInicialId,
        pokemon_inicial_nom: data.pokemonInicialNom,
        redes_sociales: data.redesSociales || {},
        es_npc: false,
      },
    });

    // 2. Inicializar la Clasificación
    await prisma.clasificacion.upsert({
      where: { perfil_id: data.id },
      update: {},
      create: {
        perfil_id: data.id,
        elo: 1000,
        rango: "Normal",
        victorias: 0,
        derrotas: 0,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error en Server Action registrarEntrenador:", error);
    return {
      success: false,
      error: error.message || "Error al guardar en la base de datos",
    };
  }
}
