import React, { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import downloadFile from '../utils/downloadFile';
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

export function EvaluationDescriptionCard({ markdownText }: { markdownText?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const normalizedMarkdown = (markdownText || '').trim();
  const toggle = () => setExpanded((v) => !v);

  const markdownPreviewStyle = expanded ? {} : { maxHeight: 96, overflow: 'hidden' as const };

  if (!normalizedMarkdown) return null;

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <TouchableOpacity onPress={toggle}>
          <Text style={styles.linkText}>{expanded ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>
      </View>
      <View style={markdownPreviewStyle}>
        <Markdown
          style={{
            body: styles.submissionText,
            heading1: { fontSize: 22, fontWeight: '700', marginTop:12, marginBottom: 8, lineHeight: 28 },
            heading2: { fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 6, lineHeight: 20 },
            paragraph: { marginBottom: 8 },
          }}
        >
          {normalizedMarkdown}
        </Markdown>
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
      <Text style={styles.sectionTitle}>Comentarios del alumno</Text>
      {!normalizedText ? (
        <Text style={styles.emptyText}>Esta entrega no incluye texto adicional.</Text>
      ) : (
        renderTextWithLinks()
      )}
    </View>
  );
}

export function FeedbackCard({ feedbackText }: { feedbackText?: string | null }) {
  const normalizedFeedback = (feedbackText || '').trim();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Feedback del docente</Text>
      {!normalizedFeedback ? (
        <Text style={styles.emptyText}>El docente no ha añadido ningún comentario.</Text>
      ) : (
        <Markdown
          style={{
            body: styles.submissionText,
            heading1: { fontSize: 22, fontWeight: '700', marginBottom: 8, lineHeight: 28 },
            heading2: { fontSize: 18, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
            paragraph: { marginBottom: 8 },
          }}
        >
          {normalizedFeedback}
        </Markdown>
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

export function SubmissionFileCard({ submissionFile, originalFilename, downloadUrl }: { submissionFile?: string | null; originalFilename?: string | null; downloadUrl?: string | null }) {
  const fileName = originalFilename || (submissionFile ? 'Archivo' : null);

  const handleDownload = async (url?: string, downloadName?: string | null, submissionDownloadUrl?: string | null) => {
    try {
      await downloadFile(url, downloadName, submissionDownloadUrl);
    } catch (error) {
      console.error('No se pudo descargar el archivo.', error);
    }
  };

  return (
    <View style={[styles.card]}>
      <Text style={styles.sectionTitle}>Archivo de entrega</Text>
      {!fileName || !submissionFile ? (
        <Text style={styles.emptyText}>No se ha entregado ningún archivo.</Text>
      ) : (
        <View style={styles.cardItem}>
          <MaterialIcon name="file-document" fontSize={24} color={lightModeColors.institutional} style={styles.iconMargin} />
          <View style={styles.filenameContainer}>
            <Text style={styles.submissionTextSingleLine} numberOfLines={1} ellipsizeMode="tail">
              {fileName}
            </Text>
          </View>
          <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(submissionFile, fileName, downloadUrl)}>
            <MaterialIcon name="download" fontSize={24} color={lightModeColors.institutional} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
