import React from 'react';
import { SafeAreaView } from 'react-native';
import { CommissionInscriptionList } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { commissionInscriptionsRepository } from '../../repositories';

export function CommissionInscriptions() {
  return (
    <SafeAreaView style={style().view}>
      <CommissionInscriptionList
        key="Materias en curso"
        fetch={() => commissionInscriptionsRepository.fetchCurrentInscriptions()}
        emptyMessage={`No tenés materias en instancia de final.${'\n\n'}`} 
        />
    </SafeAreaView>
  );
};

export default CommissionInscriptions;
