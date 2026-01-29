import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { cleanMathText } from "@/lib/math-utils";

interface SolutionModalProps {
  visible: boolean;
  solution: string;
  isCorrect: boolean;
  onClose: () => void;
}

export function SolutionModal({
  visible,
  solution,
  isCorrect,
  onClose,
}: SolutionModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const cleanedSolution = cleanMathText(solution);

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
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor: isCorrect
                    ? `${Colors.dark.success}20`
                    : `${Colors.dark.error}20`,
                },
              ]}
            >
              <Feather
                name={isCorrect ? "check" : "x"}
                size={18}
                color={isCorrect ? Colors.dark.success : Colors.dark.error}
              />
            </View>
            <ThemedText style={styles.headerTitle}>Solution</ThemedText>
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
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: isCorrect
                  ? `${Colors.dark.success}10`
                  : `${Colors.dark.error}10`,
                borderColor: isCorrect ? Colors.dark.success : Colors.dark.error,
              },
            ]}
          >
            <Feather
              name={isCorrect ? "check-circle" : "alert-circle"}
              size={24}
              color={isCorrect ? Colors.dark.success : Colors.dark.error}
            />
            <ThemedText
              style={[
                styles.resultText,
                { color: isCorrect ? Colors.dark.success : Colors.dark.error },
              ]}
            >
              {isCorrect ? "Well done!" : "Not quite right"}
            </ThemedText>
          </View>

          <View style={styles.solutionSection}>
            <View style={styles.solutionHeader}>
              <Feather name="book-open" size={18} color={theme.accent} />
              <ThemedText style={styles.solutionTitle}>Explanation</ThemedText>
            </View>
            <ThemedText style={[styles.solutionText, { color: theme.text }]}>
              {cleanedSolution}
            </ThemedText>
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
            style={[styles.closeButtonLarge, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.closeButtonText}>Got it</ThemedText>
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
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
  },
  solutionSection: {
    gap: Spacing.md,
  },
  solutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  solutionText: {
    fontSize: 16,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  closeButtonLarge: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
