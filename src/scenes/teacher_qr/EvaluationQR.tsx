import React, { useState, useRef } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import RNFS from 'react-native-fs';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { RoundedButton } from '../../components';
import { getStyleSheet as style } from '../../styles';
import QRCode from 'react-native-qrcode-svg';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { getQrEvaluationStringFromEvaluationId } from '../../utils/qrCodeStringFactory';

interface Props {
  route: any
}

const EvaluationQR: React.FC<Props> = ({ route }: Props) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(300);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);
  const svgRef = useRef<any>(null);

  const semesterData = useAppSelector(selectSemesterData)!
  const semesterId = semesterData.id

  const evaluation = route.params.evaluation as TeacherEvaluation;
  const qrValue = getQrEvaluationStringFromEvaluationId(evaluation.id);

  async function downloadQR() {
    if (downloading) return;
    setDownloading(true);

    await svgRef.current?.toDataURL(async (data: string) => {
      try {
        const path = `${RNFS.CachesDirectoryPath}/${semesterId}-${evaluation.evaluationName}.png`;
        await RNFS.writeFile(path, data, 'base64');
        await CameraRoll.save(path, { type: 'photo', album: 'QrCodes' });
        setAlertDialog({ title: 'Éxito', message: 'QR guardado en la galería.' });
      } catch (error) {
        console.log("error", error);
        setAlertDialog({ title: 'Te fallamos', message: 'No pudimos descargar el QR. Usalo desde el teléfono o pedile al departamento que te lo pase/imprima. Sino siempre podés volver a intentar en unos minutos.' });
      } finally {
        setDownloading(false);
      }
    });
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setQrSize(Math.min(width, height));
  };

  return (
    <View style={style().view} onLayout={handleLayout}>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      {qrValue && (
        <QRCode
          value={qrValue}
          size={qrSize}
          getRef={(c) => (svgRef.current = c)}
          quietZone={20}
        />
      )}
      <View style={style().containerView}>
        <RoundedButton
          text="Descargar QR"
          style={style().button}
          enabled={!downloading && !!qrValue}
          onPress={downloadQR}
        />
      </View>
    </View>
  );
}

export default EvaluationQR;
