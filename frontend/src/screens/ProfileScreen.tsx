import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { api } from '../services/api';

const AVATAR_OPTIONS = [
  '🦁', '🐯', '🦊', '🐺', '🦅', '🦋', '🐉', '🦄',
  '🤖', '👾', '🎭', '🎯', '🔥', '⚡', '🌟', '💎',
];

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const { reports } = useReports();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editNickname, setEditNickname] = useState(user?.nickname || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(user?.avatar_url || '');

  const userReports = reports.filter(r => r.user_id === user?.id);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const validateEdit = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (editNickname && editNickname.length < 3) {
      newErrors.nickname = 'El nickname debe tener al menos 3 caracteres';
    } else if (editNickname && !/^[a-zA-Z0-9_]+$/.test(editNickname)) {
      newErrors.nickname = 'Solo letras, números y guiones bajos';
    }

    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Ingresa tu contraseña actual';
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Las contraseñas no coinciden';
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEdit()) return;

    setSaving(true);
    try {
      const payload: Record<string, string> = {};

      if (editNickname && editNickname !== user?.nickname) {
        payload.nickname = editNickname;
      }
      if (selectedEmoji && selectedEmoji !== user?.avatar_url) {
        payload.avatar_url = selectedEmoji;
      }
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
        payload.confirm_new_password = confirmNewPassword;
      }

      if (Object.keys(payload).length === 0) {
        setShowEditModal(false);
        return;
      }

      const response = await api.put('/users/me', payload);
      updateUser(response.data.user);

      setShowEditModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      Alert.alert('✅ Perfil actualizado', 'Los cambios se han guardado correctamente.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAvatar = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowAvatarModal(false);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButton}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowEditModal(true)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>
                {user?.avatar_url || user?.nickname?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.nickname}>@{user?.nickname}</Text>
          <Text style={styles.fullName}>{user?.full_name}</Text>
          <Text style={styles.memberSince}>
            Miembro desde {user?.created_at ? formatDate(user.created_at) : ''}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userReports.length}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userReports.filter(r => r.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userReports.length > 0
                ? Math.round(userReports.reduce((sum, r) => sum + r.danger_level, 0) / userReports.length)
                : 0}
            </Text>
            <Text style={styles.statLabel}>Nivel prom.</Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información de cuenta</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Correo</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          {user?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Teléfono</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🔒 Contraseña</Text>
            <Text style={styles.infoValue}>••••••••</Text>
          </View>
        </View>

        {/* Privacy notice */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🔒 Privacidad</Text>
          <Text style={styles.privacyText}>
            Solo tu nickname es visible públicamente en los reportes. Tu nombre completo, correo y teléfono son privados.
          </Text>
        </View>

        {/* Recent reports */}
        {userReports.length > 0 && (
          <View style={styles.reportsSection}>
            <Text style={styles.sectionTitle}>Mis reportes recientes</Text>
            {userReports.slice(0, 3).map(report => (
              <View key={report.id} style={styles.reportItem}>
                <Text style={styles.reportItemCategory}>{report.category}</Text>
                <Text style={styles.reportItemDesc} numberOfLines={2}>
                  {report.description}
                </Text>
                <Text style={styles.reportItemDate}>
                  {new Date(report.created_at).toLocaleDateString('es-CO')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Logout */}
        <Button
          title="Cerrar sesión"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={styles.logoutButton}
          textStyle={{ color: Colors.error }}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={showEditModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
              <Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar selector */}
            <View style={styles.avatarEditSection}>
              <TouchableOpacity
                style={styles.avatarEditPreview}
                onPress={() => setShowAvatarModal(true)}
              >
                <Text style={styles.avatarEditEmoji}>
                  {selectedEmoji || user?.nickname?.charAt(0).toUpperCase() || '?'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                <Text style={styles.changeAvatarText}>Cambiar foto de perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Nickname */}
            <Input
              label="Nickname"
              placeholder={user?.nickname}
              value={editNickname}
              onChangeText={setEditNickname}
              autoCapitalize="none"
              autoCorrect={false}
              error={editErrors.nickname}
              hint="Solo letras, números y guiones bajos"
            />

            {/* Password section */}
            <Text style={styles.passwordSectionTitle}>Cambiar contraseña</Text>
            <Text style={styles.passwordSectionNote}>
              Deja en blanco si no quieres cambiar tu contraseña
            </Text>

            <Input
              label="Contraseña actual"
              placeholder="Tu contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              error={editErrors.currentPassword}
            />

            <Input
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              error={editErrors.newPassword}
            />

            <Input
              label="Confirmar nueva contraseña"
              placeholder="Repite la nueva contraseña"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              isPassword
              error={editErrors.confirmNewPassword}
            />

            {/* Privacy reminder */}
            <View style={styles.editPrivacyNote}>
              <Text style={styles.editPrivacyText}>
                🔒 Tu correo y nombre completo no son editables para proteger tu cuenta.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Avatar picker modal */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.avatarModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.avatarModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.avatarModalTitle}>Elige tu avatar</Text>
            <View style={styles.emojiGrid}>
              {AVATAR_OPTIONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.emojiOptionSelected,
                  ]}
                  onPress={() => handleSelectAvatar(emoji)}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  editButton: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 12,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fullName: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  privacyCard: {
    backgroundColor: '#0D1A0D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reportsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reportItemCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 3,
  },
  reportItemDesc: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 3,
  },
  reportItemDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  logoutButton: {
    borderColor: Colors.error,
    marginTop: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSave: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  avatarEditSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarEditPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarEditEmoji: {
    fontSize: 36,
  },
  changeAvatarText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  passwordSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  passwordSectionNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  editPrivacyNote: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  editPrivacyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Avatar modal
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  avatarModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
  },
  emojiOptionText: {
    fontSize: 28,
  },
});
