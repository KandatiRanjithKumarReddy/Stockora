import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductImage } from '../../components/common/ProductImage';
import {
  Search,
  Plus,
  Minus,
  Check,
  Gift,
  Percent,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CatalogPageProps {
  onNavigate: (view: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [steppers, setSteppers] = useState<{ [productId: string]: number }>({});

  const { addToCart, cart, itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, search, inStockOnly, user?.id]);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        setBrands(res.data.brands);
      }
    } catch {
      // Categories filter remains at default ALL
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedBrand !== 'ALL') params.brand = selectedBrand;
      if (search) params.search = search;
      if (inStockOnly) params.inStock = 'true';

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch {
      toast.error('Unable to load wholesale catalog.', { id: 'catalog-fetch-err' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepperQty = (productId: string) => steppers[productId] || 1;

  const handleStep = (productId: string, delta: number) => {
    setSteppers((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: any) => {
    const qty = getStepperQty(product._id);
    addToCart(product, qty);
    toast.success(`Added ${qty} case${qty > 1 ? 's' : ''} of ${product.name}.`, {
      id: `cart-add-${product.sku}`,
    });
  };

  const getInCartCases = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.orderedCases : 0;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Wholesale Product Catalog
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user?.retailer?.storeName
              ? `Authorized dealer rates for ${user.retailer.storeName} • Prices shown excluding GST`
              : 'Direct wholesale carton & per-pack dealer prices • All base rates exclude GST'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, biscuit, tea..."
              aria-label="Search catalog products"
              className="form-input pl-10"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('ai-order')}
            className="btn-secondary shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Paste Order List</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold'
                : 'bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-hover'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold'
                  : 'bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {brands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              aria-label="Filter by brand"
              className="min-h-[38px] px-3 py-1.5 text-base sm:text-sm rounded-lg border border-zinc-300 dark:border-dark-borderStrong bg-white dark:bg-dark-elevated text-zinc-800 dark:text-zinc-200 outline-none"
            >
              <option value="ALL">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          <label className="min-h-[38px] px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="surface-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-dark-elevated" />
              <div className="p-5 space-y-3">
                <div className="h-3.5 w-1/3 bg-zinc-200 dark:bg-dark-hover rounded" />
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-dark-hover rounded" />
                <div className="h-16 w-full bg-zinc-100 dark:bg-dark-elevated rounded-lg" />
                <div className="h-11 w-full bg-zinc-200 dark:bg-dark-hover rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 px-4 text-center surface-card space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            No matching wholesale products
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Adjust your search term or reset the category and stock filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedBrand('ALL');
              setSearch('');
              setInStockOnly(false);
            }}
            className="btn-secondary mt-1"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p, idx) => {
            const inCart = getInCartCases(p._id);
            const isOutOfStock = p.stockStatus === 'OUT_OF_STOCK';

            return (
              <article
                key={p._id}
                className="surface-card flex flex-col justify-between overflow-hidden hover:border-zinc-300 dark:hover:border-dark-borderStrong transition-colors"
              >
                <div>
                  {/* Optimized Aspect-Ratio Image Container */}
                  <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-dark-elevated border-b border-zinc-200/70 dark:border-dark-border overflow-hidden">
                    <ProductImage
                      sku={p.sku}
                      src={p.imageUrl}
                      alt={p.name}
                      width={400}
                      height={300}
                      eager={idx < 3}
                      className="w-full h-full object-cover"
                    />

                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3">
                      {p.stockStatus === 'IN_STOCK' && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-xs font-semibold shadow-sm tabular-nums">
                          {p.availableCases !== null && p.availableCases !== undefined
                            ? `${p.availableCases} cases available`
                            : 'In stock'}
                        </span>
                      )}
                      {p.stockStatus === 'LOW_STOCK' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-xs font-semibold shadow-sm tabular-nums">
                          {p.availableCases !== null && p.availableCases !== undefined
                            ? `Low stock: ${p.availableCases} left`
                            : 'Low stock'}
                        </span>
                      )}
                      {p.stockStatus === 'OUT_OF_STOCK' && (
                        <span className="px-2.5 py-1 rounded-md bg-rose-700 text-white text-xs font-semibold shadow-sm">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* HSN & Tax Pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-zinc-900/80 text-white text-xs font-medium backdrop-blur-sm tabular-nums">
                      {p.gstRatePercent}% GST
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="font-semibold uppercase tracking-wider">{p.brand}</span>
                        <span className="font-mono">{p.sku}</span>
                      </div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white leading-snug">
                        {p.name}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
                        Pack {p.packSize} • {p.unitsPerCase} packs / case • HSN {p.hsnCode}
                      </p>
                    </div>

                    {/* Active Trade Scheme Banner */}
                    {p.activeScheme ? (
                      <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        {p.activeScheme.schemeType === 'BUY_X_GET_Y_FREE' ? (
                          <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">{p.activeScheme.name}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200/70 dark:border-dark-border text-xs text-zinc-500 dark:text-zinc-400">
                        Standard wholesale rate • Net case billing
                      </div>
                    )}

                    {/* Wholesale Price Transparency Box */}
                    {p.priceRestricted || p.calculatedCasePrice === null ? (
                      <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200/80 dark:border-dark-border flex items-center justify-between gap-2 tabular-nums">
                        <div>
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Shop Wholesale Rate ({p.isGstIncluded ? 'Incl. GST' : `Excl. ${p.gstRatePercent}% GST`})
                          </div>
                          <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span>Sign in to view your shop rate</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Retail MRP
                          </div>
                          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            ₹{p.mrp} / pack
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200/80 dark:border-dark-border flex items-baseline justify-between gap-2 tabular-nums">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            <span>Case Rate ({p.isGstIncluded ? 'Incl. GST' : `Excl. ${p.gstRatePercent}% GST`})</span>
                            {p.hasCustomPrice && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                                Shop Rate
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                            ₹{p.calculatedCasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Dealer / Pack
                          </div>
                          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            ₹{p.dealerPricePerPack.toFixed(2)}
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through ml-1.5">
                              MRP ₹{p.mrp}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Touch-Friendly Stepper + Add */}
                <div className="px-5 pb-5 pt-0">
                  {p.priceRestricted || p.calculatedCasePrice === null ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('auth')}
                      className="btn-secondary w-full"
                    >
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Sign in for Dealer Rate</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-dark-borderStrong bg-zinc-50 dark:bg-dark-elevated">
                        <button
                          type="button"
                          onClick={() => handleStep(p._id, -1)}
                          disabled={isOutOfStock}
                          aria-label={`Decrease cases for ${p.name}`}
                          className="min-w-[40px] min-h-[44px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-l-lg disabled:opacity-40 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                          {getStepperQty(p._id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStep(p._id, 1)}
                          disabled={isOutOfStock}
                          aria-label={`Increase cases for ${p.name}`}
                          className="min-w-[40px] min-h-[44px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-r-lg disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(p)}
                        disabled={isOutOfStock}
                        className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 tabular-nums ${
                          isOutOfStock
                            ? 'bg-zinc-200 dark:bg-dark-elevated text-zinc-500 dark:text-zinc-500 border border-zinc-300 dark:border-dark-border cursor-not-allowed'
                            : inCart > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-sm'
                        }`}
                      >
                        {inCart > 0 ? (
                          <>
                            <Check className="w-4 h-4 shrink-0" />
                            <span>{inCart} in Cart (+{getStepperQty(p._id)})</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 shrink-0" />
                            <span>Add Case{getStepperQty(p._id) > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Quick Mobile Sticky Checkout Bar when Cart has Items */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-20 sm:left-auto sm:right-28 z-30 md:hidden">
          <button
            type="button"
            onClick={() => onNavigate('cart')}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-between text-sm font-semibold tabular-nums"
          >
            <span>{itemCount} Case{itemCount > 1 ? 's' : ''} in Cart</span>
            <span className="inline-flex items-center gap-1">
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
