import React from 'react';
import AuthenticatedComponent from '../authenticatedComponent';
import {SafeAreaView} from 'react-native';
import {FinalExamList} from '../../components';
import {getStyleSheet as style} from '../../styles';
import {finalExamsRepository} from '../../repositories';

export default class PendingSubjects extends AuthenticatedComponent {
  render() {
    const {navigation} = this.props;
    return (
      <SafeAreaView style={style().view}>
        <FinalExamList
          key="PendingSubjects"
          navigation={navigation}
          fetch={() => this.request(() => finalExamsRepository.fetchPending())}
          emptyMessage={`No tenés materias pendientes de aprobar aún.${'\n'}El camino recién comienza.`}
        />
      </SafeAreaView>
    );
  }
}
