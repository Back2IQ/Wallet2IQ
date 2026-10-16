import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { Platform, View, Text, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { useWallet } from "@/lib/wallet-context";
import { useTranslation } from "@/lib/i18n";

function TabIcon({ icon, label, focused, color }: { icon: string; label: string; focused: boolean; color: string }) {
  return (
    <View style={[tabStyles.tabItem, focused && tabStyles.tabItemFocused]}>
      <Text style={[tabStyles.tabIcon, { color: focused ? color : '#6B7280' }]}>{icon}</Text>
      <Text style={[tabStyles.tabLabel, { color: focused ? color : '#6B7280' }]}>{label}</Text>
    </View>
  );
}

function ShieldTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={[tabStyles.shieldTab, focused && tabStyles.shieldTabFocused]}>
      <Text style={tabStyles.shieldIcon}>🛡️</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding;
  const router = useRouter();
  const { state, isLoading } = useWallet();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !state.isSetup) {
      router.replace('/onboarding' as any);
    }
  }, [isLoading, state.isSetup]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: '#0D1117',
          borderTopColor: '#1F2937',
          borderTopWidth: 0.5,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" label={t('tabs.home')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="💰" label={t('tabs.assets')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shield"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <ShieldTabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📋" label={t('tabs.history')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⚙️" label={t('tabs.settings')} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabItemFocused: {},
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  shieldTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#374151',
  },
  shieldTabFocused: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  shieldIcon: {
    fontSize: 26,
  },
});
