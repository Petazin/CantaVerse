import dotenv from 'dotenv';
dotenv.config();

// DEBUG: Comprobar si la variable de entorno se ha cargado
console.log('[api-runner] DEEPL_API_KEY cargada:', process.env.DEEPL_API_KEY);

import express from 'express';
import type { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Importa tus funciones API aquí
import translateHandler from '../api/translate.ts';
import songsIndexHandler from '../api/songs/index.ts';
import songsYoutubeIdHandler from '../api/songs/[youtubeId].ts';

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  if (_req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Adaptador para convertir una función de Vercel en un manejador de Express
const vercelAdapter = (handler: (req: VercelRequest, res: VercelResponse) => void | Promise<void>) => {
  return async (req: Request, res: Response) => {
    const vercelReq = req as VercelRequest;
    const vercelRes = res as unknown as VercelResponse;

    // Guardar los métodos originales
    const originalStatus = res.status.bind(res);
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Sobrescribir los métodos para la compatibilidad con Vercel
    vercelRes.status = (statusCode: number) => {
      originalStatus(statusCode);
      return vercelRes;
    };
    vercelRes.json = (body: any) => {
      originalJson(body);
      return vercelRes;
    };
    vercelRes.send = (body: any) => {
      originalSend(body);
      return vercelRes;
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('[api-runner] Error al ejecutar el handler:', error);
      if (!res.headersSent) {
        originalStatus(500).send('Error interno en el handler de la API');
      }
    }
  };
};

// --- Rutas de la API ---
console.log('[api-runner] Configurando rutas de la API...');

// Ruta para /api/translate
app.post('/api/translate', vercelAdapter(translateHandler));
console.log('[api-runner]   -> POST /api/translate registrada.');

// Ruta para /api/songs (maneja GET y POST)
app.all('/api/songs', vercelAdapter(songsIndexHandler));
console.log('[api-runner]   -> ALL /api/songs registrada.');

// Ruta para /api/songs/:youtubeId (maneja GET por ID)
app.all('/api/songs/:youtubeId', vercelAdapter(songsYoutubeIdHandler));
console.log('[api-runner]   -> ALL /api/songs/:youtubeId registrada.');


app.listen(PORT, () => {
  console.log(`[api-runner] Servidor de API local escuchando en http://localhost:${PORT}`);
});