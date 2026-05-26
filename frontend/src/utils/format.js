export const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

export const shortDate = (value) => (value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'Not set');

export const statusTone = (status) => {
  if (['active', 'approved', 'confirmed', 'paid', 'resolved'].includes(status)) return 'bg-emerald/10 text-emerald';
  if (['pending', 'payment_pending', 'reviewing'].includes(status)) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};
