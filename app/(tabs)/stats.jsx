// ReviewBoostMobile/app/(tabs)/stats.jsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';

export default function StatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ✅ Runs every time tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      setError('');

      // ✅ Small delay to ensure storage is ready
      await new Promise((r) => setTimeout(r, 100));

      const token = await AsyncStorage.getItem('token');

      console.log('Stats tab - token exists:', !!token);

      if (!token) {
        console.warn('No token - showing empty state');
        setLoading(false);
        setStats({
          totalRequests: 0,
          totalCustomers: 0,
          sentThisMonth: 0,
          plan: 'free',
          openRate: 0,
        });
        return;
      }

      console.log('Fetching stats with token:', token.slice(0, 20) + '...');

      const xhr = new XMLHttpRequest();
      xhr.open('GET', BASE_URL + '/api/user/stats', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.timeout = 15000;

      xhr.onload = () => {
        setLoading(false);
        setRefreshing(false);

        console.log('Stats response status:', xhr.status);

        if (xhr.status === 401) {
          console.warn('Stats 401 - clearing auth');
          AsyncStorage.multiRemove(['token', 'user']).then(() => {
            router.replace('/login');
          });
          return;
        }

        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setStats(data);
            console.log('Stats loaded successfully');
          } else {
            setError(data.error || 'Failed to load stats');
          }
        } catch (e) {
          setError('Invalid server response');
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        setRefreshing(false);
        setError('Connection failed. Pull down to retry.');
      };

      xhr.ontimeout = () => {
        setLoading(false);
        setRefreshing(false);
        setError('Request timed out. Pull down to retry.');
      };

      xhr.send();

    } catch (err) {
      console.error('Stats error:', err);
      setLoading(false);
      setRefreshing(false);
      setError('Something went wrong');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
  }, []);

  // ✅ Calculate values
  const planColors = {
    free: '#6b7280',
    starter: '#7c3aed',
    pro: '#2563eb',
  };

  const planColor = planColors[stats?.plan] || '#6b7280';

  const limit =
    stats?.plan === 'pro'
      ? 999
      : stats?.plan === 'starter'
      ? 100
      : 10;

  const usagePercent = stats
    ? Math.min(((stats.sentThisMonth || 0) / limit) * 100, 100)
    : 0;

  // ✅ Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              setError('');
              fetchStats();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>📊 Stats</Text>

        {/* Plan Card */}
        <View
          style={[styles.planCard, { backgroundColor: planColor }]}
        >
          <View style={styles.planRow}>
            <View style={styles.planLeft}>
              <Text style={styles.planLabel}>CURRENT PLAN</Text>
              <Text style={styles.planName}>
                {(stats?.plan || 'FREE').toUpperCase()}
              </Text>
              <Text style={styles.planSub}>
                {stats?.sentThisMonth || 0} requests this month
              </Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planLimitLabel}>Monthly limit</Text>
              <Text style={styles.planLimit}>
                {stats?.plan === 'pro' ? '∞' : limit}
              </Text>
            </View>
          </View>

          {/* Usage Bar */}
          <View style={styles.barBg}>
            <View
              style={[styles.barFill, { width: usagePercent + '%' }]}
            />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>
              {stats?.sentThisMonth || 0} used
            </Text>
            <Text style={styles.barLabel}>
              {stats?.plan === 'pro' ? 'Unlimited' : limit + ' limit'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {[
            {
              label: 'Total Sent',
              value: stats?.totalRequests || 0,
              emoji: '📤',
              bg: '#f5f3ff',
            },
            {
              label: 'Customers',
              value: stats?.totalCustomers || 0,
              emoji: '👥',
              bg: '#eff6ff',
            },
            {
              label: 'This Month',
              value: stats?.sentThisMonth || 0,
              emoji: '📅',
              bg: '#f0fdf4',
            },
            {
              label: 'Open Rate',
              value: (stats?.openRate || 0) + '%',
              emoji: '👁️',
              bg: '#fff7ed',
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: stat.bg }]}
            >
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Tips */}
        <Text style={styles.tipsTitle}>Quick Tips</Text>

        {[
          {
            emoji: '⏰',
            title: 'Best time to send',
            desc: 'Send requests within 1 hour after service for best results',
          },
          {
            emoji: '📧',
            title: 'Email open rates',
            desc: 'Morning (9-11am) gets 35% more email opens',
          },
          {
            emoji: '🔄',
            title: 'Follow-ups work',
            desc: '40% of reviews come from 2nd reminder. Be persistent!',
          },
          {
            emoji: '⭐',
            title: 'Ask in person too',
            desc: 'Mention you will send a review link - they are more likely to open it',
          },
        ].map((tip) => (
          <View key={tip.title} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <View style={styles.tipInfo}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  scroll: {
    padding: 16,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planLeft: {},
  planRight: {
    alignItems: 'flex-end',
  },
  planLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  planSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  planLimitLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  planLimit: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  barBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  barLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 14,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  tipEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  tipDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
    lineHeight: 19,
  },
});