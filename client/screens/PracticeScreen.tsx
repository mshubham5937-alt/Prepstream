import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { QuestionCard } from "@/components/QuestionCard";
import { FiltersModal } from "@/components/FiltersModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Question, Filters, DEFAULT_FILTERS } from "@/types/question";
import { storage } from "@/lib/storage";
import { generateFallbackBatch } from "@/lib/fallback-questions";
import { apiRequest } from "@/lib/query-client";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PracticeScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const flatListRef = useRef<FlatList>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [refreshKey]);

  const loadFilters = async () => {
    const savedFilters = await storage.getFilters();
    setFilters(savedFilters);
  };

  const loadQuestions = async () => {
    setQuestions([]);
    setCurrentIndex(0);

    const fallbackQuestions = generateFallbackBatch(filters, 3);
    setQuestions(fallbackQuestions);

    fetchAIQuestions(2);
  };

  const fetchAIQuestions = async (count: number) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/questions/generate", {
        filters,
        count,
      });
      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        const formatted: Question[] = data.questions.map((q: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          solution: q.solution,
          subject: filters.subject === "Mix" ? q.subject || "Physics" : filters.subject,
          type: filters.exam,
          difficulty: filters.difficulty,
          isAiGenerated: true,
        }));
        setQuestions((prev) => [...prev, ...formatted]);
      } else {
        const fallbackQuestions = generateFallbackBatch(filters, count);
        setQuestions((prev) => [...prev, ...fallbackQuestions]);
      }
    } catch (error) {
      const fallbackQuestions = generateFallbackBatch(filters, count);
      setQuestions((prev) => [...prev, ...fallbackQuestions]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = async (newFilters: Filters) => {
    setFilters(newFilters);
    await storage.setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / SCREEN_HEIGHT);
      setCurrentIndex(index);

      if (index >= questions.length - 2 && !isLoading) {
        fetchAIQuestions(2);
      }
    },
    [questions.length, isLoading]
  );

  const handleAnswered = (isCorrect: boolean) => {
  };

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => (
    <QuestionCard
      question={item}
      onAnswered={handleAnswered}
      headerHeight={headerHeight}
      bottomPadding={tabBarHeight}
    />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  });

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item, index) => `${item.id}-${index}-${refreshKey}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        ListFooterComponent={
          <View
            style={[
              styles.loadingFooter,
              {
                height: SCREEN_HEIGHT,
                paddingTop: headerHeight + Spacing.xl,
                paddingBottom: tabBarHeight + Spacing.xl,
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
              Generating new questions...
            </ThemedText>
          </View>
        }
      />

      <View
        style={[
          styles.floatingHeader,
          { top: headerHeight + Spacing.sm },
        ]}
      >
        <Pressable
          onPress={() => setIsFiltersOpen(true)}
          style={[styles.filterButton, { backgroundColor: `${theme.backgroundRoot}CC` }]}
        >
          <Feather name="sliders" size={18} color={theme.text} />
        </Pressable>
      </View>

      <FiltersModal
        visible={isFiltersOpen}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onClose={() => setIsFiltersOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingFooter: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
