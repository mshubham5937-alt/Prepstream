import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { UserStats } from "@/types/question";
import { storage } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  label: string;
  value: string | number;
  delay: number;
}

function StatCard({ icon, iconColor, label, value, delay }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={styles.statCard}>
      <Card elevation={2} style={styles.statCardInner}>
        <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
      </Card>
    </Animated.View>
  );
}

interface SubjectProgressProps {
  subject: string;
  attempted: number;
  correct: number;
  delay: number;
}

function SubjectProgress({ subject, attempted, correct, delay }: SubjectProgressProps) {
  const { theme, isDark } = useTheme();
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const getSubjectColor = (subj: string) => {
    switch (subj.toLowerCase()) {
      case "physics":
        return Colors.dark.physics;
      case "chemistry":
        return Colors.dark.chemistry;
      case "maths":
        return Colors.dark.maths;
      case "biology":
        return Colors.dark.biology;
      default:
        return theme.primary;
    }
  };

  const color = getSubjectColor(subject);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
      style={[styles.subjectCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.subjectHeader}>
        <View style={[styles.subjectDot, { backgroundColor: color }]} />
        <ThemedText style={styles.subjectName}>{subject}</ThemedText>
        <ThemedText style={[styles.subjectAccuracy, { color }]}>{accuracy}%</ThemedText>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSecondary }]}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: color, width: `${accuracy}%` },
          ]}
        />
      </View>
      <View style={styles.subjectStats}>
        <ThemedText style={[styles.subjectStatText, { color: theme.textSecondary }]}>
          {correct}/{attempted} correct
        </ThemedText>
      </View>
    </Animated.View>
  );
}

function EmptyState() {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="bar-chart-2" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Progress Yet</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start practicing to see your stats here
      </ThemedText>
    </View>
  );
}

export default function ProgressScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    const data = await storage.getStats();
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

  const accuracy =
    stats && stats.questionsAttempted > 0
      ? Math.round((stats.correctAnswers / stats.questionsAttempted) * 100)
      : 0;

  const hasData = stats && stats.questionsAttempted > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {hasData ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                icon="check-circle"
                iconColor={Colors.dark.success}
                label="Questions"
                value={stats?.questionsAttempted || 0}
                delay={0}
              />
              <StatCard
                icon="target"
                iconColor={Colors.dark.info}
                label="Accuracy"
                value={`${accuracy}%`}
                delay={100}
              />
              <StatCard
                icon="zap"
                iconColor={Colors.dark.warning}
                label="Current Streak"
                value={stats?.currentStreak || 0}
                delay={200}
              />
              <StatCard
                icon="award"
                iconColor={Colors.dark.primary}
                label="Best Streak"
                value={stats?.bestStreak || 0}
                delay={300}
              />
            </View>

            {stats?.subjectStats && Object.keys(stats.subjectStats).length > 0 ? (
              <View style={styles.subjectsSection}>
                <ThemedText style={styles.sectionTitle}>Subject Breakdown</ThemedText>
                {Object.entries(stats.subjectStats).map(([subject, data], index) => (
                  <SubjectProgress
                    key={subject}
                    subject={subject}
                    attempted={data.attempted}
                    correct={data.correct}
                    delay={400 + index * 100}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
  },
  statCardInner: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  subjectsSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subjectCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  subjectAccuracy: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  subjectStats: {
    flexDirection: "row",
  },
  subjectStatText: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
});
