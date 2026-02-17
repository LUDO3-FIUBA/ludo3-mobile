import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { finalExamCard as style } from '../../styles';
import { TeacherFinalExam } from '../../models/TeacherFinalExam';
import { teacherFinalsRepository } from '../../repositories';
import { TeacherFinal } from '../../models/TeacherFinal';
import { FinalExamSubmissionStudentCard } from '../../components/FinalExamSubmissionStudentCard';

interface FinalExamCardProps {
  final: TeacherFinal;
  finalExamSubmission: TeacherFinalExam;
  initialGrade?: number;
  disabled: boolean;
}

interface FormValues {
  grade: string;
}

const validationSchema = Yup.object().shape<any>({
  grade: Yup.number()
    .typeError('Grade must be a number')
    .integer('Grade must be an integer')
    .min(1, 'Grade must be greater than or equal to 0')
    .max(10, 'Grade must be less than or equal to 10')
    .required('Grade is required'),
});

const FinalExamSubmissionsCard: React.FC<FinalExamCardProps> = ({
  final,
  finalExamSubmission,
  initialGrade = null,
  disabled,
}) => {
  // Custom handleChange to prevent invalid input
  const customHandleChange = (
    setFieldValue: (field: string, value: any) => void
  ) => (text: string) => {
    const numericValue = parseInt(text, 10);

    // Allow only numbers between 0 and 10, or empty input
    if (text === '' || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10)) {
      setFieldValue('grade', text);
      teacherFinalsRepository.grade(final.id, [{ finalExamSubmissionId: finalExamSubmission.id, grade: numericValue }]);
    }
  };

  return (
    <Formik<FormValues>
      initialValues={{ grade: finalExamSubmission.grade?.toString() || '' }}
      validationSchema={validationSchema}
      onSubmit={() => { }}
    >
      {({ setFieldValue, handleBlur, values, errors, touched }) => (
        <View style={style().view}>
          <FinalExamSubmissionStudentCard student={finalExamSubmission.student} />
          <View style={style().gradeInfo}>
            <TextInput
              onChangeText={customHandleChange(setFieldValue)}
              onBlur={handleBlur('grade')}
              value={values.grade}
              keyboardType="numeric"
              editable={!disabled}
            />
            {touched.grade && errors.grade && <Text style={style().warning}>{errors.grade}</Text>}
            {!finalExamSubmission.correlativesApproved && <Text style={style().warning}>&#x26A0;&#xFE0F;</Text>}
          </View>
        </View>
      )}
    </Formik>
  );
};

export default FinalExamSubmissionsCard;
