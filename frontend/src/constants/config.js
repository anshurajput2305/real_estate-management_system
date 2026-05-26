const withApiPath = (url) => {
  const normalized = url.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

export const API_BASE_URL = withApiPath(import.meta.env.VITE_API_URL || '/api');
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000')).replace(/\/+$/, '');

export const roles = {
  customer: 'customer',
  agent: 'agent',
  admin: 'admin'
};

export const navByRole = {
  customer: [
    ['Dashboard', '/customer/dashboard'],
    ['Search', '/customer/properties'],
    ['Wishlist', '/customer/wishlist'],
    ['Compare', '/customer/compare'],
    ['Bookings', '/customer/bookings'],
    ['Payments', '/customer/payments'],
    ['Notifications', '/customer/notifications'],
    ['Chat', '/customer/chat'],
    ['Profile', '/customer/profile']
  ],
  agent: [
    ['Dashboard', '/agent/dashboard'],
    ['Listings', '/agent/listings'],
    ['Bookings', '/agent/bookings'],
    ['Analytics', '/agent/analytics'],
    ['Inbox', '/agent/inbox'],
    ['Profile', '/agent/profile']
  ],
  admin: [
    ['Dashboard', '/admin/dashboard'],
    ['Users', '/admin/users'],
    ['Agents', '/admin/agents'],
    ['Listings', '/admin/listings'],
    ['Reports', '/admin/reports'],
    ['Analytics', '/admin/analytics']
  ]
};
