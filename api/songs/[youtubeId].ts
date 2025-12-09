import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.ts';
import { fetchLyricsLogic } from '../fetch-lyrics.ts';
import { translateTextLogic } from '../translate.ts';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    response.setHeader('Allow', ['GET', 'DELETE']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  // Adaptación para entorno local (Express) vs. Vercel
  // En Vercel, el parámetro dinámico está en `query`. En Express, está en `params`.
  const { youtubeId } = (request as any).params?.youtubeId
    ? (request as any).params
    : request.query;


  if (typeof youtubeId !== 'string') {
    return response.status(400).json({ error: 'youtubeId must be a string.' });
  }

  if (request.method === 'DELETE') {
    try {
      await prisma.song.delete({
        where: { youtubeId },
      });
      return response.status(200).json({ message: `Song ${youtubeId} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting song ${youtubeId}:`, error);
      // Handle "Record to delete does not exist." from Prisma (P2025)
      if (error instanceof Error && (error as any).code === 'P2025') {
        return response.status(404).json({ error: 'Song not found' });
      }
      return response.status(500).json({ error: 'Error deleting song/synchronizations' });
    }
  }

  // Si es GET
  try {
    const song = await prisma.song.findUnique({
      where: {
        youtubeId: youtubeId,
      },
      include: {
        // Include the related synchronizations
        synchronizations: {
          orderBy: {
            id: 'desc', // Get the latest synchronization first
          },
          take: 1, // We only want the most recent one
        },
      },
    });

    if (!song || song.synchronizations.length === 0) {
      // START AUTOMATION: If not in DB, try to fetch from external sources
      try {
        console.log(`[songs] Song ${youtubeId} not found in DB. Attempting auto-fetch...`);
        const fetchedData = await fetchLyricsLogic(youtubeId);

        if (fetchedData && fetchedData.lyrics) {
          console.log(`[songs] Found lyrics from ${fetchedData.source}. Returing PREVIEW mode (not saving to DB yet)...`);

          // NO AUTO-TRANSLATION. User must trigger it manually in frontend.
          // NO AUTO-SAVING. User must click 'Save' in frontend.

          // Return the fetched data WITHOUT saving to DB (Preview Mode)
          // The Save action will be triggered manually from the frontend
          return response.status(200).json({
            id: null, // Indicates not saved yet
            youtubeId,
            title: fetchedData.metadata.songName,
            artist: fetchedData.metadata.artist,
            lyrics: fetchedData.lyrics,
            translatedLyrics: null, // Explicitly null to show empty translation box
            source: fetchedData.source,
            isPreview: true
          });
        }
      } catch (fetchError) {
        console.warn(`[songs] Auto-fetch failed for ${youtubeId}:`, fetchError);
        // Fallthrough to 404
      }

      return response.status(404).json({ error: `Song with youtubeId '${youtubeId}' not found or has no synchronization.` });
    }

    // The player page expects a flat structure with lyrics, not a nested 'synchronizations' array.
    // Let's format the response to match what the frontend will need.
    const latestSynchronization = song.synchronizations[0];

    const responseData = {
      id: song.id,
      youtubeId: song.youtubeId,
      title: song.title,
      artist: song.artist,
      lyrics: latestSynchronization.lyrics,
      translatedLyrics: latestSynchronization.translatedLyrics,
    };

    return response.status(200).json(responseData);
  } catch (error) {
    console.error(`Error fetching song ${youtubeId}:`, error);
    return response.status(500).json({ error: `Error fetching song ${youtubeId} from database.` });
  }
}
