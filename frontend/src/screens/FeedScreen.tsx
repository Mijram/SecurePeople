import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, getCategoryColor, getDangerColor } from '../theme/colors';
import { useReports, Report } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { DangerMeter } from '../components/DangerMeter';

type MainStackParamList = {
  MapMain: undefined;
  CreateReport: undefined;
  ReportDetail: { reportId: string };
  Profile: undefined;
  Feed: undefined;
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

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { reports, isLoading, fetchReports } = useReports();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Show all reports from all users (sorted by most recent)
  const allReports = [...reports].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
    });
  };

  const renderReportCard = (report: Report) => {
    const isMyReport = report.user_id === user?.id;
    
    return (
    <TouchableOpacity
      key={report.id}
      style={styles.reportCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[
            styles.avatar,
            isMyReport && { borderColor: Colors.accentLight }
          ]}>
            <Text style={styles.avatarText}>
              {report.avatar_url || report.nickname?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.username}>@{report.nickname}</Text>
              {isMyReport && (
                <View style={styles.myBadge}>
                  <Text style={styles.myBadgeText}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{formatDate(report.created_at)}</Text>
          </View>
        </View>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryEmoji}>
            {CATEGORY_ICONS[report.category] || '⚠️'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.description}>{report.description}</Text>

      {/* Metadata */}
      <View style={styles.metadata}>
        <CategoryBadge category={report.category} />
        <DangerMeter level={report.danger_level} showLabel={false} compact />
      </View>

      {/* Location */}
      {report.address && (
        <View style={styles.location}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{report.address}</Text>
        </View>
      )}

      {/* Footer stats */}
      <View style={styles.footer}>
        <View style={styles.statusBadge}>
          <View style={[
            styles.statusDot,
            { backgroundColor: report.status === 'active' ? Colors.success : Colors.textMuted }
          ]} />
          <Text style={styles.statusText}>
            {report.status === 'active' ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Feed Social</Text>
          <Text style={styles.headerSubtitle}>
            {allReports.length} reporte{allReports.length !== 1 ? 's' : ''} de la comunidad
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileAvatar}>
            {user?.avatar_url || user?.nickname?.charAt(0).toUpperCase() || '👤'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && allReports.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reportes de la comunidad...</Text>
        </View>
      ) : allReports.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No hay publicaciones</Text>
          <Text style={styles.emptyText}>
            Aún no hay reportes en la comunidad.{'\n'}
            Sé el primero en compartir información.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateReport')}
          >
            <Text style={styles.createButtonIcon}>+</Text>
            <Text style={styles.createButtonText}>Crear primer reporte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {allReports.map(renderReportCard)}

          {/* End message */}
          <View style={styles.endMessage}>
            <Text style={styles.endMessageText}>
              🎯 Has visto todos los reportes de la comunidad
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Create FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReport')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  createButtonIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  createButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  myBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  myBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.background,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  endMessage: {
    padding: 20,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
