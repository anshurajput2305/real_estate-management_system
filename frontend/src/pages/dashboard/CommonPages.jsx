import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api.js';
import { EmptyState } from '../../components/DataState.jsx';
import { PropertyCard } from '../../components/PropertyCard.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { money, shortDate, statusTone } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';

export const CustomerDashboard = () => {
  const bookings = useQuery({ queryKey: ['bookings'], queryFn: () => endpoints.bookings.list() });
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: endpoints.properties.wishlist });
  return <DashboardGrid title="Customer dashboard" stats={[
    ['Bookings', bookings.data?.meta?.total || bookings.data?.data?.length || 0],
    ['Saved homes', wishlist.data?.data?.properties?.length || 0],
    ['Active role', 'Customer']
  ]} />;
};

export const AgentDashboard = () => {
  const analytics = useQuery({ queryKey: ['agentAnalytics'], queryFn: endpoints.agent.analytics });
  const data = analytics.data?.data || {};
  return <DashboardGrid title="Agent dashboard" stats={[
    ['Listings', data.properties || 0],
    ['Revenue', money(data.revenue || 0)],
    ['Payments', data.payments || 0]
  ]} />;
};

export const AdminDashboard = () => {
  const analytics = useQuery({ queryKey: ['adminAnalytics'], queryFn: endpoints.admin.analytics });
  const data = analytics.data?.data || {};
  return <DashboardGrid title="Admin dashboard" stats={[
    ['Users', data.users || 0],
    ['Active listings', data.activeListings || 0],
    ['Revenue', money(data.revenue || 0)]
  ]} />;
};

const DashboardGrid = ({ title, stats }) => (
  <section>
    <h1 className="mb-5 text-2xl font-black text-navy">{title}</h1>
    <div className="grid gap-4 md:grid-cols-3">{stats.map(([label, value]) => <StatCard key={label} label={label} value={value} />)}</div>
  </section>
);

export const Wishlist = () => {
  const query = useQuery({ queryKey: ['wishlist'], queryFn: endpoints.properties.wishlist });
  const properties = query.data?.data?.properties || [];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Wishlist</h1>{properties.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{properties.map((property) => <PropertyCard key={property._id} property={property} />)}</div> : <EmptyState title="No saved homes" />}</section>;
};

