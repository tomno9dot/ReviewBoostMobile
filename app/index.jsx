import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await new Promise((r) => setTimeout(r, 1500));

      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          router.replace('/(tabs)');
          return;
        }
      }

      router.replace('/login');
    } catch (err) {
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⭐</Text>
      <Text style={styles.title}>ReviewBoost</Text>
      <Text style={styles.tagline}>More Reviews. More Customers.</Text>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
      <Text style={styles.footer}>Trusted by 500+ businesses</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontWeight: '500',
  },
  loaderBox: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});