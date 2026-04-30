/**
 * Shop Agent
 * Handles product browsing and order placement for the NutriSakti mini e-commerce.
 * Products: milk, baby biscuits, diapers, vitamins — delivered to mother's address.
 */

const db = require('../db/database');

// Keyword → category mapping for chat-driven shopping
const CATEGORY_KEYWORDS = {
  milk:    ['susu', 'milk', 'formula', 'asi', 'prenagen', 'sgm', 'dancow'],
  biscuit: ['biskuit', 'biscuit', 'snack', 'mpasi', 'milna', 'promina', 'gerber'],
  diaper:  ['popok', 'diaper', 'pampers', 'merries', 'huggies', 'diapers'],
  vitamin: ['vitamin', 'suplemen', 'supplement', 'asam folat', 'zat besi', 'fe', 'folat'],
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return null;
}

function detectProductId(text) {
  // Match "PRD001" style IDs in the message
  const match = text.match(/PRD\d{3}/i);
  return match ? match[0].toUpperCase() : null;
}

function detectQuantity(text) {
  const match = text.match(/(\d+)\s*(buah|pcs|pack|bungkus|kaleng|botol|kotak)?/i);
  return match ? parseInt(match[1], 10) : 1;
}

const shopAgent = {
  name: 'ShopAgent',

  /**
   * Browse products — returns products filtered by category or search term.
   */
  browseProducts: (query = '') => {
    const category = detectCategory(query);
    const products = db.getProducts(category ? { category } : query ? { search: query } : {});
    return {
      success:  true,
      category: category || 'all',
      products,
      count:    products.length,
    };
  },

  /**
   * Place an order from a chat message.
   * Parses product ID and quantity from the message text.
   */
  placeOrder: (motherId, message, address) => {
    const mother = db.getMother(motherId);
    if (!mother) return { success: false, error: 'Mother not found' };

    const productId = detectProductId(message);
    if (!productId) {
      // No specific product — suggest browsing
      const category = detectCategory(message);
      const products = db.getProducts(category ? { category } : {});
      return {
        success:    false,
        needsSelection: true,
        category:   category || 'all',
        products:   products.slice(0, 6),
        message:    `Silakan pilih produk yang ingin dipesan. Ketik ID produk (contoh: PRD001) dan jumlah untuk memesan.`,
      };
    }

    const product = db.getProduct(productId);
    if (!product) return { success: false, error: `Produk ${productId} tidak ditemukan` };
    if (product.stock < 1) return { success: false, error: `Stok ${product.name} habis` };

    const qty   = Math.min(detectQuantity(message), product.stock, 10); // max 10
    const total = parseFloat((product.price_usdc * qty).toFixed(2));

    // Reduce stock
    product.stock -= qty;

    const deliveryAddress = address || `${mother.village}, ${mother.region}`;
    const order = db.insertOrder({
      mother_id: motherId,
      items:     [{ product_id: productId, qty, price_usdc: product.price_usdc }],
      total_usdc: total,
      address:   deliveryAddress,
      payment:   'usdc',
    });

    db.insertHealthLog({
      id:          'HL' + Date.now(),
      mother_id:   motherId,
      type:        'shop_order',
      description: `Ordered ${qty}x ${product.name} — ${total} USDC`,
      logged_by:   'ShopAgent',
    });

    return {
      success:  true,
      order,
      product,
      qty,
      total,
      message:  `🛍️ Pesanan berhasil!\n📦 ${qty}x ${product.name} (${product.unit})\n💰 Total: ${total} USDC\n🚚 Dikirim ke: ${deliveryAddress}\n⏱️ Estimasi tiba: 3-5 hari kerja`,
    };
  },

  getOrders:   (filters = {}) => db.getOrders(filters),
  getProducts: (filters = {}) => db.getProducts(filters),
};

module.exports = shopAgent;
