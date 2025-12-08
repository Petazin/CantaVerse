import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCaptionsLogic } from './get-captions.ts';
import { fetchVideoMetadata } from './utils/metadata.ts';
import * as cheerio from 'cheerio';

import puppeteer from 'puppeteer';

// Helper to scrape AZLyrics using Puppeteer
// Helper to find AZLyrics URL via Google Search using Puppeteer
async function searchAZLyricsOnGoogle(query: string): Promise<string | null> {
  console.log(`[fetch-lyrics] Buscando en Google: ${query}`);
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Search Google
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query + ' lyrics azlyrics')}`, { waitUntil: 'domcontentloaded' });

    // Extract first AZLyrics link
    // We look for anchor tags that contain 'azlyrics.com/lyrics'
    const link = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const azLink = anchors.find(a => a.href.includes('azlyrics.com/lyrics/'));
      return azLink ? azLink.href : null;
    });

    return link || null;
  } catch (err) {
    console.warn('[fetch-lyrics] Error searching Google:', err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// Modify scrapeAZLyrics to accept URL optionally or build it
async function scrapeAZLyrics(artist: string, song: string, directUrl?: string): Promise<string | null> {
  let browser = null;
  try {
    let url = directUrl;
    if (!url) {
      const cleanArtist = artist.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanSong = song.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      url = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanSong}.html`;
    }

    console.log(`[fetch-lyrics] Intentando AZLyrics (Puppeteer): ${url}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments like Vercel/Docker
    });
    const page = await browser.newPage();

    // Set user agent to generic Chrome to look human
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Go to URL
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    if (!response || !response.ok()) {
      console.log(`[fetch-lyrics] AZLyrics retornó status ${response?.status()}`);
      if (response?.status() === 404) return null;
    }

    // Wait a bit for potential JS execution or anti-bot checks
    // await new Promise(r => setTimeout(r, 1000));

    // Get page content
    const html = await page.content();
    console.log(`[fetch-lyrics] Descargados ${html.length} bytes de AZLyrics.`);

    // Check title to see if we are blocked
    const title = await page.title();
    console.log(`[fetch-lyrics] Page Title: ${title}`);

    // Load Cheerio with the HTML we got from Puppeteer
    const $ = cheerio.load(html);

    // ... (rest of the logic remains the same: parsing with Cheerio)
    // Estrategia 1: Buscar comentario de licencia (Más robusta)
    let lyricsText = '';

    const container = $('.col-lg-8.text-center');
    if (container.length > 0) {
      console.log('[fetch-lyrics] Contenedor .col-lg-8.text-center encontrado.');
      container.contents().each((i, el) => {
        if (el.type === 'comment' && el.data && el.data.includes('Usage of azlyrics.com')) {
          let next = $(el).next();
          while (next.length > 0 && next[0].name !== 'div') {
            next = next.next();
          }
          if (next.length > 0) {
            lyricsText = next.html() || '';
            console.log('[fetch-lyrics] Letra encontrada por comentario de licencia.');
            return false;
          }
        }
      });
    }

    // Estrategia 2: Div sin clase
    if (!lyricsText) {
      console.log('[fetch-lyrics] Estrategia 1 falló. Probando selectores genéricos...');
      const lyricsDiv = $('div:not([class])').filter((i: number, el: any) => {
        return $(el).parents('.col-lg-8').length > 0;
      }).first();

      if (lyricsDiv.length > 0) {
        lyricsText = lyricsDiv.html() || '';
        console.log('[fetch-lyrics] Letra encontrada por selector genérico.');
      }
    }

    if (lyricsText) {
      let text = lyricsText;
      text = text.replace(/<br\s*\/?>/gi, '\n');
      text = text.replace(/<[^>]+>/g, '');
      text = text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
      return text.trim();
    } else {
      console.log('[fetch-lyrics] No se pudo extraer la letra del HTML.');
    }

    return null;

  } catch (error) {
    console.error('Error scraping AZLyrics with Puppeteer:', error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

export async function fetchLyricsLogic(youtubeId: string) {
  // 1. Get Metadata first (we need Artist/Title for AZLyrics anyway, and good for saving)
  const metadata = await fetchVideoMetadata(youtubeId);
  if (!metadata) {
    throw new Error('No se pudo obtener información del video de YouTube.');
  }

  console.log(`[fetch-lyrics] Procesando: ${metadata.artist} - ${metadata.songName}`);
  console.log('[fetch-lyrics] VERSION DEBUG: 4.0 - GOOGLE FALLBACK');

  // 2. Try YouTube Captions (Preferred because they have timing)
  const captions = await getCaptionsLogic(youtubeId);
  if (captions && captions.length > 0) {
    console.log('[fetch-lyrics] Encontrados subtítulos en YouTube.');
    return {
      source: 'youtube',
      metadata,
      lyrics: captions // { time, text }
    };
  }

  // 3. Try AZLyrics (Fallback, text only)
  let textLyrics: string | null = null;

  // 3a. Direct URL attempt (Fastest)
  if (metadata.artist !== 'Desconocido' && metadata.songName) {
    console.log('[fetch-lyrics] Intentando construcción de URL directa...');
    textLyrics = await scrapeAZLyrics(metadata.artist, metadata.songName);
  }

  // 3b. Google Search attempt (Smarter Fallback)
  if (!textLyrics) {
    console.log('[fetch-lyrics] Falló URL directa. Intentando búsqueda en Google...');
    const searchQuery = metadata.artist !== 'Desconocido'
      ? `${metadata.artist} ${metadata.songName}`
      : metadata.songName;

    const foundUrl = await searchAZLyricsOnGoogle(searchQuery);
    if (foundUrl) {
      console.log(`[fetch-lyrics] Enlace encontrado en Google: ${foundUrl}`);
      textLyrics = await scrapeAZLyrics("", "", foundUrl);
    } else {
      console.log('[fetch-lyrics] No se encontraron enlaces de AZLyrics en Google.');
    }
  }

  if (textLyrics) {
    console.log('[fetch-lyrics] Encontrada letra en AZLyrics final.');
    const lines = textLyrics.split('\n').filter(l => l.trim() !== '');
    return {
      source: 'azlyrics',
      metadata,
      lyrics: lines.map((line, index) => ({
        time: index * 2,
        text: line.trim()
      }))
    };
  }

  return null;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { youtubeId } = request.body || request.query;

  if (!youtubeId || typeof youtubeId !== 'string') {
    return response.status(400).json({ error: 'Falta youtubeId' });
  }

  try {
    const result = await fetchLyricsLogic(youtubeId);
    if (!result) {
      return response.status(404).json({ error: 'No se encontraron letras (ni subtítulos ni AZLyrics).' });
    }
    return response.status(200).json(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Error interno obteniendo letras.' });
  }
}
