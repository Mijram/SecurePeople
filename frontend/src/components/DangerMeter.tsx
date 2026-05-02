import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDangerColor } from '../theme/colors';

interface DangerMeterProps {
  level: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function DangerMeter({ level, showLabel = true, compact = false }: DangerMeterProps) {
  const color = getDangerColor(level);

  const getLabel = (l: number): string => {
    if (l <= 2) return 'Muy bajo';
    if (l <= 4) return 'Bajo';
    if (l <= 6) return 'Moderado';
    if (l <= 8) return 'Alto';
    return 'Crítico';
  };

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: `${color}22`, borderColor: `${color}66` }]}>
        <Text style={[styles.compactText, { color }]}>⚡ Nivel {level}/10</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Nivel de peligro</Text>
          <Text style={[styles.levelText, { color }]}>
            {level}/10 — {getLabel(level)}
          </Text>
        </View>
      )}
      <View style={styles.barContainer}>
        {Array.from({ length: 10 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: i < level ? color : '#2C2C2C',
                opacity: i < level ? 1 : 0.4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  barContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
