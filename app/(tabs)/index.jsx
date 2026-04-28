import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';

export default function SendScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);
      if (!token || !userStr) {
        router.replace('/login');
        return;
      }
      setUser(JSON.parse(userStr));
    } catch (err) {
      router.replace('/login');
    }
  };

  const handleSend = async () => {
    if (!form.customerName.trim()) {
      Alert.alert('Missing', 'Please enter customer name');
      return;
    }
    if (!form.customerEmail.trim()) {
      Alert.alert('Missing', 'Please enter customer email');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    setLoading(true);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + '/api/reviews/send', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 15000;

    xhr.onload = () => {
      setLoading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200 || xhr.status === 201) {
          Alert.alert('⭐ Sent!', data.message || 'Review request sent!');
          setForm({ customerName: '', customerEmail: '', customerPhone: '' });
        } else if (xhr.status === 401) {
          router.replace('/login');
        } else if (data.error?.includes('Google Review link')) {
          Alert.alert('⚙️ Setup Required', 'Add your Google Review link in Settings first.');
        } else if (data.upgradeRequired) {
          Alert.alert('Limit Reached', 'Please upgrade your plan.');
        } else {
          Alert.alert('Error', data.error || 'Failed to send');
        }
      } catch (e) {
        Alert.alert('Error', 'Server error. Try again.');
      }
    };

    xhr.onerror = () => { setLoading(false); Alert.alert('Error', 'Connection failed'); };
    xhr.ontimeout = () => { setLoading(false); Alert.alert('Timeout', 'Request timed out'); };

    xhr.send(JSON.stringify({
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim().toLowerCase(),
      customerPhone: form.customerPhone.trim(),
    }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi {user?.name?.split(' ')[0] || 'there'} 👋
            </Text>
            <Text style={styles.business}>
              {user?.businessName || 'Your Business'}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {(user?.plan || 'FREE').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>⭐</Text>
            <View>
              <Text style={styles.cardTitle}>Send Review Request</Text>
              <Text style={styles.cardSub}>Customer receives email instantly</Text>
            </View>
          </View>

          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            placeholderTextColor="#b8b8b8"
            value={form.customerName}
            onChangeText={(v) => setForm({ ...form, customerName: v })}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.label}>Customer Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="john@email.com"
            placeholderTextColor="#b8b8b8"
            value={form.customerEmail}
            onChangeText={(v) => setForm({ ...form, customerEmail: v })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Phone <Text style={styles.opt}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+234 800 000 0000"
            placeholderTextColor="#b8b8b8"
            value={form.customerPhone}
            onChangeText={(v) => setForm({ ...form, customerPhone: v })}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnOff]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.row}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.btnText}>Sending...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>⭐ Send Review Request</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View style={styles.tip}>
          <Text style={styles.tipTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>
            Send requests within 1 hour after service for the best response rate!
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            { n: '1', t: 'Enter customer name and email above' },
            { n: '2', t: 'Customer gets a friendly review email' },
            { n: '3', t: 'They click and leave you a Google review' },
          ].map((item) => (
            <View key={item.n} style={styles.howRow}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{item.n}</Text>
              </View>
              <Text style={styles.howText}>{item.t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f7ff' },
  scroll: { padding: 20, paddingTop: 16, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  business: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginTop: 2 },
  badge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  badgeText: { color: '#7c3aed', fontSize: 11, fontWeight: '800' },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
  cardSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 14,
  },
  opt: { fontWeight: '400', color: '#9ca3af' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnOff: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  tip: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16,
  },
  tipTitle: { fontSize: 13, fontWeight: '800', color: '#92400e', marginBottom: 6 },
  tipText: { fontSize: 13, color: '#92400e', lineHeight: 20 },
  howCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  howTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  howNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howNumText: { color: 'white', fontSize: 13, fontWeight: '800' },
  howText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
});