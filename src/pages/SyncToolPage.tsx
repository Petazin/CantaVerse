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

          // Si es una vista previa (auto-fetch), NO cargamos la sincronización "dummy" (tiempos en 0),
          // queremos empezar de cero. Si es una canción guardada, sí la cargamos para editar.
          if (data.isPreview) {
            setSyncedLyrics([]);
          } else {
            const loadedSynced = data.lyrics.map((l: any) => ({
              time: l.time,
              original: l.text || l.original || '',
            }));
            setSyncedLyrics(loadedSynced);
          }

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

    const newSyncedLine: FinalLyricLine = {
      time: parseFloat(currentTime.toFixed(2)),
      original: lines[currentIndex],
      ...(translatedLines[currentIndex] && { translated: translatedLines[currentIndex] }),
    };

    setSyncedLyrics(prev => {
      // Create a copy of the previous array
      const newLyrics = [...prev];
      // Update the line at the current index (overwriting if exists, appending if not)
      newLyrics[currentIndex] = newSyncedLine;
      return newLyrics;
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, lines, translatedLines, syncedLyrics]);

  // Handler for manual time adjustment via input
  const handleManualTimeChange = (index: number, newTime: number) => {
    setSyncedLyrics(prev => {
      const newLyrics = [...prev];
      if (newLyrics[index]) {
        newLyrics[index] = { ...newLyrics[index], time: newTime };
      }
      return newLyrics;
    });
  };

  // Handler to jump player to a specific time
  const handleJumpToTime = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  };

  useEffect(() => {
    if (currentIndex >= 0) {
      previewLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      previewTransLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  const handleTextChange = (index: number, newText: string) => {
    // Update lines array
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = newText;
      return newLines;
    });

    // Update rawLyrics for consistency (optional but good)
    setRawLyrics(prev => {
      const linesArr = prev.split('\n');
      if (linesArr[index] !== undefined) {
        linesArr[index] = newText;
        return linesArr.join('\n');
      }
      return prev;
    });

    // Also update the sync object if it exists
    setSyncedLyrics(prev => {
      if (!prev[index]) return prev;
      const newSynced = [...prev];
      newSynced[index] = { ...newSynced[index], original: newText };
      return newSynced;
    });
  };

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
  }, [syncedLyrics, translatedLines, metadata]);

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

        {/* Preview de Metadata a Guardar */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {metadata ? (
            <div style={{ padding: '10px 15px', backgroundColor: 'rgba(255, 215, 0, 0.05)', borderRadius: 'var(--radius-card)', border: '1px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '60%' }}>
              <small style={{ color: 'var(--accent-primary)', fontSize: '0.7em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Se guardará como:</small>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', fontSize: '0.9em' }}>
                <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>👤 {metadata.artist}</span>
                <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🎵 {metadata.title}</span>
              </div>
            </div>
          ) : <div />} {/* Spacer if no metadata */}

          <h3 style={{ margin: 0, paddingLeft: '15px', borderLeft: '3px solid var(--accent-primary)' }}>Letra Original</h3>
        </div>
        <textarea value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} placeholder="Pega aquí la letra original..." style={{ marginBottom: '10px' }} />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={handleLoadLyrics} className="button-secondary" style={{ padding: '8px 16px', fontSize: '0.9em' }}>Cargar Manualmente</button>
          <button onClick={fetchLyrics} className="button-secondary" style={{ padding: '8px 16px', fontSize: '0.9em' }}>🔍 Buscar Letra Automática</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleTranslate} disabled={isTranslating || lines.length === 0} className="button-secondary">
            {isTranslating ? 'Traduciendo...' : 'Traducir Letra'}
          </button>
          <button onClick={handleMarkTime} disabled={currentIndex >= lines.length} className="button-primary">
            Marcar Tiempo (Espacio)
          </button>
          <button
            onClick={handleSave}
            disabled={lines.length === 0 || syncedLyrics.length !== lines.length || isSaving}
            title={syncedLyrics.length !== lines.length ? `Progreso: ${syncedLyrics.length}/${lines.length}` : "Listo para guardar"}
            style={{
              backgroundColor: lines.length === 0 ? undefined : (syncedLyrics.length === lines.length
                ? '#4CAF50' // Green
                : syncedLyrics.length > 0
                  ? '#FFC107' // Yellow
                  : '#F44336'), // Red
              color: (syncedLyrics.length > 0 && syncedLyrics.length < lines.length) ? 'black' : 'white',
              opacity: 1
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        {saveSuccess && <p style={{ color: 'green', marginTop: '5px' }}>{saveSuccess}</p>}
        {saveError && <p style={{ color: 'red', marginTop: '5px' }}>Error: {saveError}</p>}
      </div>

      {/* Grid adjusted */}
      {lines.length > 0 && (
        <div className="lyrics-display" style={{ gridTemplateColumns: translatedLines.length > 0 ? '1fr 1fr' : '1fr' }}>
          <div className="lyrics-column">
            <h3>Original + Tiempos</h3>
            {lines.map((line, index) => {
              const isSynced = index < syncedLyrics.length;
              const lyricData = syncedLyrics[index];

              return (
                <div
                  key={index}
                  ref={el => { previewLineRefs.current[index] = el; }}
                  className={`lyric-line-item ${index === currentIndex ? 'active' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}
                >
                  <button
                    onClick={() => {
                      setCurrentIndex(index);
                      if (lyricData) handleJumpToTime(lyricData.time);
                    }}
                    title="Re-sincronizar desde aquí / Saltar video"
                    style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      marginRight: '8px',
                      backgroundColor: index === currentIndex ? '#ffc107' : '#333',
                      color: index === currentIndex ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {index === currentIndex ? '▶' : '⏮'}
                  </button>

                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#eee',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      outline: 'none',
                      borderBottom: '1px solid transparent'
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '1px solid #555'}
                    onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                  />

                  {isSynced && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={lyricData.time}
                        onChange={(e) => handleManualTimeChange(index, parseFloat(e.target.value))}
                        style={{
                          width: '60px',
                          padding: '2px',
                          fontSize: '0.9em',
                          backgroundColor: '#1a1a1a',
                          color: '#fff',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          textAlign: 'right'
                        }}
                      />
                      <button
                        onClick={() => handleJumpToTime(lyricData.time)}
                        title="Probar tiempo"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        🔊
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {translatedLines.length > 0 && (
            <div className="lyrics-column">
              <h3>Traducción</h3>
              {translatedLines.map((line, index) => (
                <p key={index} ref={el => { previewTransLineRefs.current[index] = el; }} className={index === currentIndex ? 'active' : ''}>{line || '...'}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
