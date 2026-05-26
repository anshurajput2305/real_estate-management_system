import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api.js';
import { EmptyState, LoadingGrid } from '../../components/DataState.jsx';
import { PropertyCard } from '../../components/PropertyCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const Properties = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 12, sort: '-createdAt' });
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['properties', filters], queryFn: () => endpoints.properties.list(filters) });
  const properties = data?.data || [];

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const wishlist = async (id) => {
    if (!user) return toast.error('Login to save properties');
    await endpoints.properties.toggleWishlist(id);
    toast.success('Wishlist updated');
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  };

  return (
    <main className="shell py-8">
      <div className="mb-6">
        <p className="badge">Inventory</p>
        <h1 className="mt-2 text-3xl font-black text-navy">Browse properties</h1>
      </div>
      <div className="panel mb-6 grid gap-3 p-4 md:grid-cols-5">
        <input className="input" placeholder="Search" onChange={(e) => update('q', e.target.value)} />
        <input className="input" placeholder="City" onChange={(e) => update('city', e.target.value)} />
        <select className="input" onChange={(e) => update('listingType', e.target.value)}><option value="">Any type</option><option value="rent">Rent</option><option value="sale">Sale</option></select>
        <select className="input" onChange={(e) => update('category', e.target.value)}><option value="">Any category</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="house">House</option><option value="condo">Condo</option><option value="studio">Studio</option><option value="commercial">Commercial</option></select>
        <select className="input" onChange={(e) => update('sort', e.target.value)}><option value="-createdAt">Newest</option><option value="price">Price low</option><option value="-price">Price high</option><option value="-rating">Top rated</option></select>
      </div>
      {isLoading ? <LoadingGrid /> : properties.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property._id} property={property} onWishlist={wishlist} />)}</div> : <EmptyState title="No properties found" text="Try adjusting the filters or search term." />}
    </main>
  );
};
