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

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
  });

  const handleRegister = () => {
    if (!form.name.trim()) { Alert.alert('Missing', 'Please enter your full name'); return; }
    if (!form.email.trim()) { Alert.alert('Missing', 'Please enter your email'); return; }
    if (form.password.length < 6) { Alert.alert('Weak Password', 'Minimum 6 characters'); return; }
    if (!form.businessName.trim()) { Alert.alert('Missing', 'Please enter your business name'); return; }

    setLoading(true);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + '/api/auth/register', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.timeout = 15000;

    xhr.onload = () => {
      setLoading(false);
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status === 409) {
          Alert.alert(
            'Account Exists',
            'An account with this email already exists.',
            [
              { text: 'Sign In', onPress: () => router.replace('/login') },
              { text: 'Use Different Email', style: 'cancel' },
            ]
          );
          return;
        }

        if (xhr.status === 201 || xhr.status === 200) {
          Alert.alert(
            '🎉 Welcome to ReviewBoost!',
            'Account created. Please sign in.',
            [{ text: 'Sign In Now', onPress: () => router.replace('/login') }]
          );
          return;
        }

        Alert.alert('Error', data.error || 'Registration failed');
      } catch (e) {
        Alert.alert('Error', 'Could not connect to server');
      }
    };

    xhr.onerror = () => { setLoading(false); Alert.alert('Error', 'Connection failed'); };
    xhr.ontimeout = () => { setLoading(false); Alert.alert('Timeout', 'Try again'); };

    xhr.send(JSON.stringify({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      businessName: form.businessName.trim(),
      businessType: 'other',
      phone: '',
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
        <Text style={styles.heroEmoji}>🚀</Text>
        <Text style={styles.heroTitle}>Start Your Free Trial</Text>
        <Text style={styles.heroSub}>No credit card needed • Cancel anytime</Text>
      </View>

      <View style={styles.benefits}>
        {[
          '✅ 3x more Google reviews in 30 days',
          '✅ Automatic email review requests',
          '✅ Track and manage all reviews',
          '✅ 14-day free trial included',
        ].map((item) => (
          <Text key={item} style={styles.benefit}>{item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Your Account</Text>

        <Text style={styles.label}>👤 Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#b8b8b8"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>📧 Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="john@email.com"
          placeholderTextColor="#b8b8b8"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>🏢 Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="My Restaurant / Salon"
          placeholderTextColor="#b8b8b8"
          value={form.businessName}
          onChangeText={(v) => setForm({ ...form, businessName: v })}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>🔒 Password (min 6 chars)</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a strong password"
          placeholderTextColor="#b8b8b8"
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleRegister}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnOff]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.btnText}>Creating Account...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Create Free Account →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By signing up you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.loginBtnText}>Sign In →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.trust}>
        🔒 256-bit SSL Encrypted • 🌍 500+ Businesses Trust Us
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7ff' },
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 52, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#7c3aed', marginTop: 4, fontWeight: '600' },
  heroCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 32, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: 'white', textAlign: 'center' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  benefits: { marginBottom: 16, paddingHorizontal: 4 },
  benefit: { fontSize: 14, color: '#374151', fontWeight: '500', paddingVertical: 5 },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', textAlign: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fafafa',
  },
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
  terms: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 16 },
  footer: { alignItems: 'center', marginBottom: 16 },
  footerText: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  loginBtn: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  loginBtnText: { color: '#7c3aed', fontSize: 15, fontWeight: '800' },
  trust: { color: '#9ca3af', fontSize: 11, textAlign: 'center' },
});