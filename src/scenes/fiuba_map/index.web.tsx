import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { guaraniRepository, usersRepository } from '../../repositories';

const FIUBA_MAP_URL = '/fiuba-map/index.html';

const FiubaMapScreen: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [padron, setPadron] = useState<string | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);
  const [materiasPayload, setMateriasPayload] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);
  const [initSent, setInitSent] = useState(false);
  // Stores the last carreraKey from FIUBA_MAP_NETWORK_READY, even if received before carreraId was known
  const lastNetworkCarreraRef = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([
      usersRepository.getInfo(),
      guaraniRepository.fetchPlanCarrera(),
    ]).then(([user, plan]) => {
      setPadron(user.studentId ?? null);
      const carrera = plan.carreras.find((c) => c.fiuba_map_carrera_id);
      setCarreraId(carrera?.fiuba_map_carrera_id ?? null);
      setMateriasPayload(JSON.stringify(plan.materias_aprobadas));
    }).catch((err) => {
      console.warn('[FiubaMap] Failed to load plan from SIU:', err);
    });
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'FIUBA_MAP_READY') setMapReady(true);
        if (data.type === 'FIUBA_MAP_NETWORK_READY') {
          lastNetworkCarreraRef.current = data.carreraKey;
          if (data.carreraKey === carreraId) setNetworkReady(true);
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [carreraId]);

  // If FIUBA-Map already has the right carrera loaded (default), set networkReady as soon as carreraId is known
  useEffect(() => {
    if (carreraId && lastNetworkCarreraRef.current === carreraId) {
      setNetworkReady(true);
    }
  }, [carreraId]);

  useEffect(() => {
    if (!mapReady || !padron || !carreraId || initSent || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'LUDO_INIT', padron, carreraId },
      '*',
    );
    setInitSent(true);
  }, [mapReady, padron, carreraId]);

  useEffect(() => {
    if (!networkReady || !materiasPayload || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'LUDO_SET_MATERIAS', materias: JSON.parse(materiasPayload) },
      '*',
    );
  }, [networkReady, materiasPayload]);

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        src={FIUBA_MAP_URL}
        style={styles.iframe as any}
        title="FIUBA Map"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  iframe: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export default FiubaMapScreen;
