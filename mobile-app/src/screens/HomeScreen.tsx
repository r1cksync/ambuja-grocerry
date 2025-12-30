import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { productAPI, categoryAPI } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { fetchCart } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ isFeatured: true, limit: 10 }),
        categoryAPI.getAll('root'),
      ]);
      setFeaturedProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCart();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryProducts', { slug: item.slug, name: item.name })}
    >
      <View style={styles.categoryImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        ) : (
          <View style={[styles.categoryImage, styles.categoryPlaceholder]}>
            <Ionicons name="grid-outline" size={24} color={COLORS.gray[400]} />
          </View>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
        <Text style={styles.searchText}>Search for products...</Text>
      </TouchableOpacity>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Fresh Groceries</Text>
        <Text style={styles.bannerSubtitle}>Exclusive for Ambuja Neotia Employees</Text>
        <Text style={styles.bannerOffer}>Free delivery on orders above ₹500</Text>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Categories' } as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
        </View>
        <View style={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </View>
      </View>

      {/* Spacer */}
      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.base,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchText: {
    marginLeft: SPACING.sm,
    color: COLORS.gray[400],
    fontSize: SIZES.md,
  },
  banner: {
    backgroundColor: COLORS.primary,
    margin: SPACING.base,
    padding: SPACING.xl,
    borderRadius: 16,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: COLORS.white,
    fontSize: SIZES.md,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  bannerOffer: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  seeAll: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: SPACING.base,
  },
  categoryCard: {
    width: 80,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  categoryImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  categoryPlaceholder: {
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: SIZES.xs,
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
});
