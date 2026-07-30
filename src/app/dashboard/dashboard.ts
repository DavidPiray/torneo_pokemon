export interface PerfilData {
  id: string;
  nombre_streamer: string;
  minecraft_uuid: string;
  pais: string;
  pokemon_inicial_id?: number;
  pokemon_inicial_nom?: string;
  redes_sociales?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    tiktok?: string;
  };
}

export interface ClasificacionData {
  elo: number;
  rango: string;
  victorias: number;
  derrotas: number;
}

export interface PokemonSlot {
  slot: number;
  pokemon_id: number;
  nombre: string;
  sprite_url: string;
  tipos?: string[];
}

export interface NotificacionItem {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  tipo: "info" | "warning" | "success";
}
