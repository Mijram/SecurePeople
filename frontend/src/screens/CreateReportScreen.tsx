import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Colors, getCategoryColor } from '../theme/colors';
import { Button } from '../components/Button';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

const CATEGORIES = [
  { label: 'Robo', icon: '🔫' },
  { label: 'Accidente', icon: '🚗' },
  { label: 'Incendio', icon: '🔥' },
  { label: 'Emergencia médica', icon: '🚑' },
  { label: 'Manifestación', icon: '📢' },
  { label: 'Obstrucción vial', icon: '🚧' },
  { label: 'Situación sospechosa', icon: '👁️' },
  { label: 'Otro', icon: '⚠️' },
];

// Bogotá center
const BOGOTA = { latitude: 4.7110, longitude: -74.0721 };

// Simulated Bogotá locations
const BOGOTA_LOCATIONS = [
  { name: 'Centro Histórico', lat: 4.5981, lng: -74.0761 },
  { name: 'Chapinero', lat: 4.6486, lng: -74.0628 },
  { name: 'Usaquén', lat: 4.6950, lng: -74.0310 },
  { name: 'Suba', lat: 4.7588, lng: -74.0830 },
  { name: 'Kennedy', lat: 4.6280, lng: -74.1500 },
  { name: 'Bosa', lat: 4.5900, lng: -74.1900 },
  { name: 'Engativá', lat: 4.7050, lng: -74.1100 },
  { name: 'Fontibón', lat: 4.6700, lng: -74.1450 },
  { name: 'Teusaquillo', lat: 4.6351, lng: -74.0703 },
  { name: 'Barrios Unidos', lat: 4.6700, lng: -74.0800 },
  { name: 'Puente Aranda', lat: 4.6200, lng: -74.1000 },
  { name: 'Rafael Uribe', lat: 4.5700, lng: -74.1100 },
];