export const Compare = () => {
  const query = useQuery({ queryKey: ['wishlist'], queryFn: endpoints.properties.wishlist });
  const properties = (query.data?.data?.properties || []).slice(0, 3);
  if (!properties.length) return <EmptyState title="Save properties to compare" text="Your first three wishlist items will appear in the comparison table." />;
  const rows = ['price', 'listingType', 'category', 'bedrooms', 'bathrooms', 'squareFeet', 'city', 'rating'];
  return (
    <section>
      <h1 className="mb-5 text-2xl font-black text-navy">Compare properties</h1>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr><th className="p-4">Feature</th>{properties.map((p) => <th className="p-4" key={p._id}>{p.title}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr className="border-t border-slate-100" key={row}><td className="p-4 font-semibold capitalize text-navy">{row}</td>{properties.map((p) => <td className="p-4" key={p._id}>{row === 'price' ? money(p[row]) : p[row]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
};

export const Bookings = ({ mode = 'customer' }) => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['bookings', mode], queryFn: () => endpoints.bookings.list() });
  const pay = useMutation({ mutationFn: endpoints.payments.create, onSuccess: () => { toast.success('Payment complete'); queryClient.invalidateQueries({ queryKey: ['bookings'] }); } });
  const status = useMutation({ mutationFn: ({ id, payload }) => endpoints.bookings.updateStatus(id, payload), onSuccess: () => { toast.success('Booking updated'); queryClient.invalidateQueries({ queryKey: ['bookings'] }); } });
  const rows = data?.data || [];
  return (
    <section>
      <h1 className="mb-5 text-2xl font-black text-navy">Bookings</h1>
      <div className="space-y-3">
        {rows.map((booking) => (
          <div className="panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between" key={booking._id}>
            <div>
              <h3 className="font-bold text-navy">{booking.property?.title}</h3>
              <p className="text-sm text-slate-500">{booking.type.replace('_', ' ')} · {shortDate(booking.visitDate)}</p>
              <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(booking.status)}`}>{booking.status}</span>
            </div>
            <div className="flex gap-2">
              {mode === 'agent' && booking.status === 'pending' && <>
                <button className="btn-primary" onClick={() => status.mutate({ id: booking._id, payload: { status: 'approved' } })}>Approve</button>
                <button className="btn-secondary" onClick={() => status.mutate({ id: booking._id, payload: { status: 'rejected' } })}>Reject</button>
              </>}
              {mode === 'customer' && booking.status === 'payment_pending' && <button className="btn-primary" onClick={() => pay.mutate({ booking: booking._id, method: 'card' })}>Pay now</button>}
            </div>
          </div>
        ))}
        {!rows.length && <EmptyState title="No bookings yet" />}
      </div>
    </section>
  );
};

export const Payments = () => {
  const { data } = useQuery({ queryKey: ['payments'], queryFn: endpoints.payments.list });
  const rows = data?.data || [];
  return <TablePage title="Payments" rows={rows.map((p) => [p.invoiceNumber, p.method, money(p.amount), p.status])} empty="No payments yet" />;
};

export const Notifications = () => {
  const { data, refetch } = useQuery({ queryKey: ['notifications'], queryFn: endpoints.notifications.list });
  const mark = async () => { await endpoints.notifications.read({ ids: (data?.data || []).map((item) => item._id) }); refetch(); };
  return (
    <section>
      <div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-black text-navy">Notifications</h1><button className="btn-secondary" onClick={mark}>Mark read</button></div>
      <div className="space-y-3">{(data?.data || []).map((item) => <div className="panel p-4" key={item._id}><h3 className="font-bold text-navy">{item.title}</h3><p className="text-sm text-slate-500">{item.message}</p></div>)}</div>
    </section>
  );
};

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const save = async (e) => { e.preventDefault(); const response = await endpoints.auth.updateProfile(profile); toast.success(response.message); };
  const changePassword = async (e) => { e.preventDefault(); await endpoints.auth.changePassword(password); setPassword({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); };
  return <section className="grid max-w-4xl gap-5 md:grid-cols-2"><div><h1 className="mb-5 text-2xl font-black text-navy">Profile settings</h1><form className="panel space-y-3 p-5" onSubmit={save}><input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /><input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /><button className="btn-primary">Save profile</button></form></div><div><h2 className="mb-5 text-2xl font-black text-navy">Password</h2><form className="panel space-y-3 p-5" onSubmit={changePassword}><input className="input" type="password" placeholder="Current password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /><input className="input" type="password" placeholder="New password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /><button className="btn-secondary">Change password</button></form></div></section>;
};

export const ChatPage = () => {
  const [active, setActive] = useState(null);
  const [body, setBody] = useState('');
  const chats = useQuery({ queryKey: ['chats'], queryFn: endpoints.chats.list });
  const messages = useQuery({ queryKey: ['messages', active], queryFn: () => endpoints.chats.messages(active), enabled: Boolean(active) });
  const send = async (e) => { e.preventDefault(); if (!body.trim()) return; await endpoints.chats.send(active, { body }); setBody(''); messages.refetch(); };
  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="panel p-3">{(chats.data?.data || []).map((chat) => <button className="block w-full rounded-md p-3 text-left hover:bg-slate-50" key={chat._id} onClick={() => setActive(chat._id)}>{chat.participants?.map((p) => p.name).join(', ')}</button>)}</div>
      <div className="panel flex min-h-[520px] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">{(messages.data?.data || []).map((message) => <div className="rounded-md bg-slate-50 p-3" key={message._id}><strong>{message.sender?.name}</strong><p>{message.body}</p></div>)}</div>
        {active ? <form className="mt-3 flex gap-2" onSubmit={send}><input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" /><button className="btn-primary">Send</button></form> : <EmptyState title="Select a conversation" />}
      </div>
    </section>
  );
};

const TablePage = ({ title, rows, empty }) => (
  <section><h1 className="mb-5 text-2xl font-black text-navy">{title}</h1>{rows.length ? <div className="panel overflow-hidden">{rows.map((row, i) => <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-4" key={i}>{row.map((cell, j) => <span key={j}>{cell}</span>)}</div>)}</div> : <EmptyState title={empty} />}</section>
);
