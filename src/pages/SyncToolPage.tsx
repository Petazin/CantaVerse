import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';

// El JSON generado solo necesita esta estructura simple
interface FinalLyricLine {
  time: number;
  original: string;
  translated?: string;
}

export default function SyncToolPage() {
  const [searchParams] = useSearchParams();
  const [videoId] = useState<string | null>(searchParams.get('videoId'));

  const [rawLyrics, setRawLyrics] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [translatedLines, setTranslatedLines] = useState<string[]>([]);
  const [syncedLyrics, setSyncedLyrics] = useState<FinalLyricLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalJson, setFinalJson] = useState<any | null>(null);

  // Estados para procesos
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<{ artist: string; title: string } | null>(null);

  const playerRef = useRef<any | null>(null);
  const previewLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const previewTransLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Efecto: Intentar cargar datos existentes (o autogenerados) al abrir la herramienta
  // Función extraída para poder llamarla manualmente
  const fetchLyrics = useCallback(async () => {
    if (!videoId) return;
    try {
      const response = await fetch(`/api/songs/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Datos cargados:', data);

        if (data.artist && data.title) {
          setMetadata({ artist: data.artist, title: data.title });
        }

        if (data.lyrics && Array.isArray(data.lyrics) && data.lyrics.length > 0) {
          const loadedLines = data.lyrics.map((l: any) => l.text || l.original || '');
          setLines(loadedLines);
          setRawLyrics(loadedLines.join('\n'));

          const loadedSynced = data.lyrics.map((l: any) => ({
            time: l.time,
            original: l.text || l.original || '',
          }));
          setSyncedLyrics(loadedSynced);

          if (data.translatedLyrics && Array.isArray(data.translatedLyrics)) {
            const transLines = data.translatedLyrics.map((l: any) => l.text || '');
            setTranslatedLines(transLines);
            setSyncedLyrics(prev => prev.map((item, idx) => ({
              ...item,
              translated: transLines[idx] || undefined
            })));
          }
          // Eliminado el alert() intrusivo
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, [videoId]);

  // Efecto: Carga inicial automática (silenciosa) -> DESACTIVADA para que sea manual
  // useEffect(() => {
  //   if (videoId) fetchLyrics();
  // }, [videoId, fetchLyrics]);

  const handleLoadLyrics = () => {
    const processed = rawLyrics.split('\n').filter(line => line.trim() !== '');
    setLines(processed);
    setCurrentIndex(0);
    setSyncedLyrics([]);
    setTranslatedLines([]);
  };

  const handleTranslate = async () => {
    if (!rawLyrics) return;
    setIsTranslating(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, targetLang: 'ES' }),
      });
      if (!response.ok) throw new Error('Error al traducir la letra.');
      const data = await response.json();
      const translated = data.translatedLines;
      if (translated.length !== lines.length) {
        console.warn('La traducción no tiene el mismo número de líneas que el original.');
      }
      setTranslatedLines(translated);
    } catch (error) {
      console.error('Error en la traducción:', error);
      setSaveError((error as Error).message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMarkTime = useCallback(async () => {
    if (!playerRef.current || currentIndex >= lines.length) return;
    const currentTime = await playerRef.current.getCurrentTime();

    // Auto-Reset: Si empezamos a marcar desde el principio (index 0) y ya había datos (ej. dummy fetch),
    // limpiamos el array para empezar una sincronización manual limpia.
    let currentSyncedLyrics = syncedLyrics;
    if (currentIndex === 0 && syncedLyrics.length > 0) {
      currentSyncedLyrics = [];
      setSyncedLyrics([]);
    }

    const newSyncedLine: FinalLyricLine = {
      time: parseFloat(currentTime.toFixed(2)),
      original: lines[currentIndex],
      ...(translatedLines[currentIndex] && { translated: translatedLines[currentIndex] }),
    };

    setSyncedLyrics(prev => (currentIndex === 0 ? [newSyncedLine] : [...prev, newSyncedLine]));
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, lines, translatedLines, syncedLyrics]);

  useEffect(() => {
    if (currentIndex >= 0) {
      previewLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      previewTransLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleMarkTime(); } };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMarkTime]);

  const getFinalJson = async () => {
    if (!videoId || syncedLyrics.length !== lines.length || lines.length === 0) return null;

    let artist = 'Artista Desconocido';
    let title = 'Sin Título';

    if (metadata) {
      artist = metadata.artist;
      title = metadata.title;
    } else {
      const videoData = await (playerRef.current as any)?.getVideoData();
      const fullTitle = videoData?.title || 'Sin Título';
      const parts = fullTitle.replace(/\s*\(.*?\)|\s*\[.*?\]/g, '').trim().split(/\s*[-–—]\s*/);
      artist = parts.length >= 2 ? parts[0].trim() : 'Artista Desconocido';
      title = parts.length >= 2 ? parts[1].trim() : fullTitle;
    }

    const hasTranslation = translatedLines.length > 0;

    return {
      youtubeId: videoId,
      title,
      artist,
      lyrics: syncedLyrics.map(({ time, original }) => ({ time, original })),
      translatedLyrics: hasTranslation
        ? syncedLyrics.map(({ time }, index) => ({
          time,
          text: translatedLines[index] || ''
        }))
        : null,
    };
  };

  useEffect(() => {
    const updateFinalJson = async () => {
      const json = await getFinalJson();
      setFinalJson(json);
    };
    updateFinalJson();
  }, [syncedLyrics, translatedLines]);

  const handleSave = async () => {
    if (!finalJson) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    console.log('Enviando al servidor:', JSON.stringify(finalJson, null, 2));
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalJson),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falló la petición de guardado');
      }

      const result = await response.json();
      console.log('Guardado con éxito:', result);
      setSaveSuccess(`¡Canción "${finalJson.title}" guardada con éxito!`);

    } catch (error) {
      console.error('Error al guardar:', error);
      setSaveError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const playerOptions = { height: '390', width: '640' };

  return (
    <div className="page-container">
      <div className="player-area">
        <h2>Herramienta de Sincronización</h2>
        {videoId && <YouTube videoId={videoId} opts={playerOptions} onReady={(e: any) => { playerRef.current = e.target; }} />}
        <h3>Letra Original</h3>
        <textarea value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} placeholder="Pega aquí la letra original..." />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={handleLoadLyrics}>Cargar Manualmente</button>
          <button onClick={fetchLyrics}>🔍 Buscar Letra Automática</button>
        </div>
        <button onClick={handleTranslate} disabled={isTranslating || lines.length === 0}>
          {isTranslating ? 'Traduciendo...' : 'Traducir Letra'}
        </button>
        <button onClick={handleMarkTime}>Marcar Tiempo (Espacio)</button>
      </div>
      <div className="lyrics-display" style={{ gridTemplateColumns: translatedLines.length > 0 ? '1fr 1fr 1fr' : '1fr 1fr' }}>
        <div className="lyrics-column">
          <h3>Vista Previa (Original)</h3>
          {lines.map((line, index) => (
            <p key={index} ref={el => { previewLineRefs.current[index] = el; }} className={index === currentIndex ? 'active' : ''}>{line}</p>
          ))}
        </div>
        {translatedLines.length > 0 && (
          <div className="lyrics-column">
            <h3>Vista Previa (Traducida)</h3>
            {translatedLines.map((line, index) => (
              <p key={index} ref={el => { previewTransLineRefs.current[index] = el; }} className={index === currentIndex ? 'active' : ''}>{line || '...'}</p>
            ))}
          </div>
        )}
        <div className="lyrics-column">
          <h3>Resultado JSON</h3>
          <textarea readOnly value={finalJson ? JSON.stringify(finalJson, null, 2) : ''} style={{ height: '100%' }} />
          <button onClick={() => finalJson && navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2))} disabled={!finalJson}>Copiar</button>
          <button onClick={handleSave} disabled={!finalJson || isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar en Base de Datos'}
          </button>
          {saveSuccess && <p style={{ color: 'green' }}>{saveSuccess}</p>}
          {saveError && <p style={{ color: 'red' }}>Error: {saveError}</p>}
        </div>
      </div>
    </div>
  );
}
