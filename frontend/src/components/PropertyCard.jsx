import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';

export const PropertyCard = ({ property, onWishlist }) => (
  <article className="panel overflow-hidden">
    <Link to={`/properties/${property.slug}`}>
      <img
        className="aspect-[4/3] w-full object-cover"
        src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop&q=80'}
        alt={property.title}
      />
    </Link>
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="badge capitalize">{property.listingType}</p>
          <Link to={`/properties/${property.slug}`} className="mt-2 block text-base font-bold text-navy hover:text-emerald">
            {property.title}
          </Link>
        </div>
        {onWishlist && (
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => onWishlist(property._id)} aria-label="Save property">
            <Heart size={17} />
          </button>
        )}
      </div>
      <p className="flex items-center gap-1 text-sm text-slate-500">
        <MapPin size={15} /> {property.city}, {property.state}
      </p>
      <div className="flex items-center justify-between">
        <strong className="text-lg text-navy">{money(property.price)}</strong>
        <span className="flex items-center gap-1 text-sm text-slate-600">
          <Star size={15} className="fill-amber-400 text-amber-400" /> {Number(property.rating || 0).toFixed(1)}
        </span>
      </div>
      <div className="grid grid-cols-3 rounded-md bg-slate-50 p-2 text-center text-xs text-slate-600">
        <span>{property.bedrooms} Beds</span>
        <span>{property.bathrooms} Baths</span>
        <span>{property.squareFeet} sqft</span>
      </div>
    </div>
  </article>
);
