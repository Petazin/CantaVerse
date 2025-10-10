import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.ts';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method === 'GET') {
    try {
      const songs = await prisma.song.findMany({
        orderBy: {
          artist: 'asc',
        },
      });
      return response.status(200).json(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      return response.status(500).json({ error: 'Error fetching songs from database.' });
    }
  }

  if (request.method === 'POST') {
    try {
      const { youtubeId, title, artist, lyrics, translatedLyrics } = request.body;

      if (!youtubeId || !title || !artist || !lyrics) {
        return response.status(400).json({ error: 'Missing required fields: youtubeId, title, artist, lyrics' });
      }

      // Use upsert to avoid creating duplicate songs if the youtubeId already exists.
      // It will create the song if it doesn't exist, or do nothing if it does.
      // Then, it will create the new synchronization associated with it.
      const song = await prisma.song.upsert({
        where: { youtubeId },
        update: {},
        create: {
          youtubeId,
          title,
          artist,
        },
      });

      // Create the synchronization record
      const synchronization = await prisma.synchronization.create({
        data: {
          songId: song.id,
          lyrics: lyrics, // JSON object from the sync tool
          translatedLyrics: translatedLyrics, // Optional JSON object
        },
      });

      return response.status(201).json({ song, synchronization });
    } catch (error) {
      console.error('Error creating song:', error);
      // Check for unique constraint violation to give a more specific error
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
         return response.status(409).json({ error: `A song with youtubeId '${request.body.youtubeId}' already exists.` });
      }
      return response.status(500).json({ error: 'Error creating song in database.' });
    }
  }

  // Handle other methods
  response.setHeader('Allow', ['GET', 'POST']);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}
