import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { Loading } from '../../components';
import { guaraniRepository } from '../../repositories';
import { guaraniToHorariosSIU } from './guaraniTransformer';

const FIUBA_PLAN_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-plan/index.html'
    : 'https://fede.dm/FIUBA-Plan/';

const TOUCH_TO_MOUSE_BRIDGE = ``;


const FiubaPlanScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [horariosSIU, setHorariosSIU] = useState<any>(null);
  const [fetchError, setFetchError] = useState(false);
  const webViewReady = useRef(false);

  useEffect(() => {
    guaraniRepository.fetchOfertaComisiones()
      .then((comisiones) => {
        console.log('[FiubaPlan] comisiones recibidas:', comisiones.length);
        setHorariosSIU(guaraniToHorariosSIU(comisiones));
      })
      .catch((e) => {
        console.warn('[FiubaPlan] fetch falló:', e);
        setFetchError(true);
      });
  }, []);

  const inject = useCallback(() => {
    if (!webViewRef.current || !webViewReady.current) return;
    webViewRef.current.injectJavaScript(TOUCH_TO_MOUSE_BRIDGE);
    if (horariosSIU) {
      const payload = JSON.stringify(horariosSIU);
      webViewRef.current.injectJavaScript(`
        window.__LUDO_PLAN_DATA__ = ${payload};
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'LUDO_PLAN_INIT', horariosSIU: window.__LUDO_PLAN_DATA__ }
        }));
        true;
      `);
    }
  }, [horariosSIU]);

  const onLoad = () => {
    setReady(true);
    webViewReady.current = true;
    inject();
  };

  // Si los datos llegan después de que el WebView ya cargó, inyectar igual
  useEffect(() => {
    inject();
  }, [inject]);

  return (
    <SafeAreaView style={styles.container}>
      {!ready && <Loading />}
      {fetchError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            No se pudieron cargar automáticamente los horarios del SIU. Verificá tu conexión a la VPN o cargalos manualmente.
          </Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: FIUBA_PLAN_URI }}
        style={styles.webview}
        onLoad={onLoad}
        injectedJavaScriptBeforeContentLoaded="window.__LUDO_EMBEDDED__ = true; true;"
        scalesPageToFit
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  errorBanner: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  errorText: {
    color: '#856404',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default FiubaPlanScreen;
