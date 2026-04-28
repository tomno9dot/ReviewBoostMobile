// ReviewBoostMobile/app/(tabs)/settings.jsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // ✅ Runs every time tab is focused
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      // ✅ Small delay to ensure storage is ready
      await new Promise((r) => setTimeout(r, 100));

      const userStr = await AsyncStorage.getItem('user');
      console.log('Settings tab - user loaded:', !!userStr);

      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (err) {
      console.error('Load user error:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              router.replace('/login');
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Error', 'Could not sign out. Try again.');
            }
          },
        },
      ]
    );
  };

  const openDashboard = () => {
    Linking.openURL(BASE_URL + '/settings');
  };

  const openWebApp = () => {
    Linking.openURL(BASE_URL + '/dashboard');
  };

  // ✅ Plan display
  const plan = user?.plan || 'free';
  const planBg = {
    free: '#f3f4f6',
    starter: '#f5f3ff',
    pro: '#eff6ff',
  };
  const planTxt = {
    free: '#6b7280',
    starter: '#7c3aed',
    pro: '#2563eb',
  };

  // ✅ Menu sections
  const sections = [
    {
      title: 'Account',
      items: [
        {
          emoji: '👤',
          label: 'Profile & Business',
          sub: user?.businessName || 'Update your details',
          onPress: openDashboard,
        },
        {
          emoji: '🔗',
          label: 'Google Review Link',
          sub: 'Add or update your review link',
          onPress: openDashboard,
        },
      ],
    },
    {
      title: 'Subscription',
      items: [
        {
          emoji: '💳',
          label: 'Billing & Plans',
          sub: plan.toUpperCase() + ' Plan',
          onPress: openDashboard,
          badge: plan === 'free' ? 'Upgrade' : null,
        },
        {
          emoji: '🎁',
          label: 'Referral Program',
          sub: 'Earn free months by referring',
          onPress: openDashboard,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          emoji: '💬',
          label: 'WhatsApp Support',
          sub: 'Get help instantly',
          onPress: () =>
            Linking.openURL('https://wa.me/234XXXXXXXXXX'),
        },
        {
          emoji: '📧',
          label: 'Email Support',
          sub: 'hello@reviewboost.app',
          onPress: () =>
            Linking.openURL('mailto:hello@reviewboost.app'),
        },
        {
          emoji: '⭐',
          label: 'Rate This App',
          sub: 'Love ReviewBoost? Let us know!',
          onPress: () =>
            Alert.alert(
              'Thank You!',
              'Rating feature coming soon ❤️'
            ),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>⚙️ Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || 'Loading...'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || ''}
            </Text>
            <View
              style={[
                styles.planBadge,
                { backgroundColor: planBg[plan] || planBg.free },
              ]}
            >
              <Text
                style={[
                  styles.planBadgeText,
                  { color: planTxt[plan] || planTxt.free },
                ]}
              >
                {plan.toUpperCase()} PLAN
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard Button */}
        <TouchableOpacity
          style={styles.dashBtn}
          onPress={openWebApp}
          activeOpacity={0.85}
        >
          <Text style={styles.dashEmoji}>🌐</Text>
          <View style={styles.dashInfo}>
            <Text style={styles.dashTitle}>Full Web Dashboard</Text>
            <Text style={styles.dashSub}>
              Analytics, billing, templates & more
            </Text>
          </View>
          <Text style={styles.dashArrow}>→</Text>
        </TouchableOpacity>

        {/* Menu Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>App Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Account</Text>
            <Text style={styles.appInfoValue}>
              {user?.email || 'Not logged in'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>
          ReviewBoost v1.0.0{'\n'}
          Made with ❤️
        </Text>
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
    padding: 20,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dashBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dashEmoji: {
    fontSize: 24,
  },
  dashInfo: {
    flex: 1,
  },
  dashTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  dashSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 3,
  },
  dashArrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  menuEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: '700',
  },
  menuArrow: {
    color: '#d1d5db',
    fontSize: 24,
    fontWeight: '300',
  },
  appInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  appInfoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  appInfoValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
  },
});