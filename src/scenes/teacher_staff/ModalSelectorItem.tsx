import { View, Text } from 'react-native'
import React from 'react'

interface Props {
  label: string
}

const ModalSelectorItem = ({ label }: Props) => {
  return (
    <View style={{ backgroundColor: 'transparent', alignItems: 'center' }}>
      <Text style={{ color: 'black' }}>
        { label }
      </Text>
    </View>
  )
}

export default ModalSelectorItem
