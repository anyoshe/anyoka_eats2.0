import config from '../config';

// Base API service for admin app - connects to existing backend
class ApiService {
  constructor() {
    this.baseURL = config.backendUrl;
    this.adminToken = null; // in-memory token only
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // Merge headers, add Authorization if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      ...(options.headers || {})
    };
    const finalOptions = { ...options, headers };
    try {
      const response = await fetch(url, finalOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(identifier, password) {
    const res = await this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    // expects { token, role }
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  setToken(token) {
    this.adminToken = token || null;
  }

  clearToken() {
    this.adminToken = null;
  }

  hasToken() {
    return !!this.adminToken;
  }

  // Orders - try public endpoint first, fallback to authenticated
  async getOrders(params = {}) {
    try {
      // Try public orders endpoint first
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/orders?${queryString}` : '/api/orders';
      return await this.request(endpoint);
    } catch (error) {
      // If public endpoint fails, try the authenticated one
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${config.api.orders}?${queryString}` : config.api.orders;
      return this.request(endpoint);
    }
  }

  async getOrderById(id) {
    return this.request(config.api.orderById(id));
  }

  // Alternative orders endpoint that might be public
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/all-orders?${queryString}` : '/api/all-orders';
    return this.request(endpoint);
  }

  // Users/Customers - use configured admin endpoint
  async getUsers(params = {}) {
    return this.request(config.api.adminUsers, {
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  async getUserById(id) {
    return this.request(config.api.userById(id));
  }

  async suspendUser(userId) {
    return this.request(config.api.suspendUser(userId), {
      method: 'PATCH',
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  // Drivers - use configured admin endpoint
  async getDrivers(params = {}) {
    return this.request(config.api.adminDrivers, {
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  // Partners/Vendors - use configured endpoint
  async getPartners(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${config.api.partners}?${queryString}` : config.api.partners;
    return this.request(endpoint);
  }

  async getPartnerById(id) {
    return this.request(config.api.partnerById(id));
  }

  async disablePartner(partnerId) {
    return this.request(config.api.disablePartner(partnerId), {
      method: 'PATCH',
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  // Drivers (using new admin endpoints)
  async getDrivers(params = {}) {
    return this.request(config.api.adminDrivers, {
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  async getDriverById(id) {
    return this.request(config.api.driverById(id));
  }

  async disableDriver(driverId) {
    return this.request(config.api.disableDriver(driverId), {
      method: 'PATCH',
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${config.api.products}?${queryString}` : config.api.products;
    return this.request(endpoint);
  }

  async getAllProducts() {
    try {
      // Try the configured all-products endpoint first
      return await this.request(config.api.allProducts);
    } catch (error) {
      try {
        // Try the configured products endpoint
        return await this.request(config.api.products);
      } catch (error2) {
        // If both fail, throw the original error
        throw error;
      }
    }
  }

  async getProductsByPartner(partnerId) {
    return this.request(config.api.productsByPartner(partnerId));
  }

  // System/Stats (using new admin endpoint)
  async getStats() {
    return this.request(config.api.adminStats, {
      headers: {
        ...(this.adminToken ? { 'Authorization': `Bearer ${this.adminToken}` } : {}),
      },
    });
  }

  async getSystemHealth() {
    return this.request(config.api.systemHealth);
  }

  // Admin actions (these would need corresponding backend endpoints)
  async updateOrderStatus(orderId, status) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }


  async verifyPartnerKYC(partnerId) {
    return this.request(`/api/partners/${partnerId}/verify-kyc`, {
      method: 'PATCH',
    });
  }

}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
