import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Loading } from '../../components';
import { finalExamsRepository, usersRepository } from '../../repositories';

const FIUBA_MAP_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-map/index.html'
    : 'https://fede.dm/FIUBA-Map/';

// TODO: placeholder — replace with career fetched from student profile once the DB
// has the career/plan field. See LUDO3-FIUBA/.github issue #32.
const CARRERA_ID = 'informatica';

const FiubaMapScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [padron, setPadron] = useState<string | null>(null);
  const [materiasPayload, setMateriasPayload] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [initSent, setInitSent] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);

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

  // Step 1: map ready → send LUDO_INIT
  useEffect(() => {
    if (!mapReady || !padron || initSent) return;
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'LUDO_INIT', padron: '${padron}', carreraId: '${CARRERA_ID}' }
      }));
      true;
    `);
    setInitSent(true);
  }, [mapReady, padron]);

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
        console.log('[FIUBA-Map] READY');
        setMapReady(true);
        return;
      }
      if (data.type === 'FIUBA_MAP_NETWORK_READY') {
        console.log('[FIUBA-Map] NETWORK_READY carrera:', data.carreraKey);
        if (data.carreraKey === CARRERA_ID) setNetworkReady(true);
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
