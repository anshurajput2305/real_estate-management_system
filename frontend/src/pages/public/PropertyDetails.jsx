import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api.js';
import { money } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';

export const PropertyDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState({ type: 'visit', visitDate: '', message: '' });
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { data, isLoading, refetch } = useQuery({ queryKey: ['property', slug], queryFn: () => endpoints.properties.detail(slug) });
  const property = data?.data?.property;
  const reviews = data?.data?.reviews || [];
  const bookMutation = useMutation({ mutationFn: endpoints.bookings.create, onSuccess: () => toast.success('Booking submitted') });
  const reviewMutation = useMutation({ mutationFn: endpoints.reviews.create, onSuccess: () => { toast.success('Review published'); refetch(); } });
  const report = async () => {
    await endpoints.users.report({ targetType: 'property', target: property._id, reason: 'Listing review requested', details: 'Customer requested admin review from the property details page.' });
    toast.success('Report submitted');
  };

  if (isLoading) return <main className="shell py-8"><div className="skeleton h-96 w-full" /></main>;
  if (!property) return <main className="shell py-8">Property not found</main>;

  return (
    <main className="shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <section>
          <img className="aspect-[16/9] w-full rounded-lg object-cover" src={property.images?.[0]?.url} alt={property.title} />
          <div className="mt-6">
            <p className="badge capitalize">{property.listingType}</p>
            <h1 className="mt-3 text-3xl font-black text-navy">{property.title}</h1>
            <p className="mt-2 text-slate-500">{property.address}, {property.city}, {property.state}</p>
            <p className="mt-5 text-slate-600">{property.description}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {['bedrooms', 'bathrooms', 'squareFeet', 'rating'].map((key) => <div className="panel p-4" key={key}><p className="text-xs uppercase text-slate-400">{key}</p><p className="mt-1 font-bold text-navy">{property[key]}</p></div>)}
          </div>
          <section className="mt-8">
            <h2 className="text-xl font-black text-navy">Reviews</h2>
            <div className="mt-4 space-y-3">{reviews.map((item) => <div className="panel p-4" key={item._id}><strong>{item.user?.name}</strong><p className="text-sm text-slate-500">{item.rating}/5</p><p className="mt-2">{item.comment}</p></div>)}</div>
          </section>
        </section>
        <aside className="space-y-4">
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Price</p>
            <p className="text-3xl font-black text-navy">{money(property.price)}</p>
            <p className="mt-2 text-sm text-slate-500">Agent: {property.agent?.name}</p>
            {user && <button className="btn-secondary mt-4 w-full" onClick={report}>Report listing</button>}
          </div>
          {user?.role === 'customer' && (
            <>
              <form className="panel space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); bookMutation.mutate({ ...booking, property: property._id }); }}>
                <h2 className="font-bold text-navy">Request booking</h2>
                <select className="input" value={booking.type} onChange={(e) => setBooking({ ...booking, type: e.target.value })}><option value="visit">Visit</option><option value="rent_request">Rent request</option><option value="buy_request">Buy request</option></select>
                <input className="input" type="datetime-local" value={booking.visitDate} onChange={(e) => setBooking({ ...booking, visitDate: e.target.value })} />
                <textarea className="textarea" placeholder="Message" value={booking.message} onChange={(e) => setBooking({ ...booking, message: e.target.value })} />
                <button className="btn-primary w-full" disabled={bookMutation.isPending}>Submit request</button>
              </form>
              <form className="panel space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate({ ...review, property: property._id }); }}>
                <h2 className="font-bold text-navy">Add review</h2>
                <input className="input" type="number" min="1" max="5" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })} />
                <textarea className="textarea" placeholder="Review" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
                <button className="btn-secondary w-full" disabled={reviewMutation.isPending}>Publish review</button>
              </form>
            </>
          )}
        </aside>
      </div>
    </main>
  );
};
