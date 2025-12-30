import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Tag, Percent, Calendar } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const initialFormData: CouponFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 100,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isActive: true,
};

export default function VendorCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      // Mock data for demo
      setCoupons([
        {
          _id: '1',
          code: 'WELCOME10',
          description: '10% off on your first order',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 200,
          maxDiscount: 100,
          usageLimit: 100,
          usedCount: 45,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          isActive: true,
        },
        {
          _id: '2',
          code: 'FLAT50',
          description: '₹50 off on orders above ₹500',
          discountType: 'fixed',
          discountValue: 50,
          minOrderAmount: 500,
          maxDiscount: 50,
          usageLimit: 200,
          usedCount: 120,
          validFrom: '2024-01-01',
          validUntil: '2024-06-30',
          isActive: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        validFrom: coupon.validFrom.split('T')[0],
        validUntil: coupon.validUntil.split('T')[0],
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discountValue) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', formData);
        toast.success('Coupon created successfully');
      }
      closeModal();
      fetchCoupons();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingCoupon ? 'update' : 'create'} coupon`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : coupons.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No coupons created yet</p>
            <button onClick={() => openModal()} className="btn-primary">
              Create First Coupon
            </button>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      {coupon.discountType === 'percentage' ? (
                        <Percent size={20} className="text-primary-600" />
                      ) : (
                        <Tag size={20} className="text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {coupon.code}
                      </p>
                      <p className="text-primary-600 font-medium">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Min. Order</span>
                    <span className="text-gray-700">
                      {formatPrice(coupon.minOrderAmount)}
                    </span>
                  </div>
                  {coupon.discountType === 'percentage' && coupon.maxDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>Max. Discount</span>
                      <span className="text-gray-700">
                        {formatPrice(coupon.maxDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Usage</span>
                    <span className="text-gray-700">
                      {coupon.usedCount} / {coupon.usageLimit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      Valid till {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => toggleStatus(coupon)}
                  className="flex-1 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openModal(coupon)}
                  className="flex-1 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 border-l border-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="flex-1 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-l border-gray-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      className="input"
                      placeholder="SAVE10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountType: e.target.value as 'percentage' | 'fixed',
                        }))
                      }
                      className="input"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="input"
                    placeholder="10% off on first order"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountValue: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="input"
                      placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minOrderAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="input"
                      placeholder="200"
                      min="0"
                    />
                  </div>
                </div>

                {formData.discountType === 'percentage' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max. Discount
                      </label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxDiscount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="input"
                        placeholder="100"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            usageLimit: parseInt(e.target.value) || 100,
                          }))
                        }
                        className="input"
                        placeholder="100"
                        min="1"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validFrom: e.target.value,
                        }))
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                      className="input"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Coupon is active</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Saving...
                      </span>
                    ) : editingCoupon ? (
                      'Update Coupon'
                    ) : (
                      'Create Coupon'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
