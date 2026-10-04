'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  TrendingUp, 
  ChevronRight, 
  Filter,
  Users,
  CheckCircle2,
  Phone,
  Building2,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { BuyerRequirement } from '@/types';

export default function MarketPage() {
  const { mandiRates, buyerRequirements, profile, showToast } = useFarmer();
  const [activeTab, setActiveTab] = useState<'prices' | 'buyers'>('prices');

  // Multi-crop selection state
  const [selectedCrop, setSelectedCrop] = useState<string>('Maize');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('all');

  // Buyer Discovery Flow States
  const [showFindBuyersModal, setShowFindBuyersModal] = useState(false);
  const [discoveryCrop, setDiscoveryCrop] = useState('Maize');
  const [discoveryQuantity, setDiscoveryQuantity] = useState('20');
  const [discoveryDistrict, setDiscoveryDistrict] = useState(profile.location.district || 'Mandya');
  const [expressedInterestBuyerId, setExpressedInterestBuyerId] = useState<string | null>(null);

  // Available crop catalogue for mandi rates
  const cropList = [
    { name: 'Maize', emoji: '🌽', desc: 'Corn / Grain' },
    { name: 'Tomato', emoji: '🍅', desc: 'Vegetable / Hybrid' },
    { name: 'Paddy', emoji: '🌾', desc: 'Sona Masoori / Medium' },
    { name: 'Chilli', emoji: '🌶️', desc: 'Dry / Byadgi' },
    { name: 'Onion', emoji: '🧅', desc: 'Red Onion' },
    { name: 'Groundnut', emoji: '🥜', desc: 'Pod / Kernels' },
    { name: 'Cotton', emoji: '🌱', desc: 'Medium Staple' },
    { name: 'Ragi', emoji: '🌾', desc: 'Finger Millet' },
  ];

  // Verified demo APMC mandi prices database with transparent data labeling
  const comprehensiveMandiData: Record<string, Array<{
    mandi: string;
    district: string;
    state: string;
    distanceKm: number;
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    unit: string;
    arrivalsTonnes: number;
    trend: string;
    updatedDate: string;
    source: string;
  }>> = {
    Maize: [
      { mandi: 'Ballari APMC Main Yard', district: 'Ballari', state: 'Karnataka', distanceKm: 4, modalPrice: 2280, minPrice: 2150, maxPrice: 2360, unit: '₹ / Quintal', arrivalsTonnes: 45, trend: '+3.2%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Davangere Grain Market', district: 'Davangere', state: 'Karnataka', distanceKm: 65, modalPrice: 2340, minPrice: 2200, maxPrice: 2420, unit: '₹ / Quintal', arrivalsTonnes: 120, trend: '+4.5%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Hosapete Sub-Yard', district: 'Vijayanagara', state: 'Karnataka', distanceKm: 18, modalPrice: 2250, minPrice: 2100, maxPrice: 2310, unit: '₹ / Quintal', arrivalsTonnes: 28, trend: '+1.5%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Tomato: [
      { mandi: 'Ballari APMC Vegetable Yard', district: 'Ballari', state: 'Karnataka', distanceKm: 4, modalPrice: 18, minPrice: 14, maxPrice: 22, unit: '₹ / kg (₹1800/Q)', arrivalsTonnes: 85, trend: '+5.0%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Sandur Vegetable Market', district: 'Ballari', state: 'Karnataka', distanceKm: 14, modalPrice: 16, minPrice: 13, maxPrice: 19, unit: '₹ / kg (₹1600/Q)', arrivalsTonnes: 22, trend: '-2.0%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Kolar APMC Mandi', district: 'Kolar', state: 'Karnataka', distanceKm: 210, modalPrice: 24, minPrice: 20, maxPrice: 28, unit: '₹ / kg (₹2400/Q)', arrivalsTonnes: 340, trend: '+8.2%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Paddy: [
      { mandi: 'Gangavathi APMC', district: 'Koppal', state: 'Karnataka', distanceKm: 48, modalPrice: 2650, minPrice: 2480, maxPrice: 2780, unit: '₹ / Quintal', arrivalsTonnes: 180, trend: '+2.1%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Mandya APMC Market', district: 'Mandya', state: 'Karnataka', distanceKm: 280, modalPrice: 2480, minPrice: 2350, maxPrice: 2650, unit: '₹ / Quintal', arrivalsTonnes: 65, trend: '+1.2%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Raichur Grain Market', district: 'Raichur', state: 'Karnataka', distanceKm: 85, modalPrice: 2610, minPrice: 2440, maxPrice: 2720, unit: '₹ / Quintal', arrivalsTonnes: 140, trend: '+0.8%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Chilli: [
      { mandi: 'Byadgi APMC (Red Chilli)', district: 'Haveri', state: 'Karnataka', distanceKm: 130, modalPrice: 16800, minPrice: 14500, maxPrice: 19200, unit: '₹ / Quintal', arrivalsTonnes: 510, trend: '+6.4%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Ballari APMC', district: 'Ballari', state: 'Karnataka', distanceKm: 4, modalPrice: 15400, minPrice: 13800, maxPrice: 17200, unit: '₹ / Quintal', arrivalsTonnes: 45, trend: '+2.5%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Onion: [
      { mandi: 'Chitradurga APMC', district: 'Chitradurga', state: 'Karnataka', distanceKm: 78, modalPrice: 2100, minPrice: 1850, maxPrice: 2350, unit: '₹ / Quintal', arrivalsTonnes: 140, trend: '+3.5%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Ballari Local Mandi', district: 'Ballari', state: 'Karnataka', distanceKm: 5, modalPrice: 2050, minPrice: 1800, maxPrice: 2280, unit: '₹ / Quintal', arrivalsTonnes: 32, trend: '-1.0%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Groundnut: [
      { mandi: 'Ballari APMC Yard', district: 'Ballari', state: 'Karnataka', distanceKm: 4, modalPrice: 6450, minPrice: 6100, maxPrice: 6750, unit: '₹ / Quintal', arrivalsTonnes: 38, trend: '+1.8%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Challakere Oilseed Market', district: 'Chitradurga', state: 'Karnataka', distanceKm: 62, modalPrice: 6620, minPrice: 6250, maxPrice: 6900, unit: '₹ / Quintal', arrivalsTonnes: 95, trend: '+4.0%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Cotton: [
      { mandi: 'Raichur Cotton Market', district: 'Raichur', state: 'Karnataka', distanceKm: 85, modalPrice: 7150, minPrice: 6850, maxPrice: 7420, unit: '₹ / Quintal', arrivalsTonnes: 110, trend: '+2.2%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Ballari CCI Purchase Center', district: 'Ballari', state: 'Karnataka', distanceKm: 6, modalPrice: 7080, minPrice: 6900, maxPrice: 7250, unit: '₹ / Quintal', arrivalsTonnes: 75, trend: '+1.1%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ],
    Ragi: [
      { mandi: 'Mandya APMC Market', district: 'Mandya', state: 'Karnataka', distanceKm: 280, modalPrice: 3850, minPrice: 3600, maxPrice: 4100, unit: '₹ / Quintal', arrivalsTonnes: 18, trend: '+1.5%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
      { mandi: 'Mysuru Bandipalya', district: 'Mysuru', state: 'Karnataka', distanceKm: 310, modalPrice: 3900, minPrice: 3700, maxPrice: 4150, unit: '₹ / Quintal', arrivalsTonnes: 25, trend: '+2.0%', updatedDate: '03 Oct 2026', source: 'Sample APMC Feed' },
    ]
  };

  // Demo Buyer Directory matching discovery filters
  const mockBuyersList = [
    {
      id: 'buyer-1',
      name: 'Vijayanagara Maize Processors Ltd.',
      type: 'Industrial Feed & Starch Mill',
      commodity: 'Maize',
      district: 'Vijayanagara',
      minQty: 10,
      maxQty: 100,
      offeredPrice: 2350,
      contactPerson: 'Mr. Siddappa (Procurement Manager)',
      phone: '+91 94801 88234',
      status: 'Verified Buyer',
    },
    {
      id: 'buyer-2',
      name: 'Ballari Agro Farmers Producer Co. (FPO)',
      type: 'FPO Collective Aggregator',
      commodity: 'Maize',
      district: 'Ballari',
      minQty: 5,
      maxQty: 250,
      offeredPrice: 2320,
      contactPerson: 'K. Venkatesh (CEO)',
      phone: '+91 98450 77123',
      status: 'FPO Direct Partner',
    },
    {
      id: 'buyer-3',
      name: 'FreshHarvest South Tomato Traders',
      type: 'Wholesale Mandi Commission Agent',
      commodity: 'Tomato',
      district: 'Ballari',
      minQty: 2,
      maxQty: 50,
      offeredPrice: 1900,
      contactPerson: 'Irfan Pasha (Trader)',
      phone: '+91 99002 44119',
      status: 'Verified Mandi Agent',
    },
    {
      id: 'buyer-4',
      name: 'Tungabhadra Rice Mills & Export',
      type: 'Commercial Rice Mill',
      commodity: 'Paddy',
      district: 'Koppal',
      minQty: 20,
      maxQty: 500,
      offeredPrice: 2680,
      contactPerson: 'R. Narayana (Owner)',
      phone: '+91 94481 33201',
      status: 'Verified Mill',
    },
    {
      id: 'buyer-5',
      name: 'Karnataka Oilseeds Federation',
      type: 'Government Allied Cooperative',
      commodity: 'Groundnut',
      district: 'Chitradurga',
      minQty: 5,
      maxQty: 150,
      offeredPrice: 6550,
      contactPerson: 'District Procurement Office',
      phone: '+91 83922 41100',
      status: 'Cooperative Dept',
    }
  ];

  const currentMandiRates = comprehensiveMandiData[selectedCrop] || comprehensiveMandiData['Maize'];

  const matchedBuyers = mockBuyersList.filter(b => 
    b.commodity.toLowerCase() === discoveryCrop.toLowerCase()
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black">Smart Marketplace</h1>
        </div>

        <button 
          onClick={() => {
            setDiscoveryCrop(selectedCrop);
            setShowFindBuyersModal(true);
          }}
          className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Find Buyers</span>
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="p-3.5 space-y-3.5">
        
        {/* SUB-TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs font-bold">
          <button 
            onClick={() => setActiveTab('prices')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'prices' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Mandi Prices
          </button>
          <button 
            onClick={() => setActiveTab('buyers')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'buyers' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Buyers &amp; Requirements ({mockBuyersList.length})
          </button>
        </div>

        {/* ================= TAB 1: MANDI PRICES WITH MULTI-CROP SELECTOR ================= */}
        {activeTab === 'prices' && (
          <div className="space-y-3">
            
            {/* MULTI-CROP DROPDOWN & SELECTOR */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-500 uppercase tracking-wider">Choose Commodity</span>
                <span className="text-[10px] text-stone-400">8 Supported Crops</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="flex-1 h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold text-stone-900"
                >
                  {cropList.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.emoji} {c.name} — {c.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Pill Horizontal Scroll */}
              <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5">
                {cropList.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCrop(c.name)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCrop === c.name
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{c.emoji} {c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TRANSPARENCY NOTICE */}
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Sample Agmarknet APMC Data:</strong> Prices shown below are calibrated demonstration benchmarks from regional Karnataka APMCs. Connect live e-NAM API keys in production for real-time bid sync.
              </div>
            </div>

            {/* MANDI RATES CARDS LIST */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span>{selectedCrop} Mandi Rates Near You</span>
                <span className="text-emerald-700">{currentMandiRates.length} APMC Centers</span>
              </div>

              {currentMandiRates.map((mandi, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{mandi.mandi}</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{mandi.district}, {mandi.state} • {mandi.distanceKm} km away</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-stone-900">
                        {mandi.modalPrice > 50 ? `₹ ${mandi.modalPrice.toLocaleString('en-IN')}` : `₹ ${mandi.modalPrice}`}
                      </span>
                      <span className="text-[10px] text-stone-400 block font-medium">{mandi.unit}</span>
                      <span className={`text-[10px] font-bold block ${mandi.trend.startsWith('+') ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {mandi.trend}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-stone-50 rounded-xl text-center text-[10px] text-stone-600 border border-stone-100">
                    <div>
                      <span className="text-stone-400 block">Min</span>
                      <span className="font-bold text-stone-800">₹{mandi.minPrice}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Modal Rate</span>
                      <span className="font-bold text-emerald-800">₹{mandi.modalPrice}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Max</span>
                      <span className="font-bold text-stone-800">₹{mandi.maxPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-stone-400 pt-0.5">
                    <span>Daily Arrivals: {mandi.arrivalsTonnes} Tonnes</span>
                    <span className="text-stone-500 font-medium">Source: {mandi.source} ({mandi.updatedDate})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* TRIGGER: FIND BUYERS CALLOUT BANNER */}
            <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Sell {selectedCrop} Directly</h4>
                <p className="text-xs text-emerald-200 mt-0.5">Connect with verified buyers &amp; processors</p>
              </div>
              <button 
                onClick={() => {
                  setDiscoveryCrop(selectedCrop);
                  setShowFindBuyersModal(true);
                }}
                className="px-3.5 py-2 bg-white text-emerald-900 font-bold rounded-xl text-xs shrink-0 shadow-2xs active:scale-95 transition-all"
              >
                Find Buyers
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BUYERS DIRECTORY ================= */}
        {activeTab === 'buyers' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
              <span>Verified Buyers &amp; Mill Requirements</span>
              <button 
                onClick={() => setShowFindBuyersModal(true)}
                className="text-emerald-700 hover:underline"
              >
                + Filter Matches
              </button>
            </div>

            <div className="space-y-2.5">
              {mockBuyersList.map((buyer) => (
                <div key={buyer.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-stone-900 truncate">{buyer.name}</h3>
                      </div>
                      <p className="text-[11px] text-stone-500">{buyer.type} • {buyer.district}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      {buyer.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-stone-500 text-[10px] block">Seeking Commodity:</span>
                      <span className="font-black text-stone-900">{buyer.commodity} ({buyer.minQty}–{buyer.maxQty} Qtl)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-500 text-[10px] block">Offered Price:</span>
                      <span className="font-black text-emerald-700">₹ {buyer.offeredPrice} / Qtl</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <div className="text-[11px] text-stone-600">
                      <p className="font-semibold">{buyer.contactPerson}</p>
                      <p className="text-stone-400 text-[10px]">{buyer.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setExpressedInterestBuyerId(buyer.id);
                        showToast(`Interest recorded for ${buyer.name}. Demo procurement message logged.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        expressedInterestBuyerId === buyer.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {expressedInterestBuyerId === buyer.id ? '✓ Interest Sent' : 'Contact Buyer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: FIND BUYERS DISCOVERY WORKFLOW ================= */}
      {showFindBuyersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-base text-stone-900">Find Matching Buyers</h2>
              <button onClick={() => setShowFindBuyersModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select Crop / Commodity *</label>
                <select
                  value={discoveryCrop}
                  onChange={(e) => setDiscoveryCrop(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  {cropList.map(c => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    value={discoveryQuantity}
                    onChange={(e) => setDiscoveryQuantity(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Location District</label>
                  <input
                    type="text"
                    value={discoveryDistrict}
                    onChange={(e) => setDiscoveryDistrict(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Search Match Results */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Matching Buyers Found ({matchedBuyers.length})
              </h4>

              {matchedBuyers.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs text-center">
                  No active buyers currently registered for {discoveryCrop} in {discoveryDistrict}. Try selecting Maize or Paddy.
                </div>
              ) : (
                matchedBuyers.map(b => (
                  <div key={b.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-stone-900">{b.name}</span>
                      <span className="font-black text-emerald-800">₹{b.offeredPrice}/Qtl</span>
                    </div>
                    <p className="text-[10px] text-stone-500">Contact: {b.contactPerson} ({b.phone})</p>
                    <button
                      onClick={() => {
                        setExpressedInterestBuyerId(b.id);
                        showToast(`Enquiry sent to ${b.name} for ${discoveryQuantity} Qtl.`);
                        setShowFindBuyersModal(false);
                        setActiveTab('buyers');
                      }}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs mt-1"
                    >
                      Express Interest ({discoveryQuantity} Quintals)
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFindBuyersModal(false)}
              className="w-full h-10 rounded-xl border border-stone-300 font-bold text-xs text-stone-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
