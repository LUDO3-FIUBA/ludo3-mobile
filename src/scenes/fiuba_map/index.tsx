import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Loading } from '../../components';
import { finalExamsRepository } from '../../repositories';

const FIUBA_MAP_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-map/index.html'
    : '';

const FiubaMapScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [injectionPayload, setInjectionPayload] = useState<string | null>(null);

  useEffect(() => {
    finalExamsRepository.fetchApproved().then((exams) => {
      const materias = exams.map((exam) => ({
        id: exam.subject.code,
        nota: exam.grade ?? 4,
      }));
      setInjectionPayload(JSON.stringify(materias));
    });
  }, []);

  const injectMaterias = () => {
    if (!injectionPayload || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'LUDO_SET_MATERIAS', materias: ${injectionPayload} }
      }));
      true;
    `);
  };

  const onLoad = () => {
    setReady(true);
    injectMaterias();
  };

  return (
    <SafeAreaView style={styles.container}>
      {!ready && <Loading />}
      <WebView
        ref={webViewRef}
        source={{ uri: FIUBA_MAP_URI }}
        style={styles.webview}
        onLoad={onLoad}
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
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default FiubaMapScreen;
