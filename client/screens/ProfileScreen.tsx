import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  Platform,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { Filters, DEFAULT_FILTERS, LANGUAGES, Language } from "@/types/question";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, rightElement }: SettingRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name={icon} size={18} color={theme.primary} />
        </View>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      </View>
      {rightElement ? (
        rightElement
      ) : value ? (
        <View style={styles.settingRight}>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
            {value}
          </ThemedText>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const data = await storage.getFilters();
    setFilters(data);
  };

  const handleLanguageChange = async () => {
    const currentIndex = LANGUAGES.indexOf(filters.language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    const newLanguage = LANGUAGES[nextIndex];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newFilters = { ...filters, language: newLanguage };
    setFilters(newFilters);
    await storage.setFilters(newFilters);
  };

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all your progress, saved questions, and preferences. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await storage.clearAllData();
            setFilters(DEFAULT_FILTERS);
            Alert.alert("Done", "All data has been cleared.");
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  const handleTerms = () => {
    Linking.openURL("https://example.com/terms");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.profileHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>
        </View>
        <ThemedText style={styles.userName}>Student</ThemedText>
        <ThemedText style={[styles.userSubtitle, { color: theme.textSecondary }]}>
          {filters.exam} Aspirant
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Preferences
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="globe"
            label="Language"
            value={filters.language}
            onPress={handleLanguageChange}
          />
          <SettingRow
            icon="bell"
            label="Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setNotifications(value);
                }}
                trackColor={{ false: theme.backgroundSecondary, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Current Settings
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow icon="target" label="Target Exam" value={filters.exam} />
          <SettingRow icon="sliders" label="Difficulty" value={`Level ${filters.difficulty}`} />
          <SettingRow
            icon="book"
            label="Subject"
            value={filters.subject === "Mix" ? "All Subjects" : filters.subject}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Support
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow icon="shield" label="Privacy Policy" onPress={handlePrivacyPolicy} />
          <SettingRow icon="file-text" label="Terms of Service" onPress={handleTerms} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <Pressable
          onPress={handleClearData}
          style={[styles.dangerButton, { backgroundColor: `${Colors.dark.error}15` }]}
        >
          <Feather name="trash-2" size={18} color={Colors.dark.error} />
          <ThemedText style={[styles.dangerButtonText, { color: Colors.dark.error }]}>
            Clear All Data
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          PrepStream v1.0.0
        </ThemedText>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          Powered by Gemini AI
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarContainer: {
    padding: Spacing.xs,
    borderRadius: 60,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  userSubtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    gap: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingValue: {
    fontSize: 15,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
  },
});
