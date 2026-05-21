import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Loading } from '../../components';
import { guaraniRepository, usersRepository } from '../../repositories';

const FIUBA_MAP_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-map/index.html'
    : 'https://fede.dm/FIUBA-Map/';

const FiubaMapScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [padron, setPadron] = useState<string | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);
  const [materiasPayload, setMateriasPayload] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [initSent, setInitSent] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);

  useEffect(() => {
    Promise.all([
      usersRepository.getInfo(),
      guaraniRepository.fetchPlanCarrera(),
    ]).then(([user, plan]) => {
      setPadron(user.studentId ?? null);

      // Pick first career with a known FIUBA-Map ID
      const carrera = plan.carreras.find((c) => c.fiuba_map_carrera_id);
      setCarreraId(carrera?.fiuba_map_carrera_id ?? null);

      setMateriasPayload(JSON.stringify(plan.materias_aprobadas));
    }).catch((err) => {
      console.warn('[FiubaMap] Failed to load plan from SIU:', err);
    });
  }, []);

  // Step 1: map ready → send LUDO_INIT
  useEffect(() => {
    if (!mapReady || !padron || !carreraId || initSent) return;
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'LUDO_INIT', padron: '${padron}', carreraId: '${carreraId}' }
      }));
      true;
    `);
    setInitSent(true);
  }, [mapReady, padron, carreraId]);

  // Step 2: network ready for the right carrera → send materias + zoom
  useEffect(() => {
    if (!networkReady || !materiasPayload) return;
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'LUDO_SET_MATERIAS', materias: ${materiasPayload} }
      }));
      true;
    `);
    webViewRef.current?.injectJavaScript(`
      setTimeout(function() {
        var net = window.__ludoNetwork;
        if (!net) return;
        var focusNodes = net.body.data.nodes.get({
          filter: function(n) {
            return !n.hidden && (n.group === 'Habilitadas' || n.group === 'Cursando' || n.group === 'Aprobadas');
          }
        }).map(function(n) { return n.id; });
        net.fit({
          nodes: focusNodes.length ? focusNodes : undefined,
          animation: { duration: 350, easingFunction: 'easeInOutQuad' }
        });
        setTimeout(function() {
          if (net.getScale() < 0.6) {
            net.moveTo({ scale: 0.6, animation: { duration: 250, easingFunction: 'easeInOutQuad' } });
          }
        }, 400);
      }, 200);
      true;
    `);
  }, [networkReady, materiasPayload]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'FIUBA_MAP_LOG') {
        console.log('[FIUBA-Map]', data.msg);
        return;
      }
      if (data.type === 'FIUBA_MAP_READY') {
        setMapReady(true);
        return;
      }
      if (data.type === 'FIUBA_MAP_NETWORK_READY') {
        console.log('[FIUBA-Map] NETWORK_READY carrera:', data.carreraKey);
        if (data.carreraKey === carreraId) setNetworkReady(true);
        return;
      }
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {!mapReady && <Loading />}
      <WebView
        ref={webViewRef}
        source={{ uri: FIUBA_MAP_URI }}
        style={styles.webview}
        onMessage={onMessage}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        originWhitelist={['*']}
        javaScriptEnabled
        setSupportMultipleWindows={false}
        nestedScrollEnabled
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

export default FiubaMapScreen;
