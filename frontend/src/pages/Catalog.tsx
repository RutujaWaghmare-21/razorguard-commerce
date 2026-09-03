import React, { useState } from 'react';
import { LayoutGrid, Code2, Package } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { JsonView } from '../components/common/JsonView';
import { useAppStore } from '../store/AppStore';

export const Catalog: React.FC = () => {
  const { catalog } = useAppStore();
  const [view, setView] = useState<'human' | 'agent'>('human');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid size={19} className="text-razor-cyan" />
            Dynamic Catalog
          </h1>
          <p className="text-text-secondary text-[13px] mt-1">
            The same inventory, presented two ways: what your team sees, and what buyer agents discover
            through semantic search.
          </p>
        </div>
        <div className="flex items-center rounded-md border border-border bg-surface p-1">
          <button
            onClick={() => setView('human')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
              view === 'human' ? 'bg-razor-blue text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Package size={13} /> Human Merchant View
          </button>
          <button
            onClick={() => setView('agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
              view === 'agent' ? 'bg-razor-blue text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Code2 size={13} /> AI Agent View (Schema)
          </button>
        </div>
      </div>

      {view === 'human' ? (
        <div className="grid grid-cols-3 gap-4">
          {catalog.map((p) => {
            const marginPct = ((p.listPrice - p.unitCost) / p.listPrice) * 100;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-surface/70 p-5">
                <div className="text-[10px] font-mono-data text-text-tertiary uppercase mb-1">{p.category}</div>
                <h3 className="text-[14px] font-semibold mb-1">{p.name}</h3>
                <div className="text-[11px] font-mono-data text-text-tertiary mb-4">{p.sku}</div>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <div className="text-text-tertiary text-[10px] uppercase">List price</div>
                    <div className="font-mono-data font-semibold">₹{p.listPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary text-[10px] uppercase">Unit cost</div>
                    <div className="font-mono-data">₹{p.unitCost.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary text-[10px] uppercase">Base margin</div>
                    <div className="font-mono-data text-approved">{marginPct.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary text-[10px] uppercase">In stock</div>
                    <div className="font-mono-data">{p.stock.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-[10px] text-text-tertiary uppercase mb-2">Bulk tiers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.bulkTiers.map((t) => (
                      <span
                        key={t.minQty}
                        className="text-[10.5px] font-mono-data px-2 py-0.5 rounded border border-border text-text-secondary"
                      >
                        {t.minQty}+ → {t.discountPct}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {catalog.map((p) => (
            <Panel key={p.id} eyebrow={p.sku} title={p.name}>
              <JsonView
                data={{
                  '@context': 'https://schema.org',
                  '@type': 'Product',
                  sku: p.sku,
                  name: p.name,
                  category: p.category,
                  offers: {
                    '@type': 'Offer',
                    price: p.listPrice,
                    priceCurrency: 'INR',
                    availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    inventoryLevel: p.stock,
                  },
                  negotiation_policy_ref: '/api/v1/policy/discovery',
                  bulk_pricing_tiers: p.bulkTiers.map((t) => ({
                    min_quantity: t.minQty,
                    discount_pct: t.discountPct,
                  })),
                  agentic_commerce: {
                    negotiable: true,
                    max_discount_disclosed: false,
                    settlement: 'razorpay_policy_firewall',
                  },
                }}
              />
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
};
