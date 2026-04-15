import React from 'react';
import { Linking } from 'react-native';
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

export function SubmissionTextCard({ submissionText }: { submissionText?: string | null }) {
  const normalizedText = (submissionText || '').trim();
  const linkRegex = /((https?:\/\/|www\.)[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?)/gi;

  const openLink = async (linkToOpen?: string) => {
    if (!linkToOpen) return;
    try {
      await Linking.openURL(linkToOpen);
    } catch (error) {
      console.error('No se pudo abrir el enlace.', error);
    }
  };

  const renderTextWithLinks = () => {
    const parts: Array<{ text: string; isLink: boolean; url?: string }> = [];
    let lastIndex = 0;
    let match = linkRegex.exec(normalizedText);

    while (match) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        parts.push({ text: normalizedText.slice(lastIndex, start), isLink: false });
      }

      const rawUrl = match[0];
      const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      parts.push({ text: rawUrl, isLink: true, url: normalizedUrl });

      lastIndex = end;
      match = linkRegex.exec(normalizedText);
    }

    if (lastIndex < normalizedText.length) {
      parts.push({ text: normalizedText.slice(lastIndex), isLink: false });
    }

    return (
      <Text style={styles.submissionText}>
        {parts.map((part, index) => (
          <Text
            key={`${part.text}-${index}`}
            style={part.isLink ? styles.linkText : styles.submissionText}
            onPress={part.isLink ? () => openLink(part.url) : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Comentarios</Text>
      {!normalizedText ? (
        <Text style={styles.emptyText}>Esta entrega no incluye texto adicional.</Text>
      ) : (
        renderTextWithLinks()
      )}
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
