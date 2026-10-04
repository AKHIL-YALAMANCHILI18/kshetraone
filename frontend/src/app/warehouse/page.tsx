'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Warehouse as WarehouseIcon, 
  Plus, 
  ChevronRight, 
  MapPin,
  Package,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  X,
  FileText
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { InventoryItem, StockMovement } from '@/types';

export default function WarehousePage() {
  const { 
    inventory, 
    warehouses, 
    movements, 
    addInventoryStock, 
    adjustInventoryStock, 
    showToast 
  } = useFarmer();

  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');

  // Modals
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<InventoryItem | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Form states: Add Stock
  const [commodityName, setCommodityName] = useState('Maize');
  const [variety, setVariety] = useState('Kaveri 50');
  const [quantity, setQuantity] = useState('15');
  const [unit, setUnit] = useState<'Quintal' | 'Kg' | 'Tonne'>('Quintal');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'wh-1');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceType, setSourceType] = useState<InventoryItem['sourceType']>('Harvest');
  const [grade, setGrade] = useState<InventoryItem['grade']>('B - Fair Avg Quality');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Form states: Adjust Stock (In/Out)
  const [adjustAmount, setAdjustAmount] = useState('2');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('OUT');
  const [adjustReason, setAdjustReason] = useState<StockMovement['reason']>('Sold to Market');
  const [adjustError, setAdjustError] = useState('');

  const commodityEmojis: Record<string, string> = {
    Maize: '🌽',
    Paddy: '🌾',
    Groundnut: '🥜',
    Tomato: '🍅',
    Chilli: '🌶️',
    Wheat: '🌾',
    Cotton: '🌱',
    Onion: '🧅',
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFormError('Please enter a valid positive quantity.');
      return;
    }

    // Normalized to quintals
    let qtyInQuintals = qtyNum;
    if (unit === 'Kg') qtyInQuintals = qtyNum / 100;
    if (unit === 'Tonne') qtyInQuintals = qtyNum * 10;

    addInventoryStock({
      warehouseId,
      commodityName: commodityName.trim(),
      variety: variety.trim() || 'Hybrid',
      quantityQuintals: qtyInQuintals,
      bagsCount: Math.ceil(qtyInQuintals * 2),
      grade,
      entryDate,
      sourceType,
    }, 'Harvest Added');

    setShowAddStockModal(false);
    setQuantity('');
    setNotes('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError('');

    if (!selectedItemForDetails) return;

    const delta = parseFloat(adjustAmount);
    if (isNaN(delta) || delta <= 0) {
      setAdjustError('Please specify a positive quantity.');
      return;
    }

    if (adjustType === 'OUT' && delta > selectedItemForDetails.quantityQuintals) {
      setAdjustError(`Cannot withdraw ${delta} Qtl. Current stock is ${selectedItemForDetails.quantityQuintals} Qtl.`);
      return;
    }

    const appliedDelta = adjustType === 'OUT' ? -delta : delta;
    adjustInventoryStock(selectedItemForDetails.id, appliedDelta, adjustReason);

    // Refresh selected item
    setSelectedItemForDetails(prev => prev ? {
      ...prev,
      quantityQuintals: Math.max(0, prev.quantityQuintals + appliedDelta),
      bagsCount: Math.max(0, Math.ceil((prev.quantityQuintals + appliedDelta) * 2))
    } : null);

    setShowAdjustModal(false);
    setAdjustAmount('2');
  };

  const totalStoredQuintals = inventory.reduce((sum, item) => sum + item.quantityQuintals, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black">Warehouse &amp; Godown</h1>
        </div>

        <button 
          onClick={() => {
            setFormError('');
            setShowAddStockModal(true);
          }}
          className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stock</span>
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="p-3.5 space-y-3.5">
        
        {/* SUB-TABS (Stock, Movement History) */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs font-bold">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'stock' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Stored Stock ({inventory.length})
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'movements' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Stock Movement History ({movements.length})
          </button>
        </div>

        {/* ================= TAB 1: STORED STOCK ================= */}
        {activeTab === 'stock' && (
          <div className="space-y-3.5">
            
            {/* Total Stored Overview Card */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex justify-between items-center">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Stored Produce</p>
                <h2 className="text-2xl font-black text-stone-900 mt-0.5">{totalStoredQuintals} Quintals</h2>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Across {warehouses.length} Storage Facilities
                </p>
              </div>
              <button 
                onClick={() => {
                  setFormError('');
                  setShowAddStockModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-2xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Stock Entry</span>
              </button>
            </div>

            {/* Inventory Commodity Cards */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span>Commodities in Storage</span>
                <span className="text-[10px] text-stone-400">Tap card for details</span>
              </div>

              {inventory.map((item) => {
                const wh = warehouses.find(w => w.id === item.warehouseId);
                const emoji = commodityEmojis[item.commodityName] || '🌾';
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItemForDetails(item)}
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-emerald-400 active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                        {emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-stone-900">{item.commodityName}</h3>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Grade {item.grade}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-semibold mt-0.5">
                          {item.quantityQuintals} Quintals • ~{item.bagsCount} Bags
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {wh ? wh.name : 'Farm Godown'} • Added: {item.entryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-emerald-700">View</span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Storage Facility Capacities */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Storage Facilities Capacity</h3>
              
              <div className="space-y-2">
                {warehouses.map((wh) => {
                  const usedPct = Math.min(100, Math.round((wh.usedCapacityQuintals / wh.totalCapacityQuintals) * 100));
                  return (
                    <div key={wh.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-800 font-bold">{wh.name}</span>
                        <span className="font-black text-emerald-800">{wh.usedCapacityQuintals} / {wh.totalCapacityQuintals} Qtl</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${usedPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Trigger to Marketplace */}
            <Link 
              href="/market"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Post Stored Produce to Marketplace</span>
            </Link>
          </div>
        )}

        {/* ================= TAB 2: MOVEMENT HISTORY ================= */}
        {activeTab === 'movements' && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
              <span>All Stock In / Out Events</span>
              <span className="text-[10px] text-stone-400">{movements.length} Records</span>
            </div>

            {movements.map((mov) => {
              const matchedItem = inventory.find(i => i.id === mov.inventoryItemId);
              const isEntry = mov.movementType === 'IN';
              return (
                <div key={mov.id} className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isEntry ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                      {isEntry ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">
                        {matchedItem ? matchedItem.commodityName : 'Produce'} — {mov.reason}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Date: {mov.date} • {mov.notes || (isEntry ? 'Harvest addition' : 'Dispatched')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-black text-sm ${isEntry ? 'text-emerald-700' : 'text-stone-800'}`}>
                    {isEntry ? '+' : '-'}{mov.quantityQuintals} Qtl
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================= MODAL: INVENTORY VIEW DETAILS ================= */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-base text-stone-900">Inventory Batch Details</h2>
              <button onClick={() => setSelectedItemForDetails(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-3xl block mb-1">
                {commodityEmojis[selectedItemForDetails.commodityName] || '🌾'}
              </span>
              <h3 className="font-black text-lg text-stone-900">{selectedItemForDetails.commodityName}</h3>
              <p className="text-xs text-stone-600">Variety: {selectedItemForDetails.variety}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-amber-300 font-black text-sm text-stone-900">
                <span>{selectedItemForDetails.quantityQuintals} Quintals</span>
                <span className="text-xs text-stone-400 font-normal">({selectedItemForDetails.bagsCount} Bags)</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Quality Grade:</span>
                <span className="font-bold text-stone-900">Grade {selectedItemForDetails.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Storage Location:</span>
                <span className="font-bold text-stone-900">
                  {warehouses.find(w => w.id === selectedItemForDetails.warehouseId)?.name || 'Farm Godown'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Entry Date:</span>
                <span className="font-bold text-stone-900">{selectedItemForDetails.entryDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Batch Source:</span>
                <span className="font-bold text-emerald-800">{selectedItemForDetails.sourceType}</span>
              </div>
            </div>

            {/* Movement History for this specific item */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Batch Movement Log</h4>
              {movements.filter(m => m.inventoryItemId === selectedItemForDetails.id).map(m => (
                <div key={m.id} className="p-2 bg-stone-50 rounded-lg border border-stone-100 flex justify-between items-center text-[11px]">
                  <span>{m.date} • {m.reason}</span>
                  <span className={`font-bold ${m.movementType === 'IN' ? 'text-emerald-700' : 'text-stone-800'}`}>
                    {m.movementType === 'IN' ? '+' : '-'}{m.quantityQuintals} Qtl
                  </span>
                </div>
              ))}
            </div>

            {/* Stock Movement Trigger (In/Out) */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('OUT');
                  setAdjustReason('Sold to Market');
                  setShowAdjustModal(true);
                }}
                className="flex-1 h-11 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs"
              >
                - Dispatch Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('IN');
                  setAdjustReason('Harvest Added');
                  setShowAdjustModal(true);
                }}
                className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
              >
                + Add More Qtl
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW STOCK ================= */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">Add Stock to Warehouse</h2>
              <button onClick={() => setShowAddStockModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Commodity / Crop *</label>
                <select
                  value={commodityName}
                  onChange={(e) => setCommodityName(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Paddy">Paddy (Rice)</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Onion">Onion</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Variety</label>
                <input
                  type="text"
                  placeholder="e.g. Kaveri 50 / Hybrid"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    placeholder="e.g. 15"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-base font-black text-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full h-11 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Quintal">Quintals (100 kg)</option>
                    <option value="Kg">Kilograms (Kg)</option>
                    <option value="Tonne">Tonnes (1000 kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Storage Facility *</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} (Cap: {wh.totalCapacityQuintals} Qtl)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full h-10 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="A - Grade 1">Grade A (Premium)</option>
                    <option value="B - Fair Avg Quality">Grade B (FAQ)</option>
                    <option value="C - Grade 2">Grade C (Commercial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Source</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full h-10 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Harvest">Farm Harvest</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Entry Date *</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                >
                  Save Stock Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST / DISPATCH STOCK ================= */}
      {showAdjustModal && selectedItemForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-base text-stone-900">
                {adjustType === 'OUT' ? 'Dispatch / Withdraw Stock' : 'Add Stock Quantity'}
              </h2>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity in Quintals *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-base font-black text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reason / Purpose</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  {adjustType === 'OUT' ? (
                    <>
                      <option value="Sold to Market">Sold to Market / Buyer</option>
                      <option value="Dispatched to Warehouse">Internal Movement</option>
                      <option value="Damaged / Spoiled">Spoilage / Loss</option>
                    </>
                  ) : (
                    <>
                      <option value="Harvest Added">Harvest Entry</option>
                      <option value="Stock Added">General Stock In</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-11 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all text-white ${
                    adjustType === 'OUT' ? 'bg-stone-800 hover:bg-stone-900' : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
