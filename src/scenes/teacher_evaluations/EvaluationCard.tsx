import React from 'react';
import { View, Text } from 'react-native';
import { TeacherStudent } from '../../models/TeacherStudent';
import FormInput from '../../components/FormInput';
import { finalExamCard as style } from '../../styles';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';

export interface EvaluationCardProps {
  evaluation: TeacherEvaluation;
  initialGrade?: number;
  disabled: boolean;
  // onGradeChanged?: (grade?: number) => void;
  // onGradeUnchanged?: (grade?: number) => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  initialGrade = null,
  disabled,
  // onGradeChanged = null,
  // onGradeUnchanged = null,
}) => {
  const handleTextChanged = (text: string, isValid: boolean) => {
    let newGrade = null;
    if (isValid && text) {
      newGrade = parseInt(text);
    }

    evaluation.grade = newGrade;

    // if (newGrade === initialGrade) {
    //   onGradeUnchanged?.(newGrade || 0);
    // } else {
    //   onGradeChanged?.(newGrade || 0);
    // }
  };

  return (
    <View style={style().view}>
      <View style={style().studentInfo}>
        <Text style={style().padron}>{evaluation.student.padron}</Text>
        <Text style={style().name}>
          {evaluation.student.lastName}, {evaluation.student.firstName}
        </Text>
      </View>
      <View style={style().gradeInfo}>
        <FormInput
          disabled={disabled}
          style={style().grade}
          placeholderColor={style().textInputPlaceholder.color}
          errorStyle={style().errorInInput}
          keyboardType="numeric"
          placeholder=""
          initialValue={evaluation.grade != null ? evaluation.grade.toString() : ''}
          blurOnSubmit={false}
          onTextChanged={handleTextChanged}
          validation={{
            numericality: {
              onlyInteger: true,
              lessThanOrEqualTo: 10,
              message: ' ',
            },
          }}
        />
        {!evaluation.hasAllCorrelatives && <Text style={style().warning}>⚠️</Text>}
      </View>
    </View>
  );
};

export default EvaluationCard;
