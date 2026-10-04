'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sprout, 
  Plus, 
  Camera, 
  Activity, 
  FileText, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  UploadCloud,
  FileCheck2,
  Trash2,
  X
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { CropCycle, SoilHealthReport } from '@/types';

export default function AgriPage() {
  const { 
    plots, 
    cropCycles, 
    addCropCycle, 
    soilReports, 
    addSoilReport, 
    showToast, 
    t 
  } = useFarmer();

  const [activeSubView, setActiveSubView] = useState<'list' | 'details' | 'disease' | 'soil'>('list');
  const [selectedCropId, setSelectedCropId] = useState<string>(cropCycles[0]?.id || '');
  
  // Modals
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showUploadSoilModal, setShowUploadSoilModal] = useState(false);

  // Form states: Add Crop
  const [newCropName, setNewCropName] = useState('Maize');
  const [newCropVariety, setNewCropVariety] = useState('Kaveri 50');
  const [newCropPlotId, setNewCropPlotId] = useState(plots[0]?.id || 'plot-1');
  const [newCropAcreage, setNewCropAcreage] = useState('2');
  const [newCropSowingDate, setNewCropSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCropHarvestDate, setNewCropHarvestDate] = useState('');
  const [newCropSeason, setNewCropSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');
  const [newCropNotes, setNewCropNotes] = useState('');
  const [addCropError, setAddCropError] = useState('');

  // Form states: Upload Soil Health Card
  const [soilPlotId, setSoilPlotId] = useState(plots[0]?.id || 'plot-1');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [soilUploadError, setSoilUploadError] = useState('');
  const [soilPh, setSoilPh] = useState('6.8');
  const [soilIndex, setSoilIndex] = useState<'Optimal' | 'Medium' | 'Deficient'>('Optimal');

  // Currently selected crop
  const currentCrop = cropCycles.find(c => c.id === selectedCropId) || cropCycles[0] || {
    id: 'crop-default',
    plotId: 'plot-1',
    farmerId: 'farmer-1',
    cropName: 'Maize',
    variety: 'Kaveri 50',
    season: 'Kharif' as const,
    sowingDate: '2026-06-15',
    expectedHarvestDate: '2026-10-15',
    currentStage: 'Vegetative' as const,
    healthStatus: 'Good' as const,
    estimatedYieldQuintals: 20,
    status: 'active' as const,
  };

  const handleAddCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCropError('');

    if (!newCropName.trim()) {
      setAddCropError('Please enter a crop name.');
      return;
    }
    const acreageNum = parseFloat(newCropAcreage);
    if (!acreageNum || acreageNum <= 0) {
      setAddCropError('Please enter a valid positive cultivated area (acres).');
      return;
    }
    if (!newCropSowingDate) {
      setAddCropError('Sowing date is required.');
      return;
    }

    const createdId = addCropCycle({
      plotId: newCropPlotId,
      cropName: newCropName.trim(),
      variety: newCropVariety.trim() || 'Desi / Improved',
      season: newCropSeason,
      sowingDate: newCropSowingDate,
      expectedHarvestDate: newCropHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      currentStage: 'Sowing',
      healthStatus: 'Good',
      estimatedYieldQuintals: Math.round(acreageNum * 10),
      status: 'active',
    });

    setSelectedCropId(createdId);
    setShowAddCropModal(false);
    setNewCropName('Maize');
    setNewCropVariety('');
    setNewCropAcreage('2');
    setNewCropNotes('');
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoilUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setSoilUploadError('Invalid file type. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setSoilUploadError('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleSoilUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setSoilUploadError('Please choose a file to upload.');
      return;
    }

    addSoilReport({
      plotId: soilPlotId,
      sampleDate: new Date().toISOString().split('T')[0],
      ph: parseFloat(soilPh) || 6.8,
      nitrogenKgPerHa: 240,
      phosphorusKgPerHa: 18,
      potassiumKgPerHa: 310,
      organicCarbonPercent: 0.55,
      soilHealthIndex: soilIndex,
      cropSuitability: ['Maize', 'Tomato', 'Paddy', 'Chilli'],
      fileName: selectedFile.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      isLocalUpload: true,
      reportFileUrl: `local-doc://${selectedFile.name}`,
    });

    setShowUploadSoilModal(false);
    setSelectedFile(null);
    setActiveSubView('soil');
  };

  const cropEmojis: Record<string, string> = {
    Maize: '🌽',
    Tomato: '🍅',
    Chilli: '🌶️',
    Paddy: '🌾',
    Wheat: '🌾',
    Cotton: '🌱',
    Sugarcane: '🎋',
    Groundnut: '🥜',
    Onion: '🧅',
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {activeSubView === 'list' ? (
            <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <button onClick={() => setActiveSubView('list')} className="p-1 rounded-lg hover:bg-emerald-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-base font-black">
            {activeSubView === 'list' && 'Crop Management'}
            {activeSubView === 'details' && 'Crop Details'}
            {activeSubView === 'disease' && 'Disease Detection'}
            {activeSubView === 'soil' && 'Soil Health Card'}
          </h1>
        </div>

        {activeSubView === 'list' && (
          <button 
            onClick={() => setShowAddCropModal(true)}
            className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Crop</span>
          </button>
        )}
      </header>

      {/* VIEW 1: CROPS LIST (SCREEN 11) */}
      {activeSubView === 'list' && (
        <div className="p-3.5 space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Active Crops ({cropCycles.filter(c => c.status === 'active').length})
            </span>
            <button 
              onClick={() => setShowAddCropModal(true)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              + New Crop
            </button>
          </div>

          <div className="space-y-2.5">
            {cropCycles.map((crop) => {
              const matchedPlot = plots.find(p => p.id === crop.plotId);
              const emoji = cropEmojis[crop.cropName] || '🌱';
              return (
                <div 
                  key={crop.id}
                  onClick={() => {
                    setSelectedCropId(crop.id);
                    setActiveSubView('details');
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-emerald-400 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                      {emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-stone-900">{crop.cropName}</h3>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {crop.currentStage}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {crop.variety} • {matchedPlot ? `${matchedPlot.name} (${matchedPlot.areaAcres} Acres)` : 'Plot 1'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Quick Sub-Modules Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => setActiveSubView('disease')}
              className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs text-left hover:border-emerald-500 transition-all active:scale-[0.99]"
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-1.5">
                <Camera className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-stone-900">Crop Disease Scan</p>
              <p className="text-[10px] text-stone-500">Instant AI leaf scan</p>
            </button>

            <button
              onClick={() => setActiveSubView('soil')}
              className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs text-left hover:border-emerald-500 transition-all active:scale-[0.99]"
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-1.5">
                <FileText className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-stone-900">Soil Health Card</p>
              <p className="text-[10px] text-stone-500">View & upload report</p>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: CROP DETAILS (SCREEN 12) */}
      {activeSubView === 'details' && (
        <div className="p-3.5 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-3xl mb-2">
              {cropEmojis[currentCrop.cropName] || '🌱'}
            </div>
            <h2 className="text-base font-black text-stone-900">{currentCrop.cropName}</h2>
            <p className="text-xs text-stone-500">
              Variety: {currentCrop.variety} • Season: {currentCrop.season}
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                Stage: {currentCrop.currentStage}
              </span>
              <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                Sown: {currentCrop.sowingDate}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setActiveSubView('disease')}
              className="w-full p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-800 hover:border-emerald-400"
            >
              <span className="flex items-center gap-2">
                <span>🔬</span> Check Disease Symptoms
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            <button 
              onClick={() => setActiveSubView('soil')}
              className="w-full p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-800 hover:border-emerald-400"
            >
              <span className="flex items-center gap-2">
                <span>🧪</span> Soil Suitability Report
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <button
            onClick={() => setActiveSubView('list')}
            className="w-full py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"
          >
            ← Back to Crops List
          </button>
        </div>
      )}

      {/* VIEW 3: DISEASE DETECTION */}
      {activeSubView === 'disease' && (
        <div className="p-3.5 space-y-3">
          <div className="h-52 bg-stone-900 rounded-3xl overflow-hidden relative border-2 border-emerald-600 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <span className="text-4xl block mb-2">🍃</span>
              <p className="font-bold text-xs">{currentCrop.cropName} Leaf Scan</p>
              <div className="w-36 h-20 border-2 border-dashed border-emerald-400 mx-auto mt-2 rounded-lg flex items-center justify-center text-[10px] text-emerald-300">
                Leaf Spot Diagnostic
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Diagnostic Assessment</p>
                <h3 className="font-black text-sm text-stone-900">{currentCrop.cropName} Leaf Blight (91% match)</h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Moderate Risk
              </span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <p className="font-bold text-[11px] text-emerald-950">Suggested Advisory:</p>
              <p className="text-[11px] leading-relaxed">
                1. Spray Mancozeb 75% WP @ 2g/L or Azoxystrobin @ 1ml/L.<br />
                2. Avoid overhead sprinkler irrigation during high humidity.<br />
                3. Inspect lower leaves across Plot 1 within 48 hours.
              </p>
            </div>

            <button
              onClick={() => showToast('Advisory saved to crop health record.')}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs active:scale-98 transition-all"
            >
              Log Advisory to Farm Record
            </button>
          </div>

          <button
            onClick={() => setActiveSubView('list')}
            className="w-full py-2 text-xs font-bold text-stone-600"
          >
            ← Back
          </button>
        </div>
      )}

      {/* VIEW 4: SOIL HEALTH CARD (SCREEN 15 & UPLOAD INTEGRATION) */}
      {activeSubView === 'soil' && (
        <div className="p-3.5 space-y-3">
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Soil Health Cards</span>
            <button
              onClick={() => setShowUploadSoilModal(true)}
              className="text-xs font-bold bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Soil Card</span>
            </button>
          </div>

          {/* Optimal Indicator Card */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-2 shadow-2xs">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 mx-auto flex flex-col items-center justify-center">
              <span className="text-xl font-black text-stone-900 leading-none">6.8</span>
              <span className="text-[9px] text-emerald-700 font-bold uppercase mt-0.5">Optimal</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900">Soil pH Optimal (Plot 1)</h3>
            <p className="text-[11px] text-stone-500">Red Loam Soil • Good drainage and organic matter</p>
          </div>

          {/* Test Parameters */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-bold text-stone-500 uppercase">Chemical Parameters</h4>
            {[
              { label: 'Nitrogen (N)', val: 'Medium (240 kg/ha)', color: 'text-amber-600' },
              { label: 'Phosphorus (P)', val: 'Low (18 kg/ha)', color: 'text-rose-600' },
              { label: 'Potassium (K)', val: 'Optimal (310 kg/ha)', color: 'text-emerald-600' },
              { label: 'Organic Carbon', val: '0.55% (Medium)', color: 'text-amber-600' },
            ].map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100 last:border-none">
                <span className="text-stone-700 font-medium">{p.label}</span>
                <span className={`font-bold ${p.color}`}>{p.val}</span>
              </div>
            ))}
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Associated Soil Test Documents ({soilReports.length})
            </h4>

            {soilReports.map((report) => (
              <div key={report.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">
                      {report.fileName || `Govt Soil Card (Plot ${report.plotId})`}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Sample Date: {report.sampleDate} • pH: {report.ph} ({report.soilHealthIndex})
                    </p>
                    {report.isLocalUpload && (
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        Local Device Document
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Verified</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveSubView('list')}
            className="w-full py-2.5 text-xs font-bold text-stone-600"
          >
            ← Back to Crops List
          </button>
        </div>
      )}

      {/* ================= MODAL: ADD CROP ================= */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">Add New Crop</h2>
              <button onClick={() => setShowAddCropModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addCropError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {addCropError}
              </div>
            )}

            <form onSubmit={handleAddCropSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Name *</label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Paddy">Paddy (Rice)</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Onion">Onion</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Variety / Hybrid</label>
                <input
                  type="text"
                  placeholder="e.g. Kaveri 50 / Abhinav"
                  value={newCropVariety}
                  onChange={(e) => setNewCropVariety(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Field / Plot Selection *</label>
                <select
                  value={newCropPlotId}
                  onChange={(e) => setNewCropPlotId(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.areaAcres} Acres, {p.soilType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Area (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newCropAcreage}
                    onChange={(e) => setNewCropAcreage(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Season</label>
                  <select
                    value={newCropSeason}
                    onChange={(e) => setNewCropSeason(e.target.value as any)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sowing Date *</label>
                  <input
                    type="date"
                    value={newCropSowingDate}
                    onChange={(e) => setNewCropSowingDate(e.target.value)}
                    className="w-full h-11 px-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    value={newCropHarvestDate}
                    onChange={(e) => setNewCropHarvestDate(e.target.value)}
                    className="w-full h-11 px-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Treated seeds with Trichoderma before sowing"
                  value={newCropNotes}
                  onChange={(e) => setNewCropNotes(e.target.value)}
                  className="w-full h-16 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCropModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Save Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD SOIL HEALTH CARD ================= */}
      {showUploadSoilModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">Upload Soil Health Card</h2>
              <button onClick={() => setShowUploadSoilModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 mb-3 leading-relaxed">
              <strong>Local Development Mode:</strong> Files are processed locally on your device and linked to your farm profile. No cloud upload fees or third-party storage APIs are required.
            </div>

            {soilUploadError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {soilUploadError}
              </div>
            )}

            <form onSubmit={handleSoilUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Target Field / Plot</label>
                <select
                  value={soilPlotId}
                  onChange={(e) => setSoilPlotId(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.soilType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document (PDF, JPG, PNG up to 10MB) *
                </label>
                <label className="border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <UploadCloud className="w-7 h-7 text-emerald-700 mb-1" />
                  <span className="text-xs font-bold text-emerald-950">Tap to choose document</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">Government lab report or mobile scan</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelection}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <div className="mt-2 p-2.5 bg-stone-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <p className="font-bold text-stone-900 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-stone-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedFile(null)}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Recorded pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Soil Status</label>
                  <select
                    value={soilIndex}
                    onChange={(e) => setSoilIndex(e.target.value as any)}
                    className="w-full h-10 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Medium">Medium</option>
                    <option value="Deficient">Deficient</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadSoilModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Upload & Save
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
