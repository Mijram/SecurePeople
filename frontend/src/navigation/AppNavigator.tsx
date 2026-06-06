import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MapScreen } from '../screens/MapScreen';
import { CreateReportScreen } from '../screens/CreateReportScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FeedScreen } from '../screens/FeedScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  CreateReport: undefined;
  ReportDetail: { reportId: string };
  Profile: undefined;
  Feed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.textPrimary,
          border: Colors.border,
          notification: Colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App screens
          <>
            <Stack.Screen name="Main" component={MapScreen} />
            <Stack.Screen
              name="CreateReport"
              component={CreateReportScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Feed"
              component={FeedScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
