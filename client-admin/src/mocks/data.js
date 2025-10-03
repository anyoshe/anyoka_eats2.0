export const kpis = {
  ordersToday: 128,
  gmvToday: 'Ksh 64,320',
  activeDrivers: 42,
  onlineVendors: 85,
  avgDeliveryMins: 34,
  failureRatePct: '0.7%'
};

export const orders = Array.from({ length: 24 }).map((_, i) => ({
  id: `ORD-${1000 + i}`,
  created: '2025-10-01 12:3' + (i % 10),
  customer: `Customer ${i+1}`,
  vendor: `Vendor ${i%6+1}`,
  driver: i % 3 === 0 ? 'Unassigned' : `Driver ${i%12+1}`,
  items: (i%5)+1,
  amount: `Ksh ${(i%7+1)*750}.00`,
  status: ['pending','accepted','transit','delivered','cancelled'][i%5],
}));

export const users = Array.from({ length: 16 }).map((_, i) => ({
  id: `USR-${2000 + i}`,
  name: `User ${i+1}`,
  contact: `07${i%10}${i%10}${i%10}-${i%10}${i%10}${i%10}${i%10}`,
  orders: (i%9)+1,
  lastOrder: '2025-09-2' + (i%9),
  status: ['active', 'suspended'][i%4===0?1:0],
}));

export const vendors = Array.from({ length: 12 }).map((_, i) => ({
  id: `VND-${3000 + i}`,
  name: `Vendor ${i+1}`,
  kyc: ['verified','pending'][i%3===0?1:0],
  products: (i%30)+10,
  orders7d: (i%50)+20,
  rating: (3 + (i%3)) + 0.2,
  status: ['active','suspended'][i%5===0?1:0],
}));

export const drivers = Array.from({ length: 12 }).map((_, i) => ({
  id: `DRV-${4000 + i}`,
  name: `Driver ${i+1}`,
  online: i%2===0,
  currentOrder: i%4===0 ? 'None' : `ORD-${1000+i}`,
  completionRate: `${80 + (i%20)}%`,
  rating: (3 + (i%3)) + 0.1,
}));

export const system = {
  latencyMs: 142,
  errorRatePct: '0.3%',
  uptimeDays: 27,
  queueDepth: 12,
  logs: [
    { ts: '12:31', level: 'info', msg: 'Payout batch completed' },
    { ts: '12:22', level: 'warn', msg: 'Order delay spike detected in region A' },
    { ts: '12:18', level: 'info', msg: 'Email provider latency normalized' }
  ]
};





