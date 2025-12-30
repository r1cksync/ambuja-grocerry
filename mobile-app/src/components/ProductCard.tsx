import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { addToCart, cart } = useCartStore();

  // Calculate discount percentage
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Check if product is in cart
  const cartItem = cart?.items.find((item) => item.product._id === product._id);
  const cartQuantity = cartItem?.quantity || 0;

  const formatPrice = (price: number) => `₹${price.toFixed(0)}`;

  const handleAddToCart = async () => {
    await addToCart(product._id, 1);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.thumbnail || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="contain"
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {product.brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
        )}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.quantity}>
          {product.quantity} {product.unit}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.mrp > product.price && (
            <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
          )}
        </View>

        {/* Add to Cart Button */}
        {cartQuantity > 0 ? (
          <View style={styles.cartQuantity}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={async () => {
                const { updateQuantity, removeFromCart } = useCartStore.getState();
                if (cartQuantity > 1) {
                  await updateQuantity(product._id, cartQuantity - 1);
                } else {
                  await removeFromCart(product._id);
                }
              }}
            >
              <Ionicons
                name={cartQuantity === 1 ? 'trash-outline' : 'remove'}
                size={16}
                color={cartQuantity === 1 ? COLORS.error : COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{cartQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={async () => {
                const { updateQuantity } = useCartStore.getState();
                if (cartQuantity < product.maxOrderQty) {
                  await updateQuantity(product._id, cartQuantity + 1);
                }
              }}
              disabled={cartQuantity >= product.maxOrderQty}
            >
              <Ionicons
                name="add"
                size={16}
                color={cartQuantity >= product.maxOrderQty ? COLORS.gray[300] : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Ionicons name="add" size={18} color={product.stock === 0 ? COLORS.gray[400] : COLORS.primary} />
            <Text style={[styles.addButtonText, product.stock === 0 && styles.addButtonTextDisabled]}>
              ADD
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray[50],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  outOfStockBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  info: {
    padding: SPACING.sm,
  },
  brand: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    lineHeight: 18,
    minHeight: 36,
  },
  quantity: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  price: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  mrp: {
    fontSize: SIZES.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.sm,
  },
  addButtonDisabled: {
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
  },
  addButtonText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 2,
  },
  addButtonTextDisabled: {
    color: COLORS.gray[400],
  },
  cartQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  quantityBtn: {
    padding: SPACING.xs,
  },
  quantityText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    paddingHorizontal: SPACING.sm,
  },
});
