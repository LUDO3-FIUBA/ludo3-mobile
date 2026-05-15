import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { guaraniRepository } from '../../repositories';
import { guaraniToHorariosSIU } from './guaraniTransformer';

const FIUBA_PLAN_URL = '/fiuba-plan/index.html';

const FiubaPlanScreen: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [horariosSIU, setHorariosSIU] = useState<any>(null);
  const [planReady, setPlanReady] = useState(false);
  const injectedRef = useRef(false);

  useEffect(() => {
    guaraniRepository.fetchOfertaComisiones()
      .then((comisiones) => {
        console.log('[FiubaPlan] comisiones recibidas:', comisiones.length);
        setHorariosSIU(guaraniToHorariosSIU(comisiones));
      })
      .catch((e) => console.warn('[FiubaPlan] fetch falló:', e));
  }, []);

  // Escuchar señal de FIUBA-Plan indicando que React montó y está listo
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'LUDO_PLAN_READY') setPlanReady(true);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Inyectar cuando ambos (datos + iframe) estén listos
  useEffect(() => {
    if (!planReady || !horariosSIU || injectedRef.current) return;
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'LUDO_PLAN_INIT', horariosSIU },
      '*',
    );
    injectedRef.current = true;
  }, [planReady, horariosSIU]);

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        src={FIUBA_PLAN_URL}
        style={{ flex: 1, width: '100%', height: '100%', border: 'none' } as any}
        title="FIUBA Plan"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default FiubaPlanScreen;
