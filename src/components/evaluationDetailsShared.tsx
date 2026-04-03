import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { lightModeColors } from '../styles/colorPalette';
import MaterialIcon from './materialIcon';
import { evaluationDetailsSharedStyles as styles, evaluationDetailsTextStyles } from '../styles/evaluationDetails';

export function EvaluationDetailsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.header2}>{subtitle}</Text>
    </>
  );
}

export function EvaluationDateRangeCard({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardItem}>
        <MaterialIcon name="calendar-clock" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
        <View style={{ flexGrow: 1 }}>
          <Text style={styles.cardTitle}>Inicio</Text>
          <Text style={styles.cardText}>{startDate}</Text>
        </View>
        <MaterialIcon name="chevron-right" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
        <View style={{ flexGrow: 0.5 }}>
          <Text style={styles.cardTitle}>Fin</Text>
          <Text style={styles.cardText}>{endDate}</Text>
        </View>
      </View>
    </View>
  );
}

export function SubmissionDateRow({ dateText, isLate, lateByText }: { dateText: string; isLate: boolean; lateByText: string | null }) {
  return (
    <View style={styles.cardItem}>
      <MaterialIcon name="calendar-today" fontSize={24} color={isLate ? '#E67E22' : lightModeColors.institutional} style={styles.iconMargin} />
      <View>
        <Text style={[evaluationDetailsTextStyles.passingGradeText, isLate && styles.lateText]}>{dateText}</Text>
        <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Fecha de entrega</Text>
        {isLate && <Text style={styles.lateWarning}>Entregado fuera de término</Text>}
        {isLate && lateByText && <Text style={styles.lateByText}>Se entregó con {lateByText} de retraso</Text>}
      </View>
    </View>
  );
}

export function GraderUpdatedCard({
  graderName,
  updatedAt,
  onPressGrader,
  canEditGrader,
  bottomMargin = 120,
}: {
  graderName: string;
  updatedAt: string;
  onPressGrader?: () => void;
  canEditGrader?: boolean;
  bottomMargin?: number;
}) {
  return (
    <View style={[styles.card, { marginBottom: bottomMargin }]}>
      <View style={styles.cardItem}>
        <MaterialIcon name="account-supervisor" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
        {onPressGrader ? (
          <TouchableOpacity onPress={onPressGrader} disabled={!canEditGrader}>
            <Text style={[evaluationDetailsTextStyles.passingGradeText, canEditGrader && styles.clickableLabel]}>{graderName}</Text>
            <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Corrector</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={evaluationDetailsTextStyles.passingGradeText}>{graderName}</Text>
            <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Corrector</Text>
          </View>
        )}
      </View>

      <View style={styles.cardItem}>
        <MaterialIcon name="calendar-edit" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
        <View>
          <Text style={evaluationDetailsTextStyles.passingGradeText}>{updatedAt}</Text>
          <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Última fecha de actualización</Text>
        </View>
      </View>
    </View>
  );
}
