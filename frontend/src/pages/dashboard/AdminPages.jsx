import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { endpoints } from '../../services/api.js';
import { EmptyState } from '../../components/DataState.jsx';
import { statusTone } from '../../utils/format.js';

export const AdminUsers = ({ role }) => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['users', role], queryFn: () => endpoints.users.list(role ? { role } : {}) });
  const toggle = async (user) => { await endpoints.users.status(user._id, { isActive: !user.isActive }); toast.success('User updated'); queryClient.invalidateQueries({ queryKey: ['users'] }); };
  const rows = data?.data || [];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">{role ? 'Agents' : 'Users'}</h1><div className="space-y-3">{rows.map((user) => <div className="panel flex items-center justify-between p-4" key={user._id}><div><h3 className="font-bold text-navy">{user.name}</h3><p className="text-sm text-slate-500">{user.email} · {user.role}</p></div><button className="btn-secondary" onClick={() => toggle(user)}>{user.isActive ? 'Disable' : 'Enable'}</button></div>)}</div>{!rows.length && <EmptyState title="No users found" />}</section>;
};

export const AdminAgents = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['agentProfiles'], queryFn: endpoints.admin.agents });
  const approve = async (id, status) => { await endpoints.admin.approveAgent(id, { status }); toast.success('Agent verification updated'); queryClient.invalidateQueries({ queryKey: ['agentProfiles'] }); };
  const rows = data?.data || [];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Agent approvals</h1><div className="space-y-3">{rows.map((profile) => <div className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between" key={profile._id}><div><h3 className="font-bold text-navy">{profile.user?.name}</h3><p className="text-sm text-slate-500">{profile.agencyName} · {profile.licenseNumber}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(profile.verificationStatus)}`}>{profile.verificationStatus}</span></div><div className="flex gap-2"><button className="btn-primary" onClick={() => approve(profile._id, 'approved')}>Approve</button><button className="btn-secondary" onClick={() => approve(profile._id, 'rejected')}>Reject</button></div></div>)}</div>{!rows.length && <EmptyState title="No agent profiles" />}</section>;
};

export const AdminListings = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['adminListings'], queryFn: () => endpoints.properties.list({ status: '', limit: 100 }) });
  const moderate = async (id, payload) => { await endpoints.admin.moderate(id, payload); toast.success('Listing moderated'); queryClient.invalidateQueries({ queryKey: ['adminListings'] }); };
  const rows = data?.data || [];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Listings moderation</h1><div className="space-y-3">{rows.map((property) => <div className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between" key={property._id}><div><h3 className="font-bold text-navy">{property.title}</h3><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(property.status)}`}>{property.status}</span></div><div className="flex gap-2"><button className="btn-primary" onClick={() => moderate(property._id, { status: 'active', verified: true })}>Approve</button><button className="btn-secondary" onClick={() => moderate(property._id, { status: 'rejected' })}>Reject</button><button className="btn-secondary" onClick={() => moderate(property._id, { featured: !property.featured })}>Feature</button></div></div>)}</div></section>;
};

export const AdminReports = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['reports'], queryFn: endpoints.admin.reports });
  const update = async (id, status) => { await endpoints.admin.updateReport(id, { status }); toast.success('Report updated'); queryClient.invalidateQueries({ queryKey: ['reports'] }); };
  const rows = data?.data || [];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Reports</h1><div className="space-y-3">{rows.map((report) => <div className="panel p-4" key={report._id}><h3 className="font-bold text-navy">{report.reason}</h3><p className="text-sm text-slate-500">{report.details}</p><div className="mt-3 flex gap-2"><button className="btn-primary" onClick={() => update(report._id, 'resolved')}>Resolve</button><button className="btn-secondary" onClick={() => update(report._id, 'dismissed')}>Dismiss</button></div></div>)}</div></section>;
};

export const AdminAnalytics = () => {
  const { data } = useQuery({ queryKey: ['adminAnalytics'], queryFn: endpoints.admin.analytics });
  const a = data?.data || {};
  const chart = [{ name: 'Users', value: a.users || 0 }, { name: 'Agents', value: a.agents || 0 }, { name: 'Listings', value: a.activeListings || 0 }];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Platform analytics</h1><div className="panel h-80 p-4"><ResponsiveContainer><PieChart><Pie data={chart} dataKey="value" nameKey="name" outerRadius={110}>{chart.map((_, i) => <Cell key={i} fill={['#0b1f3a', '#10b981', '#64748b'][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></section>;
};
