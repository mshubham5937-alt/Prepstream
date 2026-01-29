import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  Filters,
  EXAM_TYPES,
  SUBJECTS,
  LANGUAGES,
  ExamType,
  Subject,
  Language,
} from "@/types/question";

interface FiltersModalProps {
  visible: boolean;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export function FiltersModal({
  visible,
  filters,
  onFiltersChange,
  onClose,
}: FiltersModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleExamChange = (exam: ExamType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, exam, subject: "Mix" });
  };

  const handleSubjectChange = (subject: Subject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, subject });
  };

  const handleDifficultyChange = (difficulty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, difficulty });
  };

  const handleLanguageChange = (language: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({ ...filters, language });
  };

  const validSubjects = SUBJECTS[filters.exam];

  const getSubjectIcon = (subject: string): keyof typeof Feather.glyphMap => {
    switch (subject) {
      case "Physics":
        return "zap";
      case "Chemistry":
        return "droplet";
      case "Maths":
        return "hash";
      case "Biology":
        return "heart";
      default:
        return "book";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Feather name="sliders" size={20} color={theme.text} />
            <ThemedText style={styles.headerTitle}>Preferences</ThemedText>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={22} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + Spacing["3xl"] },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Target Exam
            </ThemedText>
            <View style={styles.examGrid}>
              {EXAM_TYPES.map((exam) => (
                <Pressable
                  key={exam}
                  onPress={() => handleExamChange(exam)}
                  style={[
                    styles.examButton,
                    {
                      backgroundColor:
                        filters.exam === exam
                          ? theme.text
                          : theme.backgroundDefault,
                      borderColor:
                        filters.exam === exam ? theme.text : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.examButtonText,
                      {
                        color:
                          filters.exam === exam
                            ? theme.backgroundRoot
                            : theme.text,
                      },
                    ]}
                  >
                    {exam}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Subject
            </ThemedText>
            <View style={styles.subjectGrid}>
              <Pressable
                onPress={() => handleSubjectChange("Mix")}
                style={[
                  styles.subjectButton,
                  {
                    backgroundColor:
                      filters.subject === "Mix"
                        ? theme.primary
                        : theme.backgroundDefault,
                    borderColor:
                      filters.subject === "Mix" ? theme.primary : theme.border,
                  },
                ]}
              >
                <Feather
                  name="shuffle"
                  size={14}
                  color={filters.subject === "Mix" ? "#FFFFFF" : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.subjectButtonText,
                    {
                      color: filters.subject === "Mix" ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  Mix All
                </ThemedText>
              </Pressable>
              {validSubjects.map((subject) => (
                <Pressable
                  key={subject}
                  onPress={() => handleSubjectChange(subject as Subject)}
                  style={[
                    styles.subjectButton,
                    {
                      backgroundColor:
                        filters.subject === subject
                          ? theme.primary
                          : theme.backgroundDefault,
                      borderColor:
                        filters.subject === subject ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Feather
                    name={getSubjectIcon(subject)}
                    size={14}
                    color={
                      filters.subject === subject ? "#FFFFFF" : theme.textSecondary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.subjectButtonText,
                      {
                        color:
                          filters.subject === subject ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {subject}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Difficulty
              </ThemedText>
              <ThemedText style={[styles.difficultyValue, { color: theme.primary }]}>
                Level {filters.difficulty}
              </ThemedText>
            </View>
            <View
              style={[
                styles.difficultyContainer,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <View
                style={[
                  styles.difficultyIndicator,
                  {
                    backgroundColor: theme.primary,
                    left: `${(filters.difficulty - 1) * 20}%`,
                    width: "20%",
                  },
                ]}
              />
              {[1, 2, 3, 4, 5].map((level) => (
                <Pressable
                  key={level}
                  onPress={() => handleDifficultyChange(level)}
                  style={styles.difficultyButton}
                >
                  <ThemedText
                    style={[
                      styles.difficultyButtonText,
                      {
                        color:
                          filters.difficulty === level
                            ? "#FFFFFF"
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {level}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Language
            </ThemedText>
            <View style={styles.languageGrid}>
              {LANGUAGES.map((language) => (
                <Pressable
                  key={language}
                  onPress={() => handleLanguageChange(language)}
                  style={[
                    styles.languageButton,
                    {
                      backgroundColor:
                        filters.language === language
                          ? theme.primary
                          : theme.backgroundDefault,
                      borderColor:
                        filters.language === language ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.languageButtonText,
                      {
                        color:
                          filters.language === language ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {language}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.backgroundRoot,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={[styles.applyButton, { backgroundColor: theme.text }]}
          >
            <ThemedText
              style={[styles.applyButtonText, { color: theme.backgroundRoot }]}
            >
              Apply Changes
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing["2xl"],
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  difficultyValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  examGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  examButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
  },
  examButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  subjectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  subjectButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  difficultyContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
    position: "relative",
    height: 48,
  },
  difficultyIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    borderRadius: BorderRadius.sm,
    zIndex: 0,
  },
  difficultyButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  languageButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
