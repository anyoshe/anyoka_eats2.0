// Admin app configuration - connects to existing backend
const config = {
  // Backend URL - adjust this to match your online_hotel server
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
  
  // API endpoints (using actual backend routes from routes.js)
  api: {
    // Orders
    orders: '/api/orders/my-orders', // This exists but requires auth
    orderById: (id) => `/api/orders/${id}`,
    
    // Admin Users endpoint (NEW - real data)
    adminUsers: '/api/admin/users',
    suspendUser: (userId) => `/api/admin/users/${userId}/disable`,
    
    // Admin Drivers endpoint (NEW - real data)  
    adminDrivers: '/api/admin/drivers',
    disableDriver: (driverId) => `/api/admin/drivers/${driverId}/disable`,
    
    // Partners/Vendors
    partners: '/api/partners',
    disablePartner: (partnerId) => `/api/admin/partners/${partnerId}/disable`,
    partnerById: (id) => `/api/partners/${id}`,
    partnerOrders: (partnerId) => `/api/partners/${partnerId}/orders`,
    
    // Products
    products: '/api/products',
    allProducts: '/api/all-products',
    productsByPartner: (partnerId) => `/api/products-by-partner/${partnerId}`,
    productById: (id) => `/api/products/${id}`,
    
    // Admin Stats (NEW - real data)
    adminStats: '/api/admin/stats',
  }
};

export default config;
