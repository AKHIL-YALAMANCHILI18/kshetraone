'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Milk, 
  Plus, 
  Heart, 
  Check, 
  ChevronRight, 
  Sun, 
  Moon, 
  Trash2, 
  Edit2, 
  X,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { LivestockType, Animal, MilkRecord } from '@/types';

export default function DairyPage() {
  const { 
    animals, 
    milkRecords, 
    recordDailyMilk, 
    registerAnimal, 
    updateAnimal, 
    removeAnimal, 
    showToast,
    financialSummary 
  } = useFarmer();

  const [activeTab, setActiveTab] = useState<'milk' | 'health'>('milk');

  // Modals
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  // Form states: Milk Record
  const [milkDate, setMilkDate] = useState(new Date().toISOString().split('T')[0]);
  const [morningL, setMorningL] = useState('12');
  const [eveningL, setEveningL] = useState('10');
  const [milkFat, setMilkFat] = useState('4.5');
  const [milkSnf, setMilkSnf] = useState('8.5');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('all');
  const [ratePerL, setRatePerL] = useState('36');
  const [buyerName, setBuyerName] = useState('Local Dairy MPCS');
  const [milkNotes, setMilkNotes] = useState('');
  const [milkFormError, setMilkFormError] = useState('');

  // Form states: Animal Registration
  const [tagNumber, setTagNumber] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [animalType, setAnimalType] = useState<LivestockType>('Cow');
  const [breed, setBreed] = useState('HF (Crossbreed)');
  const [ageYears, setAgeYears] = useState('3');
  const [healthStatus, setHealthStatus] = useState<Animal['healthStatus']>('Healthy');
  const [milkingStatus, setMilkingStatus] = useState<Animal['milkingStatus']>('Milking');
  const [yieldLiters, setYieldLiters] = useState('14');
  const [animalError, setAnimalError] = useState('');

  // Find record for chosen or today's date
  const todayDateStr = new Date().toISOString().split('T')[0];
  const activeMilkEntry = milkRecords.find(m => m.date === milkDate) || milkRecords[0] || {
    date: todayDateStr,
    morningLiters: 12,
    eveningLiters: 10,
    totalLiters: 22,
    avgFat: 4.5,
    avgSnf: 8.5,
    litersSold: 20,
    litersRetained: 2,
    ratePerLiter: 36,
    totalRevenue: 720,
    buyerName: 'Local Dairy MPCS',
    isConfirmed: true,
  };

  const calculatedDailyTotal = (parseFloat(morningL) || 0) + (parseFloat(eveningL) || 0);

  const handleSaveMilkRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setMilkFormError('');

    const morning = parseFloat(morningL);
    const evening = parseFloat(eveningL);

    if (isNaN(morning) || morning < 0) {
      setMilkFormError('Please enter a valid morning milk yield (0 or more).');
      return;
    }
    if (isNaN(evening) || evening < 0) {
      setMilkFormError('Please enter a valid evening milk yield (0 or more).');
      return;
    }
    if (morning + evening <= 0) {
      setMilkFormError('Daily milk total must be greater than 0.');
      return;
    }
    if (!milkDate) {
      setMilkFormError('Please select a valid record date.');
      return;
    }

    const fat = parseFloat(milkFat) || 4.2;
    const snf = parseFloat(milkSnf) || 8.5;
    const rate = parseFloat(ratePerL) || 36;
    const totalYield = morning + evening;
    const retained = Math.min(2, totalYield);
    const sold = Math.max(0, totalYield - retained);
    const revenue = Math.round(sold * rate);

    recordDailyMilk({
      date: milkDate,
      animalId: selectedAnimalId === 'all' ? undefined : selectedAnimalId,
      morningLiters: morning,
      eveningLiters: evening,
      totalLiters: totalYield,
      avgFat: fat,
      avgSnf: snf,
      litersSold: sold,
      litersRetained: retained,
      ratePerLiter: rate,
      totalRevenue: revenue,
      buyerName: buyerName.trim() || 'Local Dairy MPCS',
      isConfirmed: true,
      notes: milkNotes.trim() || undefined,
    });

    setShowMilkModal(false);
  };

  const handleAnimalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnimalError('');

    if (!tagNumber.trim()) {
      setAnimalError('Animal Tag / ID number is required.');
      return;
    }

    const age = parseFloat(ageYears);
    if (isNaN(age) || age < 0) {
      setAnimalError('Please enter a valid age in years.');
      return;
    }

    if (editingAnimal) {
      updateAnimal(editingAnimal.id, {
        tagNumber: tagNumber.trim(),
        name: animalName.trim() || undefined,
        type: animalType,
        breed: breed.trim() || 'Crossbreed',
        ageYears: age,
        healthStatus,
        milkingStatus,
        dailyAverageYieldLiters: parseFloat(yieldLiters) || 12,
      });
      setEditingAnimal(null);
    } else {
      registerAnimal({
        tagNumber: tagNumber.trim(),
        name: animalName.trim() || undefined,
        type: animalType,
        breed: breed.trim() || 'Crossbreed',
        ageYears: age,
        healthStatus,
        milkingStatus,
        dailyAverageYieldLiters: parseFloat(yieldLiters) || 12,
        lastVaccinationDate: new Date().toISOString().split('T')[0],
      });
    }

    setShowAnimalModal(false);
    setTagNumber('');
    setAnimalName('');
    setBreed('HF (Crossbreed)');
  };

  const openEditAnimalModal = (animal: Animal) => {
    setEditingAnimal(animal);
    setTagNumber(animal.tagNumber);
    setAnimalName(animal.name || '');
    setAnimalType(animal.type);
    setBreed(animal.breed);
    setAgeYears(animal.ageYears.toString());
    setHealthStatus(animal.healthStatus);
    setMilkingStatus(animal.milkingStatus);
    setYieldLiters(animal.dailyAverageYieldLiters.toString());
    setShowAnimalModal(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black">
            {activeTab === 'milk' ? 'Daily Milk Ledger' : 'Livestock Management'}
          </h1>
        </div>

        {activeTab === 'milk' ? (
          <button 
            onClick={() => {
              setMilkDate(new Date().toISOString().split('T')[0]);
              setMorningL('12');
              setEveningL('10');
              setMilkFormError('');
              setShowMilkModal(true);
            }}
            className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Milk</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              setEditingAnimal(null);
              setTagNumber(`KA-${Math.floor(1000 + Math.random() * 9000)}`);
              setAnimalName('');
              setAnimalError('');
              setShowAnimalModal(true);
            }}
            className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Animal</span>
          </button>
        )}
      </header>

      {/* SUB-TABS */}
      <div className="p-3.5 space-y-3.5">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs font-bold">
          <button 
            onClick={() => setActiveTab('milk')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'milk' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Milk Ledger
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeTab === 'health' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Herd Register ({animals.length})
          </button>
        </div>

        {/* TAB 1: MILK RECORD WORKFLOW */}
        {activeTab === 'milk' && (
          <div className="space-y-3.5">
            
            {/* Date Selector Row */}
            <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-stone-200 text-xs">
              <span className="font-bold text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Selected Date:</span>
              </span>
              <input
                type="date"
                value={milkDate}
                onChange={(e) => setMilkDate(e.target.value)}
                className="font-bold text-stone-900 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200 text-xs"
              />
            </div>

            {/* Morning & Evening Cards Split */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Morning */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <Sun className="w-4 h-4" />
                  <span>Morning</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-stone-900">{activeMilkEntry.morningLiters}</span>
                  <span className="text-xs font-bold text-stone-500 ml-1">Litres</span>
                </div>
                <p className="text-[10px] text-stone-400">Fat: {activeMilkEntry.avgFat}%</p>
              </div>

              {/* Evening */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <Moon className="w-4 h-4" />
                  <span>Evening</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-stone-900">{activeMilkEntry.eveningLiters}</span>
                  <span className="text-xs font-bold text-stone-500 ml-1">Litres</span>
                </div>
                <p className="text-[10px] text-stone-400">SNF: {activeMilkEntry.avgSnf}%</p>
              </div>
            </div>

            {/* Total Daily Card with Auto-calculated revenue */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-stone-600">Total Production</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-800">{activeMilkEntry.totalLiters}</span>
                  <span className="text-xs font-bold text-stone-500">Litres</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Est. Revenue: ₹{activeMilkEntry.totalRevenue} ({activeMilkEntry.litersSold}L sold @ ₹{activeMilkEntry.ratePerLiter}/L)
                </p>
              </div>
              <button
                onClick={() => {
                  setMorningL(activeMilkEntry.morningLiters.toString());
                  setEveningL(activeMilkEntry.eveningLiters.toString());
                  setMilkFat(activeMilkEntry.avgFat.toString());
                  setMilkSnf(activeMilkEntry.avgSnf.toString());
                  setRatePerL(activeMilkEntry.ratePerLiter.toString());
                  setBuyerName(activeMilkEntry.buyerName || 'Local Dairy MPCS');
                  setShowMilkModal(true);
                }}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 transition-all flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit / Log</span>
              </button>
            </div>

            {/* Weekly Production Trend */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Historical Records</h3>
                <span className="text-[10px] font-bold text-stone-400">{milkRecords.length} Saved Entries</span>
              </div>
              
              <div className="space-y-1.5">
                {milkRecords.slice(0, 5).map((rec) => (
                  <div key={rec.id} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                    <div>
                      <p className="font-bold text-stone-900">{rec.date}</p>
                      <p className="text-[10px] text-stone-500">M: {rec.morningLiters}L • E: {rec.eveningLiters}L</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-stone-900">{rec.totalLiters} L</span>
                      <p className="text-[10px] text-emerald-700 font-bold">+₹{rec.totalRevenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANIMALS LIST WORKFLOW */}
        {activeTab === 'health' && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Registered Cattle ({animals.length})
              </span>
              <button 
                onClick={() => {
                  setEditingAnimal(null);
                  setTagNumber(`KA-${Math.floor(1000 + Math.random() * 9000)}`);
                  setAnimalName('');
                  setAnimalError('');
                  setShowAnimalModal(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                + Register Animal
              </button>
            </div>

            {animals.map((a) => {
              const isCow = a.type.toLowerCase().includes('cow');
              return (
                <div key={a.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex justify-between items-center hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                      {isCow ? '🐄' : '🐃'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-stone-900 truncate">
                          {a.name ? `${a.name} (#${a.tagNumber})` : `Tag #${a.tagNumber}`}
                        </h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          a.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {a.healthStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {a.breed} • {a.ageYears} yrs • {a.milkingStatus} (~{a.dailyAverageYieldLiters}L/day)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => openEditAnimalModal(a)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-stone-100"
                      title="Edit Animal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAnimalToDelete(a)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Animal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <button 
              onClick={() => {
                setEditingAnimal(null);
                setTagNumber(`KA-${Math.floor(1000 + Math.random() * 9000)}`);
                setAnimalName('');
                setAnimalError('');
                setShowAnimalModal(true);
              }}
              className="w-full py-3 bg-white border border-dashed border-stone-300 rounded-2xl text-xs font-bold text-stone-700 hover:border-emerald-500 hover:text-emerald-800 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Cattle / Animal</span>
            </button>
          </div>
        )}

      </div>

      {/* ================= MODAL: ADD / EDIT MILK RECORD ================= */}
      {showMilkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">Log Daily Milk Record</h2>
              <button onClick={() => setShowMilkModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {milkFormError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {milkFormError}
              </div>
            )}

            <form onSubmit={handleSaveMilkRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Record Date *</label>
                <input
                  type="date"
                  value={milkDate}
                  onChange={(e) => setMilkDate(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Animal Selection (Optional)</label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="all">Total Farm Herd (All Cattle)</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name ? `${a.name} (#${a.tagNumber})` : `Tag #${a.tagNumber}`} ({a.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Morning Yield (L) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={morningL}
                    onChange={(e) => setMorningL(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Evening Yield (L) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={eveningL}
                    onChange={(e) => setEveningL(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950">Daily Total:</span>
                <span className="text-base font-black text-emerald-800">{calculatedDailyTotal} Litres</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={milkFat}
                    onChange={(e) => setMilkFat(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">SNF %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={milkSnf}
                    onChange={(e) => setMilkSnf(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Rate (₹ / Litre)</label>
                  <input
                    type="number"
                    value={ratePerL}
                    onChange={(e) => setRatePerL(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Buyer / Dairy</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilkModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTER / EDIT ANIMAL ================= */}
      {showAnimalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">
                {editingAnimal ? 'Edit Animal Details' : 'Register New Animal'}
              </h2>
              <button onClick={() => setShowAnimalModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {animalError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {animalError}
              </div>
            )}

            <form onSubmit={handleAnimalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tag Number / Ear Tag ID *</label>
                <input
                  type="text"
                  placeholder="e.g. KA-4021"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Name / Identifier (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ganga / Laxmi"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Animal Type</label>
                  <select
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value as any)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Cow">Cow</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Goat">Goat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Breed</label>
                  <input
                    type="text"
                    placeholder="e.g. HF / Murrah"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={ageYears}
                    onChange={(e) => setAgeYears(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Avg Yield (L/day)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={yieldLiters}
                    onChange={(e) => setYieldLiters(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Health Status</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value as any)}
                    className="w-full h-10 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Quarantine">Quarantine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Milking Status</label>
                  <select
                    value={milkingStatus}
                    onChange={(e) => setMilkingStatus(e.target.value as any)}
                    className="w-full h-10 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Milking">Milking</option>
                    <option value="Dry">Dry Period</option>
                    <option value="Heifer">Heifer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnimalModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  {editingAnimal ? 'Update Animal' : 'Register Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE ANIMAL CONFIRMATION ================= */}
      {animalToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 space-y-3 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900">Remove Cattle Record</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-stone-800">{animalToDelete.name || `Tag #${animalToDelete.tagNumber}`}</span> ({animalToDelete.breed})?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAnimalToDelete(null)}
                className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeAnimal(animalToDelete.id);
                  setAnimalToDelete(null);
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
