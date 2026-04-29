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
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcon, RoundedButton } from '../../components';
import { adminNotificationsRepository } from '../../repositories';

const GROUPS = [
    { key: 'all', label: 'Todos' },
    { key: 'students', label: 'Alumnos' },
    { key: 'teachers', label: 'Docentes' },
    { key: 'staff', label: 'Administrativos' },
];

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {children}
    </View>
);

const NotificationForm: React.FC = () => {
    const navigation = useNavigation<any>();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [sendPush, setSendPush] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [image, setImage] = useState<{ uri: string; type: string; name: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const toggleGroup = (key: string) => {
        if (key === 'all') {
            setSelectedGroups(prev => prev.includes('all') ? [] : ['all']);
            return;
        }
        setSelectedGroups(prev => {
            const without = prev.filter(g => g !== 'all');
            return without.includes(key)
                ? without.filter(g => g !== key)
                : [...without, key];
        });
    };

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
            Alert.alert('Error', 'El título es obligatorio.');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Error', 'El mensaje es obligatorio.');
            return;
        }
        if (selectedGroups.length === 0) {
            Alert.alert('Error', 'Seleccioná al menos un grupo destinatario.');
            return;
        }

        setSaving(true);
        try {
            await adminNotificationsRepository.createNotification({
                title: title.trim(),
                message: message.trim(),
                isUrgent,
                sendPush,
                sendEmail,
                recipientGroups: selectedGroups,
                image,
            });
            Alert.alert('Enviada', 'La notificación fue enviada correctamente.');
            navigation.goBack();
        } catch {
            Alert.alert('Error', 'No se pudo enviar la notificación. Intentá de nuevo.');
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

                <Field label="Título *">
                    <TextInputField value={title} onChangeText={setTitle} placeholder="Ej: Cambio de aula" />
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

                <Field label="Destinatarios *">
                    <View style={styles.groupsGrid}>
                        {GROUPS.map(g => {
                            const active = selectedGroups.includes(g.key);
                            return (
                                <TouchableOpacity
                                    key={g.key}
                                    style={[styles.groupChip, active && styles.groupChipActive]}
                                    onPress={() => toggleGroup(g.key)}
                                >
                                    <Text style={[styles.groupChipText, active && styles.groupChipTextActive]}>
                                        {g.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Field>

                <Field label="Opciones">
                    <ToggleRow label="Urgente" value={isUrgent} onValueChange={setIsUrgent} />
                    <ToggleRow label="Enviar push" value={sendPush} onValueChange={setSendPush} />
                    <ToggleRow label="Enviar email" value={sendEmail} onValueChange={setSendEmail} />
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
                    text={saving ? 'Enviando...' : 'Enviar notificación'}
                    enabled={!saving}
                    onPress={handleSubmit}
                    style={{}}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

import { TextInput, TextInputProps } from 'react-native';

const TextInputField: React.FC<TextInputProps> = ({ style, ...props }) => (
    <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#aaa"
        {...props}
    />
);

const ToggleRow: React.FC<{ label: string; value: boolean; onValueChange: (v: boolean) => void }> = ({
    label, value, onValueChange,
}) => (
    <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#3b82f6' }} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        gap: 20,
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    groupsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    groupChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
    },
    groupChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    groupChipText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    groupChipTextActive: {
        color: '#fff',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 6,
    },
    toggleLabel: {
        fontSize: 15,
        color: '#111',
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

export default NotificationForm;
