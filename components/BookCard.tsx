import { useAppStyles } from "@/hooks/useAppStyles";
import layout from "@/constants/layout";
import type { Title } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookCardProps {
  book: Title;
  onPress: (book: Title) => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  const { colors, typography } = useAppStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bookItem: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          padding: layout.spacing.md,
          borderRadius: layout.borderRadius.md,
          marginBottom: layout.spacing.md,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        bookImageContainer: {
          marginRight: layout.spacing.md,
        },
        bookImage: {
          width: 60,
          height: 80,
          borderRadius: layout.borderRadius.sm,
        },
        placeholderImage: {
          width: 60,
          height: 80,
          borderRadius: layout.borderRadius.sm,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        },
        bookInfo: {
          flex: 1,
        },
        bookTitle: {
          ...typography.h4,
          marginBottom: layout.spacing.xs,
        },
        bookType: {
          ...typography.bodySmall,
          marginBottom: 2,
        },
        bookDate: {
          ...typography.caption,
        },
      }),
    [colors, typography]
  );

  return (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      <View style={styles.bookImageContainer}>
        {book.coverImage ? (
          <Image
            source={{ uri: book.coverImage }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.name || "Untitled Book"}
        </Text>
        <Text style={styles.bookType}>Book</Text>
        <Text style={styles.bookDate}>
          Added {new Date(book.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}