import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor } from '../theme/colors';

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

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium';
}

export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  const color = getCategoryColor(category);
  const icon = CATEGORY_ICONS[category] || '⚠️';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}66` }, size === 'small' && styles.badgeSmall]}>
      <Text style={size === 'small' ? styles.iconSmall : styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color }, size === 'small' && styles.textSmall]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  icon: {
    fontSize: 14,
    marginRight: 5,
  },
  iconSmall: {
    fontSize: 11,
    marginRight: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
});
