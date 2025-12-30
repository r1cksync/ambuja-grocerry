import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  ChevronRight,
  Plus,
  Check,
  Loader2,
  Tag,
  X
} from 'lucide-react';
import { useAuthStore, useCartStore, CartItem } from '@/store';
import { orderAPI, userAPI, couponAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Address {
  _id: string;
  type: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Calculate totals
  const discount = appliedCoupon?.discount || 0;
  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const total = subtotal - discount + deliveryCharge;

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.push('/');
      return;
    }
    fetchAddresses();
  }, [user, items.length]);

  const fetchAddresses = async () => {
    try {
      const response = await userAPI.getAddresses();
      setAddresses(response.data);
      // Set default address as selected
      const defaultAddr = response.data.find((a: Address) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await couponAPI.apply(couponCode, subtotal);
      setAppliedCoupon(response.data);
      toast.success(`Coupon applied! You save ${formatPrice(response.data.discount)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address) {
      toast.error('Invalid address selected');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: items.map((item: CartItem) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      };

      const response = await orderAPI.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${response.data._id}?success=true`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Checkout - Ambuja Neotia Grocery</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                </div>

                {isLoadingAddresses ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No addresses saved</p>
                    <Link href="/addresses" className="btn-primary">
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress === address._id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address._id}
                            checked={selectedAddress === address._id}
                            onChange={() => setSelectedAddress(address._id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {address.fullName}
                              </span>
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                                {address.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.address}, {address.city}, {address.state} -{' '}
                              {address.pincode}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {address.phone}
                            </p>
                          </div>
                          {selectedAddress === address._id && (
                            <Check className="text-primary-600" size={20} />
                          )}
                        </div>
                      </label>
                    ))}
                    <Link
                      href="/addresses"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <Plus size={16} />
                      Add New Address
                    </Link>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <Truck size={20} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          Pay when you receive your order
                        </p>
                      </div>
                      {paymentMethod === 'cod' && (
                        <Check className="text-primary-600" size={20} />
                      )}
                    </div>
                  </label>

                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'online'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                      />
                      <CreditCard size={20} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Online Payment
                        </p>
                        <p className="text-sm text-gray-500">
                          Pay securely with UPI, Cards, or Netbanking
                        </p>
                      </div>
                      {paymentMethod === 'online' && (
                        <Check className="text-primary-600" size={20} />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Items ({items.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {items.map((item: CartItem) => (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3 py-2"
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.quantity * item.product.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Coupon */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag size={18} className="text-green-600" />
                        <span className="font-medium text-green-800">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">
                          -{formatPrice(appliedCoupon.discount)}
                        </span>
                        <button
                          onClick={removeCoupon}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-gray-900">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-gray-500">
                      Free delivery on orders above ₹500
                    </p>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold text-base">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !selectedAddress}
                  className="btn-primary w-full mt-6 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Placing Order...
                    </span>
                  ) : (
                    `Place Order • ${formatPrice(total)}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
