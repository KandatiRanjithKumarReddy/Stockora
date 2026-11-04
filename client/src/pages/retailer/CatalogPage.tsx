import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Minus, Check, Gift, Percent, AlertCircle, ShoppingCart } from 'lucide-react';

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

  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, search, inStockOnly]);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        setBrands(res.data.brands);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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
    } catch (err) {
      console.error('Failed to fetch products:', err);
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
  };

  const getInCartCases = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.orderedCases : 0;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Wholesale FMCG Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.retailer?.storeName
              ? `Authorized pricing for ${user.retailer.storeName}`
              : 'Direct wholesale dealer prices with live case & pack breakdown'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search biscuits, detergent, tea..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase mr-1">
          Category:
        </span>
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-brand-900 dark:bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-900 dark:bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="ml-auto flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading Jabalpur product catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No FMCG products found
          </p>
          <p className="text-xs text-slate-500">Try adjusting your search or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const inCart = getInCartCases(p._id);
            const isOutOfStock = p.stockStatus === 'OUT_OF_STOCK';

            return (
              <div
                key={p._id}
                className="rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs hover:shadow-md transition-shadow duration-150 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image & Stock Badge Header */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-dark-elevated overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Stock Status Pill */}
                    <div className="absolute top-2.5 left-2.5">
                      {p.stockStatus === 'IN_STOCK' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wide backdrop-blur-xs">
                          {p.availableCases} Cases in Stock
                        </span>
                      )}
                      {p.stockStatus === 'LOW_STOCK' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-white text-[10px] font-bold tracking-wide backdrop-blur-xs">
                          Low Stock: {p.availableCases} left
                        </span>
                      )}
                      {p.stockStatus === 'OUT_OF_STOCK' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wide backdrop-blur-xs">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* HSN & GST Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      HSN {p.hsnCode} • {p.gstRatePercent}% GST
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold uppercase tracking-wider">{p.brand}</span>
                        <span>SKU: {p.sku}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pack size: {p.packSize} • {p.unitsPerCase} packs per case
                      </p>
                    </div>

                    {/* Scheme Highlight Pill */}
                    {p.activeScheme && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                        {p.activeScheme.schemeType === 'BUY_X_GET_Y_FREE' ? (
                          <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Percent className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate">{p.activeScheme.name}</span>
                      </div>
                    )}

                    {/* Pricing Box (Pack-to-Case Transparency) */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-elevated border border-slate-100 dark:border-dark-border flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          Case Price (Billed)
                        </div>
                        <div className="text-base font-extrabold text-brand-900 dark:text-blue-400">
                          ₹{p.calculatedCasePrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          Dealer / Pack
                        </div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          ₹{p.dealerPricePerPack.toFixed(2)}
                          <span className="text-[10px] text-slate-400 line-through ml-1">
                            MRP ₹{p.mrp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions (Stepper + Add to Cart) */}
                <div className="p-4 pt-0">
                  <div className="flex items-center space-x-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 dark:border-dark-border rounded-xl bg-slate-50 dark:bg-dark-elevated">
                      <button
                        type="button"
                        onClick={() => handleStep(p._id, -1)}
                        disabled={isOutOfStock}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {getStepperQty(p._id)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStep(p._id, 1)}
                        disabled={isOutOfStock}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        isOutOfStock
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : inCart > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white shadow-xs'
                      }`}
                    >
                      {inCart > 0 ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{inCart} in Cart (+{getStepperQty(p._id)})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add Case(s)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

