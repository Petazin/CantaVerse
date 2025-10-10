import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log('LA FUNCIÓN DE PRUEBA "get-captions" FUE EJECUTADA');
  response.status(200).json({ message: 'La función de prueba funciona' });
}
