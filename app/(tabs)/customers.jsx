// ReviewBoostMobile/app/(tabs)/customers.jsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';

export default function CustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);

  // ✅ Use useFocusEffect so it runs every time tab is focused
  // NOT just on first mount
  useFocusEffect(
    useCallback(() => {
      loadAndFetch();
    }, [])
  );

  const loadAndFetch = async () => {
    try {
      // ✅ Small delay to ensure AsyncStorage is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      console.log('Customers tab - token exists:', !!token);
      console.log('Customers tab - user exists:', !!userStr);

      if (!token) {
        console.warn('No token found - but staying on page');
        // ✅ Don't redirect - just show empty state
        setLoading(false);
        return;
      }

      setReady(true);
      doFetchCustomers(token, '');

    } catch (err) {
      console.error('LoadAndFetch error:', err);
      setLoading(false);
    }
  };

  const doFetchCustomers = (token, searchTerm) => {
    if (!token) {
      setLoading(false);
      return;
    }

    const url = BASE_URL + '/api/customers?search=' +
      encodeURIComponent(searchTerm || '');

    console.log('Fetching:', url);
    console.log('Token:', token.slice(0, 20) + '...');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 15000;

    xhr.onload = () => {
      setLoading(false);
      setRefreshing(false);

      console.log('Customers response status:', xhr.status);

      if (xhr.status === 401) {
        // ✅ On 401 clear storage and redirect
        console.warn('401 received - clearing auth');
        AsyncStorage.multiRemove(['token', 'user']).then(() => {
          router.replace('/login');
        });
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setCustomers(data.customers || []);
        }
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      setRefreshing(false);
      console.error('Network error');
    };

    xhr.ontimeout = () => {
      setLoading(false);
      setRefreshing(false);
      console.error('Request timed out');
    };

    xhr.send();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      doFetchCustomers(token, search);
    } else {
      setRefreshing(false);
    }
  };

  const handleSearch = async (text) => {
    setSearch(text);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      doFetchCustomers(token, text);
    }
  };

  const sendRequest = async (customer) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Please sign in again.');
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + '/api/reviews/send', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 15000;

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          Alert.alert(
            '⭐ Sent!',
            'Review request sent to ' + customer.name + '!'
          );
        } else if (xhr.status === 401) {
          Alert.alert('Session Expired', 'Please sign in again.');
          router.replace('/login');
        } else if (data.error?.includes('Google Review link')) {
          Alert.alert(
            '⚙️ Setup Required',
            'Please add your Google Review link in Settings first.'
          );
        } else {
          Alert.alert('Error', data.error || 'Failed to send');
        }
      } catch (e) {
        Alert.alert('Error', 'Server error');
      }
    };

    xhr.onerror = () => Alert.alert('Error', 'Connection failed');
    xhr.ontimeout = () => Alert.alert('Timeout', 'Request timed out');

    xhr.send(JSON.stringify({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
    }));
  };

  const deleteCustomer = (customer) => {
    Alert.alert(
      'Delete Customer',
      'Remove ' + customer.name + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const xhr = new XMLHttpRequest();
            xhr.open(
              'DELETE',
              BASE_URL + '/api/customers/' + customer._id,
              true
            );
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.timeout = 10000;

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setCustomers((prev) =>
                  prev.filter((c) => c._id !== customer._id)
                );
                Alert.alert('Deleted', customer.name + ' removed.');
              }
            };

            xhr.onerror = () => Alert.alert('Error', 'Connection failed');
            xhr.send();
          },
        },
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
        {item.phone ? (
          <Text style={styles.phone}>{item.phone}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => sendRequest(item)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.delBtn}
          onPress={() => deleteCustomer(item)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>
            {customers.length} total
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : (
          <FlatList
            data={customers}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={() => (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyTitle}>
                  {search ? 'No results found' : 'No customers yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {search
                    ? 'Try a different search term'
                    : 'Send a review request to add customers'}
                </Text>
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#7c3aed"
                colors={['#7c3aed']}
              />
            }
            contentContainerStyle={[
              styles.list,
              customers.length === 0 && styles.listEmpty,
            ]}
            ItemSeparatorComponent={() => (
              <View style={{ height: 10 }} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  listEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  email: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  phone: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});