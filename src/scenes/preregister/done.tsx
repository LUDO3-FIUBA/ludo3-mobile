import React, { FunctionComponent } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { RoundedButton } from '../../components';
import { preregisterDone as style } from '../../styles';

interface PreRegisterLastInstructionsProps {
  navigation: any; // You can specify the exact type based on your navigation setup
}

const PreRegisterLastInstructions: FunctionComponent<PreRegisterLastInstructionsProps> = ({ navigation }) => {
  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <ScrollView contentContainerStyle={style().scrollView}>
          <Text style={style().text}>
            ¡Ya has quedado registrado en nuestro sistema!
          </Text>
          <Text style={style().text}>
            Cuando te aprueben las imágenes y te notifiquen de la creación de
            tu cuenta en el SIU Guaraní, podrás loguearte en esta app con la
            misma contraseña que usás en ese sistema.
          </Text>
        </ScrollView>
        <RoundedButton
          text="LISTO"
          style={style().button}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Landing' }],
            })
          }
        />
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterLastInstructions;
