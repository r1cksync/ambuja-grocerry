import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { productAPI } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';

type CategoryProductsRouteProp = RouteProp<RootStackParamList, 'CategoryProducts'>;

export default function CategoryProductsScreen() {
  const route = useRoute<CategoryProductsRouteProp>();
  const { slug } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const fetchProducts = async (pageNum = 1) => {
    try {
      const response = await productAPI.getAll({ category: slug, page: pageNum, limit: 20 });
      const newProducts = response.data.products || [];
      
      if (pageNum === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard product={item} />
    </View>
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && products.length > 0 ? (
            <ActivityIndicator style={styles.loadingMore} color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>No products found in this category</Text>
          </View>
        }
      />
    </View>
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
  loadingMore: {
    paddingVertical: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: SIZES.base,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});
