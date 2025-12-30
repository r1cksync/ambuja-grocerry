import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { productAPI } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await productAPI.search({ q: query.trim() });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setProducts([]);
    setHasSearched(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor={COLORS.gray[400]}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : hasSearched ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {products.length} {products.length === 1 ? 'result' : 'results'} for "{query}"
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={COLORS.gray[300]} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with different keywords
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.initialText}>
            Search for groceries, fruits, vegetables, and more
          </Text>
          
          {/* Popular Searches */}
          <View style={styles.popularContainer}>
            <Text style={styles.popularTitle}>Popular Searches</Text>
            <View style={styles.tagsContainer}>
              {['Milk', 'Rice', 'Eggs', 'Bread', 'Fruits', 'Vegetables'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => {
                    setQuery(tag);
                    handleSearch();
                  }}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: SIZES.base,
    color: COLORS.gray[900],
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  initialText: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  popularContainer: {
    marginTop: SPACING.xl,
    width: '100%',
  },
  popularTitle: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    margin: SPACING.xs,
  },
  tagText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.md,
  },
});
