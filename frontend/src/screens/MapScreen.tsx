import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, getCategoryColor, getDangerColor } from '../theme/colors';
import { useReports, Report } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { DangerMeter } from '../components/DangerMeter';

// Bogotá, Colombia coordinates
const BOGOTA_REGION = {
  latitude: 4.7110,
  longitude: -74.0721,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const CATEGORY_ICONS: Record<string, string> = {
  'Robo': '🔫',
  'Accidente': '🚗',
  'Incendio': '🔥',
  'Emergencia médica': '🚑',
  'Manifestación': '📢',
  'Obstrucción vial': '🚧',
  'Situación sospechosa': '👁️',
  'Otro': '⚠️',
};

type MainStackParamList = {
  MapMain: undefined;
  CreateReport: undefined;
  ReportDetail: { reportId: string };
  Profile: undefined;
  Feed: undefined;
};

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { reports, isLoading, fetchReports } = useReports();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Robo', 'Accidente', 'Incendio', 'Emergencia médica',
    'Manifestación', 'Obstrucción vial', 'Situación sospechosa', 'Otro',
  ];

  const filteredReports = filterCategory
    ? reports.filter(r => r.category === filterCategory)
    : reports;

  const handleMarkerPress = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const centerOnBogota = () => {
    mapRef.current?.animateToRegion(BOGOTA_REGION, 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={BOGOTA_REGION}
        customMapStyle={darkMapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {filteredReports.map(report => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            onPress={() => handleMarkerPress(report)}
          >
            <View style={[
              styles.markerContainer,
              { borderColor: getCategoryColor(report.category) },
            ]}>
              <Text style={styles.markerEmoji}>
                {CATEGORY_ICONS[report.category] || '⚠️'}
              </Text>
              <View style={[
                styles.dangerDot,
                { backgroundColor: getDangerColor(report.danger_level) },
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.appTitle}>🛡️ SecurePeople</Text>
          <Text style={styles.reportCount}>
            {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''}
            {filterCategory ? ` · ${filterCategory}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileAvatar}>
            {user?.avatar_url ? '👤' : user?.nickname?.charAt(0).toUpperCase() || '👤'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter button */}
      <TouchableOpacity
        style={[styles.filterButton, filterCategory && styles.filterButtonActive]}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterButtonText}>
          {filterCategory ? `🔍 ${filterCategory}` : '🔍 Filtrar'}
        </Text>
      </TouchableOpacity>

      {/* Feed button */}
      <TouchableOpacity
        style={styles.feedButton}
        onPress={() => navigation.navigate('Feed')}
      >
        <Text style={styles.feedButtonText}>📱 Feed Social</Text>
      </TouchableOpacity>

      {/* Center button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnBogota}>
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Refresh button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchReports}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.textPrimary} />
        ) : (
          <Text style={styles.refreshButtonText}>🔄</Text>
        )}
      </TouchableOpacity>

      {/* Create report FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReport')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Reportar</Text>
      </TouchableOpacity>

      {/* Report preview modal */}
      <Modal
        visible={!!selectedReport}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedReport(null)}
        >
          <View style={styles.reportCard}>
            <View style={styles.reportCardHandle} />

            <View style={styles.reportCardHeader}>
              <CategoryBadge category={selectedReport?.category || ''} />
              <DangerMeter
                level={selectedReport?.danger_level || 1}
                showLabel={false}
                compact
              />
            </View>

            <Text style={styles.reportDescription} numberOfLines={3}>
              {selectedReport?.description}
            </Text>

            <View style={styles.reportMeta}>
              <Text style={styles.reportMetaText}>
                📍 {selectedReport?.address || 'Bogotá, Colombia'}
              </Text>
              <Text style={styles.reportMetaText}>
                👤 @{selectedReport?.nickname}
              </Text>
              <Text style={styles.reportMetaText}>
                🕐 {selectedReport ? formatDate(selectedReport.created_at) : ''}
              </Text>
            </View>

            <View style={styles.reportCardActions}>
              <TouchableOpacity
                style={styles.viewDetailButton}
                onPress={() => {
                  if (selectedReport) {
                    setSelectedReport(null);
                    navigation.navigate('ReportDetail', { reportId: selectedReport.id });
                  }
                }}
              >
                <Text style={styles.viewDetailText}>Ver detalle completo →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerSmall}>
              <Text style={styles.disclaimerSmallText}>
                ⚠️ Reporte comunitario no verificado por autoridades
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <View style={styles.filterModal}>
            <View style={styles.reportCardHandle} />
            <Text style={styles.filterTitle}>Filtrar por categoría</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterItem, !filterCategory && styles.filterItemActive]}
                onPress={() => { setFilterCategory(null); setShowFilters(false); }}
              >
                <Text style={styles.filterItemIcon}>🗺️</Text>
                <Text style={[styles.filterItemText, !filterCategory && styles.filterItemTextActive]}>
                  Todos los reportes
                </Text>
                {!filterCategory && <Text style={styles.filterCheck}>✓</Text>}
              </TouchableOpacity>

              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterItem, filterCategory === cat && styles.filterItemActive]}
                  onPress={() => { setFilterCategory(cat); setShowFilters(false); }}
                >
                  <Text style={styles.filterItemIcon}>{CATEGORY_ICONS[cat]}</Text>
                  <Text style={[styles.filterItemText, filterCategory === cat && styles.filterItemTextActive]}>
                    {cat}
                  </Text>
                  {filterCategory === cat && <Text style={styles.filterCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Google Maps dark style for Bogotá
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023747' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 13, 13, 0.92)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topBarLeft: {},
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reportCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  filterButton: {
    position: 'absolute',
    top: 110,
    left: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
  },
  filterButtonText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  feedButton: {
    position: 'absolute',
    top: 150,
    left: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedButtonText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13, 13, 13, 0.92)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonText: {
    fontSize: 20,
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    bottom: 174,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13, 13, 13, 0.92)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginRight: 6,
  },
  fabText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 13, 13, 0.9)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 18,
  },
  dangerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  reportCardHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDescription: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  reportMeta: {
    gap: 4,
    marginBottom: 16,
  },
  reportMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reportCardActions: {
    marginBottom: 12,
  },
  viewDetailButton: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewDetailText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  disclaimerSmall: {
    backgroundColor: '#1A1200',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  disclaimerSmallText: {
    fontSize: 11,
    color: '#FF9800',
    textAlign: 'center',
  },
  filterModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: Colors.surfaceElevated,
  },
  filterItemActive: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  filterItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterItemTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  filterCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
});
