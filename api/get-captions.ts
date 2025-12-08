
// Importa los tipos necesarios para una función serverless (ej. en Vercel)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubtitles } from 'youtube-captions-scraper';

export async function getCaptionsLogic(videoId: string) {
  try {
    const captions = await getSubtitles({ videoID: videoId });

    // Filtramos para obtener solo las líneas de texto y tiempo
    const simplifiedCaptions = captions.map((caption: any) => ({
      time: parseFloat(caption.start),
      text: caption.text,
    }));

    if (simplifiedCaptions.length === 0) {
      return null;
    }

    return simplifiedCaptions;

  } catch (error) {
    console.error('Error getting captions:', error);
    return null;
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const videoId = request.query.videoId as string;

  if (!videoId) {
    return response.status(400).json({ error: 'El parámetro videoId es requerido' });
  }

  try {
    const simplifiedCaptions = await getCaptionsLogic(videoId);

    if (!simplifiedCaptions) {
      return response.status(404).json({ error: 'No se encontraron subtítulos para este video.' });
    }

    // Enviamos los subtítulos como respuesta
    return response.status(200).json(simplifiedCaptions);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Error al obtener los subtítulos.', details: (error as Error).message });
  }
}
