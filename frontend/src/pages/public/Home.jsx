import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { PropertyCard } from '../../components/PropertyCard.jsx';
import { LoadingGrid } from '../../components/DataState.jsx';

export const Home = () => {
  const { data, isLoading } = useQuery({ queryKey: ['featured'], queryFn: endpoints.properties.featured });
  const properties = data?.data || [];

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <img className="absolute inset-0 h-full w-full object-cover opacity-25" src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop&q=80" alt="" />
        <div className="shell relative grid min-h-[620px] items-center py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="badge bg-white/15 text-emerald">Real Estate Management System</p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">LuxeEstate REMS</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-200">Browse verified properties, manage bookings, coordinate agents, simulate payments, and keep every real estate workflow in one polished dashboard.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/properties">Browse properties <ArrowRight size={18} /></Link>
              <Link className="btn-secondary bg-white/95" to="/signup">Create account</Link>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="shell py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Building2, 'Verified listings', 'Moderated inventory with agent ownership and rich property data.'],
            [ShieldCheck, 'Secure workflows', 'JWT auth, role guards, audit logs, and protected dashboards.'],
            [Sparkles, 'Realtime operations', 'Booking updates, notifications, and chat powered by Socket.io.']
          ].map(([Icon, title, text]) => (
            <div className="panel p-5" key={title}>
              <Icon className="text-emerald" />
              <h3 className="mt-4 font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="shell pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="badge">Featured</p>
            <h2 className="mt-2 text-2xl font-black text-navy">Premium properties</h2>
          </div>
          <Link className="btn-secondary" to="/properties">View all</Link>
        </div>
        {isLoading ? <LoadingGrid /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{properties.slice(0, 6).map((property) => <PropertyCard key={property._id} property={property} />)}</div>}
      </section>
    </>
  );
};
