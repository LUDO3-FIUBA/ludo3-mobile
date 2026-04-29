import React, { FC, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IsPassing } from '../models';
import { semestersRepository } from '../repositories';
import { lightModeColors } from '../styles/colorPalette';
import { MaterialIcon } from '.';

interface IsPassingCardProps {
  semesterId: number;
}

interface CardData {
  cardStyle: object;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

const IsPassingCard: FC<IsPassingCardProps> = ({ semesterId }) => {
  const [isPassing, setIsPassing] = useState<IsPassing | null>(null);
  const cardData: CardData = {} as CardData;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsPassing(null);
    try {
      const fetchedPassing = await semestersRepository.fetchIsPassing(semesterId);
      setIsPassing(fetchedPassing);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const passed = isPassing?.passed ?? false;
  const failed = isPassing?.failed ?? false;
  
  if (!failed && !passed) {
    return null
  }

  if (failed) {
    cardData.cardStyle = styles.failedCard;
    cardData.icon = "close-thick"
    cardData.iconColor = '#BD4242'
    cardData.title = "No aprobaste"
    cardData.subtitle = "Has incumplido alguna de las condiciones de aprobación. Esto incluye cantidad de asistencias mínimas y/o aprobación de evaluaciones obligatorias. Para más información, consultá con el Cuerpo Docente"
  }
  else if (passed) {
    cardData.cardStyle = styles.passedCard;
    cardData.icon = "check-bold"
    cardData.iconColor = '#82bc41'
    cardData.title = "Regularizaste la materia"
    cardData.subtitle = "Cumpliste con todas las condiciones de aprobación de la materia. ¡Felicidades! No te olvides de rendir el coloquio"
  }

  return (
    <View style={[styles.card, cardData.cardStyle]}>
      <View style={styles.cardItem}>
        <MaterialIcon name={cardData.icon} fontSize={52} color={cardData.iconColor} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{cardData.title}</Text>
          <Text style={styles.subtitle}>{cardData.subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

export default IsPassingCard;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
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
    gap: 18
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.black,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
  },
  failedCard: { backgroundColor: '#FCF0F0', borderColor: '#BD4242', borderWidth: 1 },
  passedCard: { backgroundColor: '#f0fdf4', borderColor: '#82bc41', borderWidth: 1 }
});
