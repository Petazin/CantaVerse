import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as deepl from 'deepl-node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Aceptamos un POST request con las líneas a traducir
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método no permitido' });
  }

  const { lines, targetLang = 'es' } = request.body;
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'La clave de API de DeepL no está configurada en el servidor.' });
  }
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return response.status(400).json({ error: 'El cuerpo de la petición debe incluir un array de \'lines\'.' });
  }

  try {
    const translator = new deepl.Translator(apiKey);
    const textToTranslate = lines.join('\n');
    
    const result = await translator.translateText(textToTranslate, null, targetLang as deepl.TargetLanguageCode);
    
    const translatedLines = result.text.split('\n');

    return response.status(200).json({ translatedLines });

  } catch (error) {
    console.error('La traducción de DeepL falló:', error);
    return response.status(500).json({ error: 'Error al contactar la API de traducción.' });
  }
}