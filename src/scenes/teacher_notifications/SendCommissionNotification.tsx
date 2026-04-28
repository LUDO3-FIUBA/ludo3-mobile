import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcon, RoundedButton } from '../../components';
import { notificationsRepository } from '../../repositories';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
    semesterId: number;
    subjectName?: string;
    studentsCount?: number;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {children}
    </View>
);

const TextInputField: React.FC<TextInputProps> = ({ style, ...props }) => (
    <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#aaa"
        {...props}
    />
);

const SendCommissionNotification: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { semesterId, subjectName, studentsCount } = (route.params || {}) as RouteParams;

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [image, setImage] = useState<{ uri: string; type: string; name: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para adjuntar imágenes.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const ext = asset.uri.split('.').pop() ?? 'jpg';
            setImage({
                uri: asset.uri,
                type: asset.mimeType ?? `image/${ext}`,
                name: asset.fileName ?? `notification.${ext}`,
            });
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Falta el título', 'Ingresá un título para el aviso.');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Falta el mensaje', 'Ingresá el contenido del aviso.');
            return;
        }

        setSaving(true);
        try {
            await notificationsRepository.sendCommissionNotification({
                semesterId,
                title: title.trim(),
                message: message.trim(),
                isUrgent,
                image,
            });
            Alert.alert('Aviso enviado', 'Los alumnos del cuatrimestre lo van a recibir.');
            navigation.goBack();
        } catch {
            Alert.alert('Error', 'No se pudo enviar el aviso. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {(subjectName || typeof studentsCount === 'number') && (
                    <View style={styles.summaryCard}>
                        {subjectName ? (
                            <Text style={styles.summarySubject} numberOfLines={1}>{subjectName}</Text>
                        ) : null}
                        {typeof studentsCount === 'number' ? (
                            <View style={styles.summaryRow}>
                                <MaterialIcon name="account-group" fontSize={16} color="#6b7280" />
                                <Text style={styles.summaryText}>
                                    Destinatarios: {studentsCount} {studentsCount === 1 ? 'alumno' : 'alumnos'} del cuatrimestre
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.summaryRow}>
                                <MaterialIcon name="account-group" fontSize={16} color="#6b7280" />
                                <Text style={styles.summaryText}>
                                    Destinatarios: alumnos inscriptos al cuatrimestre
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <Field label="Título *">
                    <TextInputField
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ej: Cambio de aula"
                        maxLength={200}
                    />
                </Field>

                <Field label="Mensaje *">
                    <TextInputField
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Detallá el aviso..."
                        multiline
                        style={styles.textArea}
                    />
                </Field>

                <Field label="Opciones">
                    <View style={styles.toggleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.toggleLabel}>Urgente</Text>
                            <Text style={styles.toggleHint}>Se destaca en rojo para los alumnos</Text>
                        </View>
                        <Switch
                            value={isUrgent}
                            onValueChange={setIsUrgent}
                            trackColor={{ true: lightModeColors.institutional }}
                        />
                    </View>
                </Field>

                <Field label="Imagen (opcional)">
                    {image ? (
                        <View>
                            <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="cover" />
                            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                                <MaterialIcon name="close-circle" fontSize={22} color="#ef4444" />
                                <Text style={styles.removeImageText}>Quitar imagen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            <MaterialIcon name="image-plus" fontSize={24} color="#6b7280" />
                            <Text style={styles.imagePickerText}>Adjuntar imagen</Text>
                        </TouchableOpacity>
                    )}
                </Field>

                <RoundedButton
                    text={saving ? 'Enviando...' : 'Enviar aviso'}
                    enabled={!saving}
                    onPress={handleSubmit}
                    style={{}}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        gap: 18,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    summarySubject: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryText: {
        fontSize: 13,
        color: '#6b7280',
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#111',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 8,
    },
    toggleLabel: {
        fontSize: 15,
        color: '#111',
    },
    toggleHint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    imagePicker: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    imagePickerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 8,
    },
    removeImage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    removeImageText: {
        color: '#ef4444',
        fontSize: 14,
    },
});

export default SendCommissionNotification;
