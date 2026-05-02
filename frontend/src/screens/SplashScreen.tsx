import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export function SplashScreen({ navigation }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background gradient effect */}
      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <Text style={styles.appName}>SecurePeople</Text>
          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Bogotá Segura</Text>
            <View style={styles.taglineLine} />
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Reporta incidentes en tu ciudad, mantente informado y ayuda a construir una Bogotá más segura para todos.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {[
            { icon: '📍', text: 'Reportes en tiempo real' },
            { icon: '🗺️', text: 'Mapa interactivo de Bogotá' },
            { icon: '👥', text: 'Comunidad ciudadana' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            ⚠️ App académica — No reemplaza servicios de emergencia oficiales
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Iniciar sesión"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            size="large"
            fullWidth
            style={styles.primaryButton}
          />
          <Button
            title="Crear cuenta"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="large"
            fullWidth
          />
        </View>

        {/* Emergency numbers */}
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyTitle}>Números de emergencia</Text>
          <View style={styles.emergencyNumbers}>
            <Text style={styles.emergencyNumber}>🚔 Policía: 123</Text>
            <Text style={styles.emergencyNumber}>🚒 Bomberos: 119</Text>
            <Text style={styles.emergencyNumber}>🚑 Ambulancia: 125</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#1A0000',
    opacity: 0.6,
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.accent,
    opacity: 0.06,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  tagline: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    marginVertical: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  disclaimerContainer: {
    backgroundColor: '#1A1200',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#FF9800',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyContainer: {
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emergencyNumbers: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emergencyNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
