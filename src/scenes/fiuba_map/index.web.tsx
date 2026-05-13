import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { finalExamsRepository, usersRepository } from '../../repositories';

// Served from public/fiuba-map/ — same origin, postMessage works, Playwright can inspect
const FIUBA_MAP_URL = '/fiuba-map/index.html';
const CARRERA_ID = 'informatica';

const FiubaMapScreen: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [padron, setPadron] = useState<string | null>(null);
  const [materiasPayload, setMateriasPayload] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);
  const [initSent, setInitSent] = useState(false);

  useEffect(() => {
    Promise.all([
      usersRepository.getInfo(),
      finalExamsRepository.fetchApproved(),
    ]).then(([user, exams]) => {
      setPadron(user.studentId ?? null);
      const materias = exams
        .filter((exam) => exam.grade !== null && exam.grade >= 4)
        .map((exam) => ({ id: exam.subject.code, nota: exam.grade }));
      setMateriasPayload(JSON.stringify(materias));
    });
  }, []);

  // Listen for messages from the iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'FIUBA_MAP_READY') setMapReady(true);
        if (data.type === 'FIUBA_MAP_NETWORK_READY' && data.carreraKey === CARRERA_ID) setNetworkReady(true);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Step 1: map ready → send LUDO_INIT
  useEffect(() => {
    if (!mapReady || !padron || initSent || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'LUDO_INIT', padron, carreraId: CARRERA_ID },
      '*',
    );
    setInitSent(true);
  }, [mapReady, padron]);

  // Step 2: network ready → send materias + zoom
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
  container: {
    flex: 1,
  },
  iframe: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export default FiubaMapScreen;
