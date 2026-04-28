import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = () => {
    if (!form.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!form.password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + '/api/auth/mobile-login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.timeout = 15000;

    xhr.onload = async () => {
      setLoading(false);

      if (
        xhr.responseText.startsWith('<!') ||
        xhr.responseText.startsWith('<html')
      ) {
        Alert.alert('Server Error', 'Server is unavailable. Try again.');
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          router.replace('/(tabs)');
        } else {
          Alert.alert('Login Failed', data.error || 'Invalid email or password');
        }
      } catch (e) {
        Alert.alert('Error', 'Could not connect. Try again.');
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      Alert.alert('Connection Error', 'Check your internet connection.');
    };

    xhr.ontimeout = () => {
      setLoading(false);
      Alert.alert('Timeout', 'Server too slow. Try again.');
    };

    xhr.send(JSON.stringify({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>⭐</Text>
        <Text style={styles.title}>ReviewBoost</Text>
        <Text style={styles.tagline}>Get More Google Reviews Automatically</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>👋</Text>
        <Text style={styles.heroTitle}>Welcome back!</Text>
        <Text style={styles.heroSub}>Sign in to manage your reviews</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📧 Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#b8b8b8"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>🔒 Password</Text>
        <View style={styles.passWrap}>
          <TextInput
            style={[styles.input, { paddingRight: 52, marginBottom: 0 }]}
            placeholder="Enter your password"
            placeholderTextColor="#b8b8b8"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnOff]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.btnText}>Signing In...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Sign In →</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        {[
          { emoji: '⭐', text: 'Send review requests instantly' },
          { emoji: '📊', text: 'Track your review growth' },
          { emoji: '📱', text: 'Manage from anywhere' },
        ].map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.replace('/register')}
        >
          <Text style={styles.registerBtnText}>Start Free Trial →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.trust}>
        🔒 Secure • 🆓 14-day Free Trial • ❌ No Credit Card
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7ff' },
  scroll: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#7c3aed', marginTop: 4, fontWeight: '600' },
  heroCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  passWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeText: { fontSize: 20 },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  btnOff: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: 'white', fontSize: 17, fontWeight: '800' },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  featureEmoji: { fontSize: 20 },
  featureText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  footer: { alignItems: 'center', marginBottom: 16 },
  footerText: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  registerBtn: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  registerBtnText: { color: '#7c3aed', fontSize: 15, fontWeight: '800' },
  trust: { color: '#9ca3af', fontSize: 11, textAlign: 'center' },
});