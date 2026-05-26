import { Building2 } from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-2 text-navy">
    <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald text-white">
      <Building2 size={20} />
    </span>
    <span className="text-lg font-black tracking-tight">LuxeEstate</span>
  </div>
);
