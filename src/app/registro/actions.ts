"use server";

import { prisma } from "@/lib/prisma";

export interface RegistroData {
  id: string;
  nombreStreamer: string;
  minecraftUuid: string;
  pais?: string;
  pokemonInicialId?: number;
  pokemonInicialNom?: string;
  redesSociales?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    tiktok?: string;
  };
}

export async function registrarEntrenadorAction(data: RegistroData) {
  try {
    // 1. Crear o actualizar Perfil usando Prisma
    await prisma.perfil.upsert({
      where: { id: data.id },
      update: {
        nombre_streamer: data.nombreStreamer,
        minecraft_uuid: data.minecraftUuid,
        pais: data.pais || "ND",
        pokemon_inicial_id: data.pokemonInicialId,
        pokemon_inicial_nom: data.pokemonInicialNom,
        redes_sociales: data.redesSociales
          ? JSON.parse(JSON.stringify(data.redesSociales))
          : undefined,
      },
      create: {
        id: data.id,
        nombre_streamer: data.nombreStreamer,
        minecraft_uuid: data.minecraftUuid,
        pais: data.pais || "ND",
        pokemon_inicial_id: data.pokemonInicialId,
        pokemon_inicial_nom: data.pokemonInicialNom,
        redes_sociales: data.redesSociales
          ? JSON.parse(JSON.stringify(data.redesSociales))
          : undefined,
      },
    });

    // 2. Inicializar la clasificación con 1000 ELO si no existe
    await prisma.clasificacion.upsert({
      where: { perfil_id: data.id },
      update: {},
      create: {
        perfil_id: data.id,
        elo: 1000,
        rango: "Normal",
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    console.error("Error en Server Action registrarEntrenador:", err);
    return { success: false, error: errorMessage };
  }
}
