import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Helper para limpiar títulos ---
function parseTitle(videoTitle: string) {
  // Regex para quitar (cualquier cosa) y [cualquier cosa]
  const cleanedFromExtras = videoTitle.replace(/\s*\(.*?\)|\s*\[.*?\]/g, '').trim();

  const parts = cleanedFromExtras.split(/\s*[-–—]\s*/).map(part => part.trim());
  
  const artist = parts.length >= 2 ? parts[0] : undefined;
  // Si hay división, la canción es la parte 2. Si no, es el título entero ya limpio.
  const song = parts.length >= 2 ? parts[1] : cleanedFromExtras;

  return { artist, song };
}

// --- Proveedor 1: lyrics.ovh ---
async function fetchFromLyricsOvh(artist?: string, song?: string): Promise<string[] | null> {
  if (!artist || !song) return null;
  try {
    console.log(`Intentando con lyrics.ovh: ${artist} - ${song}`);
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.lyrics.split('\n').filter((line: string) => line.trim() !== '');
  } catch (error) {
    console.error('lyrics.ovh falló:', error.message);
    return null;
  }
}

// --- Proveedor 2: some-random-api.ml ---
async function fetchFromSomeRandomApi(song: string): Promise<string[] | null> {
  if (!song) return null;
  try {
    console.log(`Intentando con some-random-api: ${song}`);
    const res = await fetch(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(song)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.lyrics.split('\n').filter((line: string) => line.trim() !== '');
  } catch (error) {
    console.error('some-random-api falló:', error.message);
    return null;
  }
}

// --- Handler Principal ---
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const videoTitle = request.query.videoTitle as string;
  if (!videoTitle) {
    return response.status(400).json({ error: 'El parámetro videoTitle es requerido' });
  }

  const { artist, song } = parseTitle(videoTitle);

  // Cadena de proveedores
  let lyrics = await fetchFromLyricsOvh(artist, song);
  if (lyrics) {
    console.log('Letra encontrada en lyrics.ovh');
    return response.status(200).json({ type: 'unsynced', lines: lyrics, source: 'lyrics.ovh' });
  }

  lyrics = await fetchFromSomeRandomApi(song);
  if (lyrics) {
    console.log('Letra encontrada en some-random-api');
    return response.status(200).json({ type: 'unsynced', lines: lyrics, source: 'some-random-api' });
  }

  // Si todos fallan
  console.log('Letra no encontrada en ningún proveedor.');
  return response.status(404).json({ error: 'Letra no encontrada en ninguno de los proveedores disponibles.' });
}