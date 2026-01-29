import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInRight, SlideOutRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { SavedQuestion } from "@/types/question";
import { storage } from "@/lib/storage";

type TabType = "bookmarks" | "mistakes";

interface QuestionItemProps {
  item: SavedQuestion;
  onRemove: (id: string) => void;
}

function QuestionItem({ item, onRemove }: QuestionItemProps) {
  const { theme, isDark } = useTheme();

  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
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

  const subjectColor = getSubjectColor(item.question.subject);

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove(item.id);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={SlideOutRight.duration(200)}
      style={[styles.questionItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionTags}>
          <View
            style={[
              styles.tag,
              { backgroundColor: `${subjectColor}20`, borderColor: subjectColor },
            ]}
          >
            <ThemedText style={[styles.tagText, { color: subjectColor }]}>
              {item.question.subject}
            </ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.tagText, { color: theme.textSecondary }]}>
              {item.question.type}
            </ThemedText>
          </View>
          {item.type === "mistake" ? (
            <View
              style={[
                styles.tag,
                { backgroundColor: `${Colors.dark.error}20`, borderColor: Colors.dark.error },
              ]}
            >
              <Feather name="x-circle" size={10} color={Colors.dark.error} />
              <ThemedText style={[styles.tagText, { color: Colors.dark.error }]}>
                {" Mistake"}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <Pressable onPress={handleRemove} style={styles.removeButton}>
          <Feather name="trash-2" size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
      <ThemedText style={styles.questionText} numberOfLines={3}>
        {item.question.text}
      </ThemedText>
      <View style={styles.questionFooter}>
        <View style={styles.difficultyDots}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              style={[
                styles.difficultyDot,
                {
                  backgroundColor:
                    level <= item.question.difficulty
                      ? theme.accent
                      : theme.backgroundSecondary,
                },
              ]}
            />
          ))}
        </View>
        <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
          {new Date(item.savedAt).toLocaleDateString()}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

function EmptyState({ tab }: { tab: TabType }) {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather
          name={tab === "bookmarks" ? "bookmark" : "alert-circle"}
          size={48}
          color={theme.textSecondary}
        />
      </View>
      <ThemedText style={styles.emptyTitle}>
        {tab === "bookmarks" ? "No Bookmarks Yet" : "No Mistakes Recorded"}
      </ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {tab === "bookmarks"
          ? "Bookmark questions while practicing to review later"
          : "Questions you answer incorrectly will appear here"}
      </ThemedText>
    </View>
  );
}

export default function LibraryScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("bookmarks");
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedQuestions = async () => {
    const data = await storage.getSavedQuestions();
    setSavedQuestions(data);
  };

  useEffect(() => {
    loadSavedQuestions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedQuestions();
    setRefreshing(false);
  }, []);

  const handleRemove = async (id: string) => {
    await storage.removeSavedQuestion(id);
    setSavedQuestions((prev) => prev.filter((q) => q.id !== id));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filteredQuestions = savedQuestions.filter((q) =>
    activeTab === "bookmarks" ? q.type === "bookmark" : q.type === "mistake"
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.tabBar,
          {
            marginTop: headerHeight + Spacing.md,
            backgroundColor: theme.backgroundDefault,
          },
        ]}
      >
        {(["bookmarks", "mistakes"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
            style={[
              styles.tabButton,
              activeTab === tab && { backgroundColor: theme.primary },
            ]}
          >
            <Feather
              name={tab === "bookmarks" ? "bookmark" : "alert-circle"}
              size={16}
              color={activeTab === tab ? "#FFFFFF" : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.tabButtonText,
                { color: activeTab === tab ? "#FFFFFF" : theme.text },
              ]}
            >
              {tab === "bookmarks" ? "Bookmarks" : "Mistakes"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredQuestions}
        renderItem={({ item }) => (
          <QuestionItem item={item} onRemove={handleRemove} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  questionItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  questionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  removeButton: {
    padding: Spacing.xs,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  questionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyDots: {
    flexDirection: "row",
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dateText: {
    fontSize: 12,
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
    paddingHorizontal: Spacing["2xl"],
  },
});
