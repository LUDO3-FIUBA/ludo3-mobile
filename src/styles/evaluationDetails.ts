import { StyleSheet } from 'react-native';
import { lightModeColors } from './colorPalette';

export const evaluationDetailsTextStyles = StyleSheet.create({
  passingGradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  passingGradeLabel: {
    fontSize: 14,
    color: 'gray',
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  progressTextSmall: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export const evaluationDetailsSharedStyles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header2: {
    fontSize: 20,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardText: {
    color: 'gray',
  },
  clickableLabel: {
    textDecorationLine: 'underline',
  },
  iconMargin: {
    marginRight: 10,
  },
  lateText: {
    color: '#E67E22',
  },
  lateWarning: {
    color: '#E67E22',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  lateByText: {
    color: '#E67E22',
    fontSize: 12,
    marginTop: 2,
  },
});

export const evaluationResultCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18,
  },
  centerSection: {
    alignItems: 'center',
    gap: 8,
  },
  editHint: {
    fontSize: 12,
    color: 'gray',
  },
});

export const evaluationDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 10,
  },
  editorCard: {
    gap: 10,
    paddingTop: 8,
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  editorInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: lightModeColors.institutional,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: lightModeColors.institutional,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButton: {
    backgroundColor: lightModeColors.institutional,
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitHintText: {
    fontSize: 13,
    color: 'gray',
  },
});
