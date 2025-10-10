import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/lib/prisma';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  const { youtubeId } = request.query;

  if (typeof youtubeId !== 'string') {
    return response.status(400).json({ error: 'youtubeId must be a string.' });
  }

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
