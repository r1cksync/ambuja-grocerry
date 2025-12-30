import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { productAPI } from '../services/api';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';

const { width } = Dimensions.get('window');

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { slug } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, cart } = useCartStore();

  // Check if product is already in cart
  const cartItem = cart?.items.find((item) => item.product.slug === slug);
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getBySlug(slug);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = useCallback(async () => {
    if (product) {
      await addToCart(product._id, quantity);
    }
  }, [product, quantity, addToCart]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const discount = product
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImageIndex] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.thumbnailImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.quantity}>
            {product.quantity} {product.unit}
          </Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.mrp > product.price && (
              <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            {product.stock > 0 ? (
              <View style={styles.inStock}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.inStockText}>In Stock</Text>
              </View>
            ) : (
              <View style={styles.outOfStock}>
                <Ionicons name="close-circle" size={16} color={COLORS.error} />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <View style={styles.highlightsContainer}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {product.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Selector */}
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={quantity <= 1 ? COLORS.gray[300] : COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setQuantity((q) => Math.min(product.maxOrderQty, q + 1))}
            disabled={quantity >= product.maxOrderQty}
          >
            <Ionicons
              name="add"
              size={20}
              color={quantity >= product.maxOrderQty ? COLORS.gray[300] : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            product.stock === 0 && styles.addToCartBtnDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons name="cart" size={20} color={COLORS.white} />
          <Text style={styles.addToCartText}>
            {cartQuantity > 0 ? `Add More (${cartQuantity} in cart)` : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: COLORS.gray[50],
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
  },
  thumbnailContent: {
    paddingHorizontal: SPACING.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: SPACING.base,
  },
  brand: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  quantity: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  price: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mrp: {
    fontSize: SIZES.lg,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginLeft: SPACING.sm,
  },
  stockContainer: {
    marginTop: SPACING.md,
  },
  inStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inStockText: {
    marginLeft: SPACING.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  outOfStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockText: {
    marginLeft: SPACING.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  highlightsContainer: {
    marginTop: SPACING.lg,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  highlightText: {
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  quantityBtn: {
    padding: SPACING.sm,
  },
  quantityValue: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.md,
    color: COLORS.gray[900],
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: SPACING.md,
  },
  addToCartBtnDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  addToCartText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.base,
    marginLeft: SPACING.sm,
  },
});
