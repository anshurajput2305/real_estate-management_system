import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { endpoints } from '../../services/api.js';
import { EmptyState } from '../../components/DataState.jsx';
import { PropertyCard } from '../../components/PropertyCard.jsx';
import { money } from '../../utils/format.js';

export const AgentListings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultProperty);
  const [assetForm, setAssetForm] = useState({ propertyId: '', files: null, caption: '' });
  const properties = useQuery({ queryKey: ['agentListings'], queryFn: () => endpoints.properties.list({ mine: true, status: '' }) });
  const create = useMutation({ mutationFn: endpoints.properties.create, onSuccess: () => { toast.success('Listing submitted'); queryClient.invalidateQueries({ queryKey: ['agentListings'] }); } });
  const uploadAssets = useMutation({
    mutationFn: ({ propertyId, formData }) => endpoints.properties.uploadAssets(propertyId, formData),
    onSuccess: () => {
      toast.success('Images uploaded');
      setAssetForm({ propertyId: '', files: null, caption: '' });
      queryClient.invalidateQueries({ queryKey: ['agentListings'] });
    }
  });

  const submitAssets = (event) => {
    event.preventDefault();
    if (!assetForm.propertyId || !assetForm.files?.length) return toast.error('Choose a listing and at least one file');
    const formData = new FormData();
    Array.from(assetForm.files).forEach((file) => formData.append('assets', file));
    if (assetForm.caption) formData.append('caption', assetForm.caption);
    uploadAssets.mutate({ propertyId: assetForm.propertyId, formData });
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="space-y-5">
        <form className="panel space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); create.mutate({ ...form, amenities: form.amenities.split(',').map((item) => item.trim()) }); }}>
          <h1 className="text-xl font-black text-navy">Create listing</h1>
          {['title', 'description', 'price', 'bedrooms', 'bathrooms', 'squareFeet', 'address', 'city', 'state', 'zipCode'].map((key) => <input className="input" key={key} placeholder={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
          <select className="input" value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}><option value="rent">Rent</option><option value="sale">Sale</option></select>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="house">House</option><option value="condo">Condo</option><option value="studio">Studio</option><option value="commercial">Commercial</option><option value="land">Land</option></select>
          <input className="input" placeholder="Amenities comma separated" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          <button className="btn-primary w-full" disabled={create.isPending}>Create listing</button>
        </form>
        <form className="panel space-y-3 p-5" onSubmit={submitAssets}>
          <h2 className="text-xl font-black text-navy">Upload listing images</h2>
          <select className="input" value={assetForm.propertyId} onChange={(e) => setAssetForm({ ...assetForm, propertyId: e.target.value })}>
            <option value="">Choose listing</option>
            {(properties.data?.data || []).map((property) => <option key={property._id} value={property._id}>{property.title}</option>)}
          </select>
          <input className="input" placeholder="Caption" value={assetForm.caption} onChange={(e) => setAssetForm({ ...assetForm, caption: e.target.value })} />
          <input className="input py-2" type="file" accept="image/*,application/pdf" multiple onChange={(e) => setAssetForm({ ...assetForm, files: e.target.files })} />
          <button className="btn-secondary w-full" disabled={uploadAssets.isPending}>Upload files</button>
        </form>
      </div>
      <div>{(properties.data?.data || []).length ? <div className="grid gap-5 md:grid-cols-2">{properties.data.data.map((property) => <PropertyCard key={property._id} property={property} />)}</div> : <EmptyState title="No listings" />}</div>
    </section>
  );
};

export const AgentAnalytics = () => {
  const { data } = useQuery({ queryKey: ['agentAnalytics'], queryFn: endpoints.agent.analytics });
  const a = data?.data || {};
  const chart = [{ name: 'Listings', value: a.properties || 0 }, { name: 'Payments', value: a.payments || 0 }, { name: 'Revenue', value: Math.round((a.revenue || 0) / 1000) }];
  return <section><h1 className="mb-5 text-2xl font-black text-navy">Analytics</h1><div className="panel h-80 p-4"><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v, n) => n === 'Revenue' ? money(v * 1000) : v} /><Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></section>;
};

export const AgentProfile = () => {
  const { data, refetch } = useQuery({ queryKey: ['agentProfile'], queryFn: endpoints.agent.me });
  const [form, setForm] = useState({ agencyName: '', licenseNumber: '', bio: '', yearsExperience: 1, serviceAreas: '' });
  const save = async (e) => { e.preventDefault(); await endpoints.agent.save({ ...form, serviceAreas: form.serviceAreas.split(',').map((x) => x.trim()), specializations: ['sales', 'rentals'] }); toast.success('Profile saved'); refetch(); };
  const profile = data?.data;
  return <section className="max-w-2xl"><h1 className="mb-5 text-2xl font-black text-navy">Agent profile</h1>{profile && <p className="mb-4 badge">{profile.verificationStatus}</p>}<form className="panel space-y-3 p-5" onSubmit={save}><input className="input" placeholder="Agency name" value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })} /><input className="input" placeholder="License number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /><textarea className="textarea" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /><input className="input" placeholder="Service areas" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} /><button className="btn-primary">Save verification request</button></form></section>;
};

const defaultProperty = {
  title: '',
  description: 'A polished property with strong location value and professional management.',
  price: 2500,
  listingType: 'rent',
  category: 'apartment',
  bedrooms: 2,
  bathrooms: 2,
  squareFeet: 1200,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  amenities: 'Pool, Parking, Security'
};
