import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../styles/colorPalette';
import { evaluationDetailsTextStyles, evaluationResultCardStyles as styles } from '../styles/evaluationDetails';

type Props = {
  progress: number;
  circleText: string;
  failed: boolean;
  isNumericEvaluation: boolean;
  passingGrade?: number | null;
  onPressCircle?: () => void;
  showEditHint?: boolean;
  children?: React.ReactNode;
};

export function EvaluationResultCard({
  progress,
  circleText,
  failed,
  isNumericEvaluation,
  passingGrade,
  onPressCircle,
  showEditHint = false,
  children,
}: Props) {
  const circleTextStyle =
    circleText === 'Aprobado' || circleText === 'Desaprobado'
      ? evaluationDetailsTextStyles.progressTextSmall
      : evaluationDetailsTextStyles.progressText;

  return (
    <View style={styles.card}>
      <View style={styles.centerSection}>
        <TouchableOpacity activeOpacity={onPressCircle ? 0.8 : 1} onPress={onPressCircle} disabled={!onPressCircle}>
          <Progress.Circle
            progress={progress}
            formatText={() => String(circleText)}
            color={failed ? lightModeColors.failed : lightModeColors.passed}
            unfilledColor={failed ? lightModeColors.failedBackground : lightModeColors.passedBackground}
            strokeCap="round"
            size={135}
            thickness={12}
            showsText
            borderWidth={0}
            textStyle={circleTextStyle}
          />
        </TouchableOpacity>
        <Text style={evaluationDetailsTextStyles.passingGradeLabel}>
          {isNumericEvaluation ? 'Nota obtenida' : 'Estado de entrega'}
        </Text>
        {showEditHint && <Text style={styles.editHint}>Presionar para editar</Text>}
      </View>

      {children}

      {isNumericEvaluation && (
        <View>
          <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Nota mínima de aprobación: {passingGrade ?? '–'}</Text>
        </View>
      )}
    </View>
  );
}

