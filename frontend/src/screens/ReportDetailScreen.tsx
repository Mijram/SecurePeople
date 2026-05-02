import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, getCategoryColor, getDangerColor } from '../theme/colors';
import { useReports } from '../context/ReportsContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { DangerMeter } from '../components/DangerMeter';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

type MainStackParamList = {
  ReportDetail: { reportId: string };
};

type ReportDetailRouteProp = RouteProp<MainStackParamList, 'ReportDetail'>;

export function ReportDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReportDetailRouteProp>();
  const { getReportById } = useReports();

  const report = getReportById(route.params.reportId);

  if (!report) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Reporte no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryColor = getCategoryColor(report.category);
  const dangerColor = getDangerColor(report.danger_level);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del reporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category header */}
        <View style={[styles.categoryHeader, { borderColor: `${categoryColor}44` }]}>
          <Text style={styles.categoryEmoji}>
            {CATEGORY_ICONS[report.category] || '⚠️'}
          </Text>
          <View style={styles.categoryHeaderText}>
            <CategoryBadge category={report.category} />
            <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📝 Descripción</Text>
          <Text style={styles.description}>{report.description}</Text>
        </View>

        {/* Danger level */}
        <View style={styles.card}>
          <DangerMeter level={report.danger_level} showLabel />
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📍 Ubicación</Text>
          <Text style={styles.locationText}>
            {report.address || 'Bogotá, Colombia'}
          </Text>
          <Text style={styles.coordsText}>
            {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
          </Text>
        </View>

        {/* Mini map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: report.latitude,
              longitude: report.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            customMapStyle={[
              { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
            ]}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
            >
              <View style={[styles.mapMarker, { borderColor: categoryColor }]}>
                <Text style={{ fontSize: 16 }}>
                  {CATEGORY_ICONS[report.category] || '⚠️'}
                </Text>
              </View>
            </Marker>
          </MapView>
        </View>

        {/* Reporter info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>👤 Reportado por</Text>
          <View style={styles.reporterRow}>
            <View style={[styles.reporterAvatar, { backgroundColor: `${categoryColor}33` }]}>
              <Text style={[styles.reporterAvatarText, { color: categoryColor }]}>
                {report.nickname?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.reporterNickname}>@{report.nickname}</Text>
              <Text style={styles.reporterNote}>Ciudadano de Bogotá</Text>
            </View>
          </View>
          <Text style={styles.privacyNote}>
            🔒 Los datos personales del reportante son privados
          </Text>
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Estado del reporte</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: report.status === 'active' ? Colors.success : Colors.textMuted }]} />
            <Text style={styles.statusText}>
              {report.status === 'active' ? 'Activo' : report.status === 'resolved' ? 'Resuelto' : 'Descartado'}
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <DisclaimerBanner />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 14,
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryHeaderText: {
    flex: 1,
    gap: 8,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  locationText: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniMap: {
    height: 160,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 13, 13, 0.9)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reporterAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  reporterNickname: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reporterNote: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  privacyNote: {
    fontSize: 11,
    color: Colors.textMuted,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 16,
    color: Colors.primary,
  },
});
