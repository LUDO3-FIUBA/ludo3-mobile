import React from 'react';
import {SafeAreaView, Alert} from 'react-native';
import {FinalExamList, FilterDescriptor} from '../../components';
import {getStyleSheet as style} from '../../styles';
import {finalExamsRepository} from '../../repositories';
import AuthenticatedComponent from '../authenticatedComponent';
import {CorrelativeFilter} from './filters.ts';

export default class ApprovedSubjects extends AuthenticatedComponent {
  constructor(props) {
    super(props);
    this.state = {
      filter: this.props.filter,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filter !== this.props.filter) {
      this.setState({filter: this.props.filter});
    }
  }

  render() {
    const {navigation} = this.props;
    const {filter} = this.state;
    return (
      <SafeAreaView style={style().view}>
        {filter && (
          <FilterDescriptor
            filter={filter}
            onClose={() => this.setState({filter: null})}
          />
        )}
        <FinalExamList
          key={`ApprovedSubjects-${filter ? filter.id() : ''}`}
          navigation={navigation}
          fetch={() => {
            if (filter && filter instanceof CorrelativeFilter) {
              return this.request(() =>
                finalExamsRepository.fetchApprovedCorrelatives(filter.value),
              ).catch(error => {
                if (error instanceof finalExamsRepository.NotASubject) {
                  Alert.alert(
                    'No existe esa materia',
                    'Chequeá bien el código y asegurate de escribirlo tal cual (con el punto inclusive).',
                  );
                  return Promise.resolve([]);
                } else {
                  console.log('Error', error);
                  return Promise.reject(error);
                }
              });
            } else if (filter) {
              return this.request(() =>
                finalExamsRepository.fetchApproved(filter.type, filter.value),
              );
            } else {
              return this.request(() => finalExamsRepository.fetchApproved());
            }
          }}
          emptyMessage={`No tenés materias aprobadas aún.${'\n'}No te olvides de rendir los finales.`}
        />
      </SafeAreaView>
    );
  }
}
