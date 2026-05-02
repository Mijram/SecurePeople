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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  nickname: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  email?: string;
  nickname?: string;
  password?: string;
  confirm_password?: string;
}

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [form, setForm] = useState<FormData>({
    full_name: '',
    phone: '',
    email: '',
    nickname: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    } else if (form.full_name.trim().length < 3) {
      newErrors.full_name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!form.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!form.nickname.trim()) {
      newErrors.nickname = 'El nickname es obligatorio';
    } else if (form.nickname.length < 3) {
      newErrors.nickname = 'El nickname debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.nickname)) {
      newErrors.nickname = 'Solo letras, números y guiones bajos';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = 'Confirma tu contraseña';
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        nickname: form.nickname.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        phone: form.phone.trim() || undefined,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al registrarse';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad SecurePeople</Text>
        </View>

        {/* Privacy notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            🔒 Tu información personal es privada. Solo tu nickname será visible públicamente.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Nombre completo *"
            placeholder="Juan Pérez"
            value={form.full_name}
            onChangeText={v => updateField('full_name', v)}
            autoCapitalize="words"
            error={errors.full_name}
          />

          <Input
            label="Número de teléfono"
            placeholder="300 123 4567"
            value={form.phone}
            onChangeText={v => updateField('phone', v)}
            keyboardType="phone-pad"
            error={errors.phone}
            hint="Opcional"
          />

          <Input
            label="Correo electrónico *"
            placeholder="tu@correo.com"
            value={form.email}
            onChangeText={v => updateField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Nickname (nombre público) *"
            placeholder="ciudadano_bogota"
            value={form.nickname}
            onChangeText={v => updateField('nickname', v)}
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.nickname}
            hint="Este nombre será visible en tus reportes"
          />

          <Input
            label="Contraseña *"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChangeText={v => updateField('password', v)}
            isPassword
            error={errors.password}
          />

          <Input
            label="Confirmar contraseña *"
            placeholder="Repite tu contraseña"
            value={form.confirm_password}
            onChangeText={v => updateField('confirm_password', v)}
            isPassword
            error={errors.confirm_password}
          />

          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="large"
            style={styles.registerButton}
          />
        </View>

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredNote}>* Campos obligatorios</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  privacyNotice: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
