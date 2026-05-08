import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { Loading } from '../../components';
import { finalExamsRepository, usersRepository } from '../../repositories';

const FIUBA_MAP_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-map/index.html'
    : '';

const FiubaMapScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [padron, setPadron] = useState<string | null>(null);
  const [materiasPayload, setMateriasPayload] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      usersRepository.getInfo(),
      finalExamsRepository.fetchApproved(),
    ]).then(([user, exams]) => {
      setPadron(user.studentId ?? null);
      const materias = exams.map((exam) => ({
        id: exam.subject.code,
        nota: exam.grade ?? 4,
      }));
      setMateriasPayload(JSON.stringify(materias));
    });
  }, []);

  const inject = () => {
    if (!webViewRef.current) return;
    if (padron) {
      webViewRef.current.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'LUDO_INIT', padron: '${padron}' }
        }));
        true;
      `);
    }
    if (materiasPayload) {
      webViewRef.current.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'LUDO_SET_MATERIAS', materias: ${materiasPayload} }
        }));
        true;
      `);
    }
  };

  const onLoad = () => {
    setReady(true);
    inject();
  };

  return (
    <SafeAreaView style={styles.container}>
      {!ready && <Loading />}
      <WebView
        ref={webViewRef}
        source={{ uri: FIUBA_MAP_URI }}
        style={styles.webview}
        onLoad={onLoad}
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
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default FiubaMapScreen;
