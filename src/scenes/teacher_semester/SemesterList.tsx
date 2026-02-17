// Deprecated class
// import React, { useCallback, useEffect, useState } from 'react';
// import { FlatList, Text, View, TouchableOpacity, Alert } from 'react-native';
// import { getStyleSheet as style } from '../../styles';
// import { SemesterCard } from './SemesterCard';

// const semesters = [
//   {
//     id: 1,
//     code: '7507',
//     color: '#FF0000',
//     semesterName: 'Primer Cuatrimestre 2020',
//     semesterCode: '1C2020',
//   },
//   {
//     id: 2,
//     code: '7511',
//     color: '#FF0000',
//     name: 'Primer Cuatrimestre 2020',
//     nameCode: '1C2020',
//   },
// ];

// interface SemesterListProps {
//   navigation: any;  // Specify a more accurate type if possible
// }

// const SemesterList: React.FC<SemesterListProps> = ({ navigation }) => {
//   const [semesterData, setSemesterData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchData = useCallback(
//     (isRefreshing: boolean = false) => {
//       if (loading || refreshing) {
//         return;
//       }
//       isRefreshing ? setRefreshing(true) : setLoading(true);

//       try {
//         // set semester data with timeout
//         setTimeout(() => {
//           isRefreshing ? setRefreshing(false) : setLoading(false);
//           setSemesterData(semesters);  // Use the semesters array defined at the top
//         }, 1000);  // Mock a 1-second delay
//       } catch (error) {
//         isRefreshing ? setRefreshing(false) : setLoading(false);
//         Alert.alert(
//           '¿Qué pasó?',
//           'No sabemos pero no pudimos buscar tus cuatrimestres. ' +
//             'Volvé a intentar en unos minutos.',
//         );
//       }
//     },
//     [loading, refreshing],
//   );

//   useEffect(() => {
//     fetchData();
//     // const focusUnsubscribe = navigation.addListener('focus', () => {
//     // });
//     // return () => focusUnsubscribe();
//   }, [navigation, fetchData]);

//   return (
//     <View>
//       <FlatList
//         contentContainerStyle={style().listView}
//         data={semesterData}
//         onRefresh={() => fetchData(true)}
//         refreshing={refreshing}
//         keyExtractor={(semester) => semester.id.toString()}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() => {
//               // navigation.navigate('SubjectsList', {
//               //   subject: item.subject?.toObject(),
//               // });
//               console.log("Pressed on a semester");

//             }}>
//             {/* <SemesterCard/>  */}
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

// export default SemesterList;
