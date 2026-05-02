import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          ⚠️ Reporte comunitario no verificado. No reemplaza a la Policía, Bomberos ni servicios de emergencia.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛡️</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Aviso de uso responsable</Text>
        <Text style={styles.text}>
          Este reporte es de carácter comunitario y <Text style={styles.bold}>no ha sido verificado</Text> por autoridades oficiales.
        </Text>
        <Text style={styles.text}>
          SecurePeople <Text style={styles.bold}>no reemplaza</Text> a la Policía Nacional, Bomberos, servicios de emergencias médicas ni ninguna autoridad oficial.
        </Text>
        <Text style={[styles.text, styles.emergency]}>
          🚨 En caso de emergencia real, llama al <Text style={styles.bold}>123</Text> (Policía) o <Text style={styles.bold}>119</Text> (Emergencias).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1200',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 3,
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emergency: {
    color: '#FF6B6B',
    marginTop: 4,
  },
  compactContainer: {
    backgroundColor: '#1A1200',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  compactText: {
    fontSize: 11,
    color: '#FF9800',
    lineHeight: 16,
  },
});