export function CreateReportScreen() {
  const navigation = useNavigation();
  const { createReport } = useReports();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dangerLevel, setDangerLevel] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerCoords, setMapPickerCoords] = useState(BOGOTA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const charCount = description.length;
  const maxChars = 500;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!dangerLevel || dangerLevel < 1 || dangerLevel > 10) {
      newErrors.dangerLevel = 'Selecciona el nivel de peligro (1-10)';
    }

    if (!selectedLocation) {
      newErrors.location = 'Selecciona una ubicación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createReport({
        description: description.trim(),
        category,
        danger_level: dangerLevel,
        latitude: selectedLocation!.lat,
        longitude: selectedLocation!.lng,
        address: selectedLocation!.name,
      });

      Alert.alert(
        '✅ Reporte publicado',
        'Tu reporte ha sido publicado y ya es visible en el mapa.',
        [{ text: 'Ver en mapa', onPress: () => navigation.goBack() }]
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al publicar el reporte';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = () => {
    setSelectedLocation({
      lat: mapPickerCoords.latitude,
      lng: mapPickerCoords.longitude,
      name: `${mapPickerCoords.latitude.toFixed(4)}, ${mapPickerCoords.longitude.toFixed(4)}`,
    });
    setShowMapPicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo reporte</Text>
        <TouchableOpacity
          style={[styles.publishButton, loading && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.publishText}>{loading ? '...' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* User info */}
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.nickname?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.userNickname}>@{user?.nickname}</Text>
            <Text style={styles.userSubtitle}>Reporte ciudadano · Bogotá</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="¿Qué está pasando? Describe la situación con detalle..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={text => {
              if (text.length <= maxChars) {
                setDescription(text);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }
            }}
            multiline
            maxLength={maxChars}
            textAlignVertical="top"
          />
          <View style={styles.charCountRow}>
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : <View />}
            <Text style={[styles.charCount, charCount > maxChars * 0.9 && styles.charCountWarning]}>
              {charCount}/{maxChars}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Category selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría *</Text>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryChip,
                  category === cat.label && {
                    backgroundColor: `${getCategoryColor(cat.label)}22`,
                    borderColor: getCategoryColor(cat.label),
                  },
                ]}
                onPress={() => {
                  setCategory(cat.label);
                  if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                }}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryChipText,
                  category === cat.label && { color: getCategoryColor(cat.label), fontWeight: '600' },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Danger level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de peligro *</Text>
          {errors.dangerLevel && <Text style={styles.errorText}>{errors.dangerLevel}</Text>}
          <Text style={styles.sectionSubtitle}>
            {dangerLevel === 0 ? 'Selecciona del 1 (bajo) al 10 (crítico)' :
              `Nivel ${dangerLevel}/10 — ${dangerLevel <= 3 ? 'Bajo' : dangerLevel <= 6 ? 'Moderado' : dangerLevel <= 8 ? 'Alto' : 'Crítico'}`}
          </Text>
          <View style={styles.dangerLevels}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(level => {
              const color = level <= 3 ? '#4CAF50' : level <= 6 ? '#FF9800' : level <= 8 ? '#F44336' : '#B71C1C';
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.dangerButton,
                    dangerLevel === level && { backgroundColor: color, borderColor: color },
                    dangerLevel !== level && { borderColor: `${color}66` },
                  ]}
                  onPress={() => {
                    setDangerLevel(level);
                    if (errors.dangerLevel) setErrors(prev => ({ ...prev, dangerLevel: '' }));
                  }}
                >
                  <Text style={[
                    styles.dangerButtonText,
                    dangerLevel === level && styles.dangerButtonTextActive,
                    dangerLevel !== level && { color: `${color}99` },
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación *</Text>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          {selectedLocation && (
            <View style={styles.selectedLocation}>
              <Text style={styles.selectedLocationIcon}>📍</Text>
              <Text style={styles.selectedLocationText}>{selectedLocation.name}</Text>
              <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                <Text style={styles.clearLocation}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.locationButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationButtonIcon}>🏙️</Text>
              <Text style={styles.locationButtonText}>Barrio de Bogotá</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowMapPicker(true)}
            >
              <Text style={styles.locationButtonIcon}>🗺️</Text>
              <Text style={styles.locationButtonText}>Seleccionar en mapa</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.locationNote}>
            🔒 Tu ubicación real no se comparte sin tu permiso
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Disclaimer */}
        <DisclaimerBanner compact />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Location picker modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationPicker(false)}
        >
          <View style={styles.locationModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Seleccionar barrio</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {BOGOTA_LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc.name}
                  style={styles.locationItem}
                  onPress={() => {
                    setSelectedLocation({ lat: loc.lat, lng: loc.lng, name: loc.name + ', Bogotá' });
                    setShowLocationPicker(false);
                    if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                  }}
                >
                  <Text style={styles.locationItemIcon}>📍</Text>
                  <Text style={styles.locationItemText}>{loc.name}, Bogotá</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Map picker modal */}
      <Modal
        visible={showMapPicker}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.mapPickerContainer}>
          <View style={styles.mapPickerHeader}>
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Text style={styles.mapPickerCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.mapPickerTitle}>Toca para seleccionar</Text>
            <TouchableOpacity onPress={handleMapLocationSelect}>
              <Text style={styles.mapPickerConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.mapPicker}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              ...BOGOTA,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            customMapStyle={[
              { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
            ]}
            onPress={e => setMapPickerCoords(e.nativeEvent.coordinate)}
          >
            <Marker coordinate={mapPickerCoords}>
              <View style={styles.mapPickerMarker}>
                <Text style={{ fontSize: 24 }}>📍</Text>
              </View>
            </Marker>
          </MapView>

          <View style={styles.mapPickerFooter}>
            <Text style={styles.mapPickerCoords}>
              {mapPickerCoords.latitude.toFixed(5)}, {mapPickerCoords.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  publishButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userNickname: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 100,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  charCountWarning: {
    color: Colors.warning,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dangerLevels: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  dangerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButtonTextActive: {
    color: Colors.textPrimary,
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.accentLight,
    gap: 8,
  },
  selectedLocationIcon: {
    fontSize: 16,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  clearLocation: {
    fontSize: 16,
    color: Colors.textMuted,
    padding: 4,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  locationButtonIcon: {
    fontSize: 16,
  },
  locationButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  locationNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  locationModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: Colors.surfaceElevated,
    gap: 10,
  },
  locationItemIcon: {
    fontSize: 16,
  },
  locationItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  mapPickerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mapPickerCancel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  mapPickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mapPickerConfirm: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  mapPicker: {
    flex: 1,
  },
  mapPickerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPickerFooter: {
    padding: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mapPickerCoords: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
