import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Drop {
   id: string;
   user_name: string;
   item_name: string;
   item_image: string;
   box_name: string;
   value: number;
   created_at: string;
}

export const LiveDrops: React.FC = () => {
   const [drops, setDrops] = useState<Drop[]>([]);
   const [loading, setLoading] = useState(true);
   const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

   const fetchDrops = async () => {
      try {
         const res = await fetch(`${BACKEND_URL}/api/admin/live-drops`);
         if (res.ok) {
            const data = await res.json();
            setDrops(data.drops || []);
         }
      } catch (e) {
         console.error('Live drops fetch error', e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDrops();
      const interval = setInterval(fetchDrops, 15000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="p-4 bg-[#131b2e] border border-white/10 rounded-xl mt-4">
         <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Live Drops
         </h2>
         {loading ? (
            <p className="text-slate-400">Loading…</p>
         ) : (
            <ul className="space-y-3">
               {drops.map(d => (
                  <li key={d.id} className="flex items-center gap-3">
                     <img src={d.item_image} alt={d.item_name} className="w-10 h-10 rounded object-cover" />
                     <div className="flex-1">
                        <p className="text-sm text-white">
                           <span className="font-medium">{d.user_name}</span> just won{' '}
                           <span className="font-medium">{d.item_name}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                           {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </p>
                     </div>
                     <div className="text-sm font-bold text-purple-400">${d.value}</div>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};
