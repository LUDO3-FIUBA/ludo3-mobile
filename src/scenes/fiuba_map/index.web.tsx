import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { finalExamsRepository, usersRepository } from '../../repositories';

const FIUBA_MAP_URL = 'https://fede.dm/FIUBA-Map/';

const FiubaMapScreen: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    Promise.all([
      usersRepository.getInfo(),
      finalExamsRepository.fetchApproved(),
    ]).then(([user, exams]) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      const materias = exams.map((exam) => ({
        id: exam.subject.code,
        nota: exam.grade ?? 4,
      }));

      iframe.addEventListener('load', () => {
        if (user.studentId) {
          iframe.contentWindow?.postMessage(
            { type: 'LUDO_INIT', padron: user.studentId },
            '*',
          );
        }
        iframe.contentWindow?.postMessage(
          { type: 'LUDO_SET_MATERIAS', materias },
          '*',
        );
      });
    });
  }, []);

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
