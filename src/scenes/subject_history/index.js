import React from 'react';
import {SafeAreaView} from 'react-native';
import {FinalExamList} from '../../components';
import {getStyleSheet as style} from '../../styles';
import {finalExamsRepository} from '../../repositories';
import {Subject} from '../../models';
import AuthenticatedComponent from '../authenticatedComponent';

export default class SubjectHistory extends AuthenticatedComponent {
  constructor(props) {
    super(props);
    this.subject = null;
  }

  getSubject() {
    if (this.subject) {
      return this.subject;
    }
    if (
      this.props.route &&
      this.props.route.params &&
      this.props.route.params.subject
    ) {
      this.subject = Subject.fromObject(this.props.route.params.subject);
    } else {
      this.subject = this.props.subject;
    }
    return this.subject;
  }

  render() {
    const {navigation} = this.props;
    return (
      <SafeAreaView style={style().view}>
        <FinalExamList
          key={`SubjectHistory-${this.getSubject().code}`}
          navigation={navigation}
          fetch={() => {
            return this.request(() =>
              finalExamsRepository.fetchForSubject(this.getSubject().id),
            );
          }}
          emptyMessage={
            'Debe de haber algún error porque no registramos nada en el historial.'
          }
        />
      </SafeAreaView>
    );
  }
}
