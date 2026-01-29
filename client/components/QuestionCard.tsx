import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { SolutionModal } from "@/components/SolutionModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Question } from "@/types/question";
import { storage } from "@/lib/storage";
import { cleanMathText } from "@/lib/math-utils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface QuestionCardProps {
  question: Question;
  onAnswered: (isCorrect: boolean) => void;
  headerHeight: number;
  bottomPadding: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuestionCard({
  question,
  onAnswered,
  headerHeight,
  bottomPadding,
}: QuestionCardProps) {
  const { theme, isDark } = useTheme();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const submitButtonScale = useSharedValue(1);
  const submitButtonOpacity = useSharedValue(0);

  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowSolution(false);
    checkBookmark();
  }, [question.id]);

  useEffect(() => {
    submitButtonOpacity.value = withTiming(selectedOption !== null ? 1 : 0, {
      duration: 200,
    });
  }, [selectedOption]);

  const checkBookmark = async () => {
    const saved = await storage.isQuestionSaved(question.id);
    setIsBookmarked(saved);
  };

  const handleOptionPress = (index: number) => {
    if (isSubmitted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitted(true);

    const isCorrect = selectedOption === question.correctIndex;
    await storage.updateStats(isCorrect, question.subject);

    if (!isCorrect) {
      await storage.saveQuestion(question, "mistake", selectedOption);
    }

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    onAnswered(isCorrect);
  };

  const handleBookmark = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isBookmarked) {
      const saved = await storage.getSavedQuestions();
      const found = saved.find((q) => q.question.id === question.id);
      if (found) {
        await storage.removeSavedQuestion(found.id);
      }
    } else {
      await storage.saveQuestion(question, "bookmark");
    }
    setIsBookmarked(!isBookmarked);
  };

  const isCorrect = selectedOption === question.correctIndex;

  const getSubjectColor = (subject: string) => {
    const colorKey = subject.toLowerCase() as keyof typeof Colors.dark;
    if (colorKey in Colors.dark) {
      return isDark
        ? Colors.dark[colorKey as "physics" | "chemistry" | "maths" | "biology"]
        : Colors.light[colorKey as "physics" | "chemistry" | "maths" | "biology"];
    }
    return theme.primary;
  };

  const subjectColor = getSubjectColor(question.subject);

  const submitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
    opacity: submitButtonOpacity.value,
  }));

  const cleanedQuestionText = cleanMathText(question.text);
  const cleanedOptions = question.options.map((opt) => cleanMathText(opt));

  const OptionButton = ({
    option,
    index,
  }: {
    option: string;
    index: number;
  }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedOption === index;
    const isCorrectOption = index === question.correctIndex;

    let backgroundColor = theme.backgroundDefault;
    let borderColor = theme.border;
    let textColor = theme.text;

    if (isSubmitted) {
      if (isCorrectOption) {
        backgroundColor = isDark
          ? "rgba(16, 185, 129, 0.2)"
          : "rgba(16, 185, 129, 0.15)";
        borderColor = Colors.dark.success;
        textColor = Colors.dark.success;
      } else if (isSelected && !isCorrect) {
        backgroundColor = isDark
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(239, 68, 68, 0.15)";
        borderColor = Colors.dark.error;
        textColor = Colors.dark.error;
      } else {
        backgroundColor = theme.backgroundSecondary;
        borderColor = theme.border;
      }
    } else if (isSelected) {
      backgroundColor = isDark
        ? "rgba(99, 102, 241, 0.15)"
        : "rgba(99, 102, 241, 0.1)";
      borderColor = theme.primary;
      textColor = theme.primary;
    }

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        onPress={() => handleOptionPress(index)}
        onPressIn={() => {
          if (!isSubmitted) scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        disabled={isSubmitted}
        style={[
          styles.optionButton,
          {
            backgroundColor,
            borderColor,
          },
          animatedStyle,
        ]}
        testID={`option-${index}`}
      >
        <View style={styles.optionContent}>
          <ThemedText
            style={[styles.optionText, { color: textColor }]}
            numberOfLines={3}
          >
            {option}
          </ThemedText>
          {isSubmitted && isCorrectOption ? (
            <Feather name="check-circle" size={20} color={Colors.dark.success} />
          ) : null}
          {isSubmitted && isSelected && !isCorrect ? (
            <Feather name="x-circle" size={20} color={Colors.dark.error} />
          ) : null}
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: bottomPadding + Spacing.lg,
        },
      ]}
    >
      <View
        style={[
          styles.decorativeBlob,
          {
            backgroundColor: subjectColor,
          },
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        <View style={styles.header}>
          <View style={styles.tagRow}>
            <View
              style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}
            >
              <ThemedText style={styles.tagText}>{question.type}</ThemedText>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: `${subjectColor}20`, borderColor: subjectColor },
              ]}
            >
              <ThemedText style={[styles.tagText, { color: subjectColor }]}>
                {question.subject}
              </ThemedText>
            </View>
            {question.isAiGenerated ? (
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: `${theme.primary}20`,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Feather name="zap" size={10} color={theme.primary} />
                <ThemedText style={[styles.tagText, { color: theme.primary }]}>
                  {" AI"}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={handleBookmark} style={styles.bookmarkButton}>
              <Feather
                name={isBookmarked ? "bookmark" : "bookmark"}
                size={20}
                color={isBookmarked ? theme.accent : theme.textSecondary}
              />
            </Pressable>
            <View style={styles.difficultyDots}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.difficultyDot,
                    {
                      backgroundColor:
                        level <= question.difficulty
                          ? theme.accent
                          : theme.backgroundSecondary,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.questionContainer}>
          <ThemedText style={styles.questionText}>{cleanedQuestionText}</ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {cleanedOptions.map((option, index) => (
            <OptionButton key={index} option={option} index={index} />
          ))}
        </View>

        {isSubmitted ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.resultContainer}
          >
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: isCorrect
                    ? `${Colors.dark.success}15`
                    : `${Colors.dark.error}15`,
                  borderColor: isCorrect ? Colors.dark.success : Colors.dark.error,
                },
              ]}
            >
              <Feather
                name={isCorrect ? "check-circle" : "x-circle"}
                size={24}
                color={isCorrect ? Colors.dark.success : Colors.dark.error}
              />
              <ThemedText
                style={[
                  styles.resultText,
                  {
                    color: isCorrect ? Colors.dark.success : Colors.dark.error,
                  },
                ]}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </ThemedText>
            </View>

            <Pressable
              onPress={() => setShowSolution(true)}
              style={[styles.solutionButton, { backgroundColor: theme.primary }]}
            >
              <Feather name="book-open" size={18} color="#FFFFFF" />
              <ThemedText style={styles.solutionButtonText}>
                View Solution
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>

      {!isSubmitted && selectedOption !== null ? (
        <Animated.View style={[styles.submitButtonContainer, submitAnimatedStyle]}>
          <Pressable
            onPress={handleSubmit}
            onPressIn={() => {
              submitButtonScale.value = withSpring(0.95);
            }}
            onPressOut={() => {
              submitButtonScale.value = withSpring(1);
            }}
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            testID="submit-button"
          >
            <ThemedText style={styles.submitButtonText}>Submit Answer</ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}

      <SolutionModal
        visible={showSolution}
        solution={question.solution}
        isCorrect={isCorrect}
        onClose={() => setShowSolution(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  decorativeBlob: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  tagRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  bookmarkButton: {
    padding: Spacing.xs,
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
  questionContainer: {
    marginBottom: Spacing["2xl"],
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 32,
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: Spacing.sm,
  },
  resultContainer: {
    marginTop: Spacing.lg,
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
  },
  solutionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  solutionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonContainer: {
    position: "absolute",
    bottom: 120,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  submitButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
