import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { Loading } from '../../components';
import { guaraniRepository } from '../../repositories';
import { guaraniToHorariosSIU } from './guaraniTransformer';

const FIUBA_PLAN_URI =
  Platform.OS === 'android'
    ? 'file:///android_asset/fiuba-plan/index.html'
    : 'https://fede.dm/FIUBA-Plan/';

// Fixes touch drag on react-big-calendar inside a WebView.
// Android WebView captures touch-drag as scroll at the native level before JS sees it.
// touch-action:none tells the browser not to handle any default touch gesture on the calendar grid.
const TOUCH_TO_MOUSE_BRIDGE = `
(function() {
  function applyBridge(grid) {
    grid.style.touchAction = 'none';
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function(type) {
      grid.addEventListener(type, function(e) {
        e.preventDefault();
        var touch = e.changedTouches[0];
        var mouseType = { touchstart: 'mousedown', touchmove: 'mousemove', touchend: 'mouseup', touchcancel: 'mouseup' }[type];
        var evt = new MouseEvent(mouseType, {
          bubbles: true, cancelable: true,
          clientX: touch.clientX, clientY: touch.clientY,
          screenX: touch.screenX, screenY: touch.screenY,
        });
        touch.target.dispatchEvent(evt);
      }, { passive: false });
    });
  }

  var observer = new MutationObserver(function() {
    var grid = document.querySelector('.rbc-time-content');
    if (grid) {
      observer.disconnect();
      applyBridge(grid);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  var grid = document.querySelector('.rbc-time-content');
  if (grid) { observer.disconnect(); applyBridge(grid); }
})();
true;
`;


const FiubaPlanScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [horariosSIU, setHorariosSIU] = useState<any>(null);
  const webViewReady = useRef(false);

  useEffect(() => {
    guaraniRepository.fetchOfertaComisiones()
      .then((comisiones) => {
        console.log('[FiubaPlan] comisiones recibidas:', comisiones.length);
        setHorariosSIU(guaraniToHorariosSIU(comisiones));
      })
      .catch((e) => console.warn('[FiubaPlan] fetch falló:', e));
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
      <WebView
        ref={webViewRef}
        source={{ uri: FIUBA_PLAN_URI }}
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

export default FiubaPlanScreen;
