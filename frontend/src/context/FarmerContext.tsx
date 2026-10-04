'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FarmerProfile, Farm, Plot, CropCycle, CropActivity, DiseaseDetectionRecord, SoilHealthReport,
  Animal, MilkRecord, HealthVaccinationRecord, FeedRecord,
  FinancialTransaction, FinancialSummary, Warehouse, InventoryItem, StockMovement,
  MandiRate, MarketListing, BuyerRequirement, CommunityPost, FarmTask, LanguageCode
} from '@/types';
import { initialEcosystemData, EcosystemState } from '@/data/ecosystemState';
import { translations } from '@/i18n/translations';
import { firebaseSignOut, onFirebaseAuthStateChanged } from '@/lib/firebase';
import { 
  backendGetMe, 
  backendLogout, 
  backendUpdateProfile, 
  getStoredToken, 
  removeStoredToken 
} from '@/lib/authApi';

const STORAGE_KEY = 'kshetraone_ecosystem_v4';
const AUTH_STORAGE_KEY = 'kshetraone_auth_session';

export interface FieldInput {
  name: string;
  acres: number;
  cropName: string;
  variety?: string;
}

export interface LivestockInput {
  type: 'Cow (HF)' | 'Cow (Jersey)' | 'Buffalo' | 'Goat';
  breed: string;
  count: number;
}

export interface AuthSession {
  uid: string | null;
  phoneNumber: string | null;
  email?: string | null;
  displayName?: string | null;
  isAuthenticated: boolean;
}

interface EcosystemContextType extends EcosystemState {
  // Navigation & Localization
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof translations['en'];
  isHydrated: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: (
    customProfile: Partial<FarmerProfile>,
    fields?: FieldInput[],
    livestock?: LivestockInput[]
  ) => void;
  resetToOnboarding: () => void;
  logout: () => void;
  authSession: AuthSession;
  setAuthSession: (session: AuthSession) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // WORKFLOW 1: Agriculture & Farms
  addFarm: (farm: Omit<Farm, 'id' | 'farmerId' | 'createdAt'>) => string;
  addPlot: (plot: Omit<Plot, 'id'>) => string;
  addCropCycle: (crop: Omit<CropCycle, 'id' | 'farmerId'>) => string;
  logCropActivity: (act: Omit<CropActivity, 'id' | 'loggedAt'>) => void;
  logDiseaseScan: (scan: Omit<DiseaseDetectionRecord, 'id' | 'loggedAt'>) => void;
  addSoilReport: (report: Omit<SoilHealthReport, 'id'>) => void;
  updateCropStage: (cropId: string, stage: CropCycle['currentStage']) => void;

  // WORKFLOW 2: Dairy & Livestock
  registerAnimal: (animal: Omit<Animal, 'id'>) => string;
  updateAnimal: (animalId: string, updates: Partial<Animal>) => void;
  removeAnimal: (animalId: string) => void;
  recordDailyMilk: (milk: Omit<MilkRecord, 'id'>) => void;
  addAnimalHealthRecord: (rec: Omit<HealthVaccinationRecord, 'id'>) => void;
  logCattleFeedPurchase: (feed: Omit<FeedRecord, 'id'>) => void;

  // WORKFLOW 3: Finance Ledger
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  financialSummary: FinancialSummary;

  // WORKFLOW 4: Harvest-to-Warehouse Movement
  harvestCropToInventory: (cropCycleId: string, harvestQuintals: number, warehouseId: string, grade: InventoryItem['grade']) => void;
  adjustInventoryStock: (inventoryItemId: string, deltaQuintals: number, reason: StockMovement['reason']) => void;
  addInventoryStock: (stock: Omit<InventoryItem, 'id'>, reason?: StockMovement['reason']) => void;

  // WORKFLOW 5: Marketplace & Sales
  createMarketListing: (listing: Omit<MarketListing, 'id' | 'sellerFarmerId' | 'createdAt' | 'status'>) => void;
  confirmMarketSale: (listingId: string, soldQuintals: number, finalPricePerQuintal: number, buyerName: string) => void;

  // WORKFLOW 6: Community
  addCommunityPost: (content: string, category: CommunityPost['category'], scope: CommunityPost['scope']) => void;
  togglePostLike: (postId: string) => void;

  // WORKFLOW 7: Tasks Management
  createTask: (task: Omit<FarmTask, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<FarmTask>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;

  // Demo Resets
  resetToDefaultData: () => void;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

export const EcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<EcosystemState>(initialEcosystemData);
  // Default to false for first-time user experience unless stored otherwise
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [authSession, setAuthSessionState] = useState<AuthSession>({
    uid: null,
    phoneNumber: null,
    isAuthenticated: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const setAuthSession = (session: AuthSession) => {
    setAuthSessionState(session);
    try {
      if (session.isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Storage fallback
    }
  };

  // Restore session & ecosystem data on mount
  useEffect(() => {
    try {
      let isAuthed = false;
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth && parsedAuth.isAuthenticated) {
          setAuthSessionState(parsedAuth);
          isAuthed = true;
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) {
          setData(parsed);
          if (parsed.profile.onboarded && isAuthed) {
            setIsOnboardingComplete(true);
          } else {
            setIsOnboardingComplete(false);
          }
        }
      } else {
        setIsOnboardingComplete(false);
      }

      // Check backend JWT session
      const token = getStoredToken();
      if (token) {
        backendGetMe(token).then((res) => {
          if (res.success && res.user) {
            const session: AuthSession = {
              uid: res.user.id,
              phoneNumber: res.profile?.phone_number || null,
              email: res.user.email,
              displayName: res.user.full_name,
              isAuthenticated: true,
            };
            setAuthSessionState(session);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
            } catch {}

            if (res.profile) {
              setData((prev) => {
                let updated = {
                  ...prev,
                  profile: {
                    ...prev.profile,
                    id: res.profile!.id,
                    name: res.profile!.name || res.user!.full_name,
                    phoneNumber: res.profile!.phone_number || prev.profile.phoneNumber,
                    email: res.user!.email,
                    location: {
                      state: res.profile!.state || prev.profile.location.state,
                      district: res.profile!.district || prev.profile.location.district,
                      village: res.profile!.village || prev.profile.location.village,
                    },
                    farmType: (res.profile!.farm_type as any) || prev.profile.farmType,
                    landAreaAcres: res.profile!.land_area_acres || prev.profile.landAreaAcres,
                    cattleCount: res.profile!.cattle_count || prev.profile.cattleCount,
                    language: (res.profile!.language as any) || prev.profile.language,
                    onboarded: res.profile!.onboarded,
                  },
                };
                if (res.profile!.ecosystem_data) {
                  try {
                    const eco = JSON.parse(res.profile!.ecosystem_data);
                    updated = { ...updated, ...eco };
                  } catch {}
                }
                return updated;
              });

              if (res.profile.onboarded) {
                setIsOnboardingComplete(true);
              }
            }
          }
        });
      }
    } catch {
      setIsOnboardingComplete(false);
    }
    setIsHydrated(true);
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((user) => {
      if (user) {
        const session: AuthSession = {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          displayName: user.displayName,
          isAuthenticated: true,
        };
        setAuthSessionState(session);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        } catch {
          // Ignore
        }
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota safety
    }
  }, [data, isHydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const t = translations[data.profile.language] || translations.en;

  const setLanguage = (lang: LanguageCode) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, language: lang }
    }));
  };

  // ---------------- AGRICULTURE WORKFLOW ----------------
  const addFarm = (farmInput: Omit<Farm, 'id' | 'farmerId' | 'createdAt'>): string => {
    const newId = `farm-${Date.now()}`;
    const newFarm: Farm = {
      ...farmInput,
      id: newId,
      farmerId: data.profile.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      farms: [...prev.farms, newFarm],
      profile: {
        ...prev.profile,
        landAreaAcres: prev.profile.landAreaAcres + farmInput.totalAreaAcres
      }
    }));
    showToast(`Farm "${newFarm.name}" registered successfully.`);
    return newId;
  };

  const addPlot = (plotInput: Omit<Plot, 'id'>): string => {
    const newId = `plot-${Date.now()}`;
    const newPlot: Plot = { ...plotInput, id: newId };
    setData(prev => ({
      ...prev,
      plots: [...prev.plots, newPlot]
    }));
    showToast(`Plot "${newPlot.name}" created.`);
    return newId;
  };

  const addCropCycle = (cropInput: Omit<CropCycle, 'id' | 'farmerId'>): string => {
    const newId = `crop-${Date.now()}`;
    const newCrop: CropCycle = {
      ...cropInput,
      id: newId,
      farmerId: data.profile.id,
    };
    setData(prev => ({
      ...prev,
      cropCycles: [...prev.cropCycles, newCrop],
      tasks: [
        ...prev.tasks,
        {
          id: `task-auto-${Date.now()}`,
          title: `Initial irrigation & scouting for ${newCrop.cropName}`,
          category: 'crop',
          dueTime: 'In 3 days',
          priority: 'medium',
          completed: false,
          sourceModule: 'Agriculture',
          createdAt: new Date().toISOString().split('T')[0],
        }
      ]
    }));
    showToast(`Crop "${newCrop.cropName}" logged. Auto-generated initial task added.`);
    return newId;
  };

  const logCropActivity = (actInput: Omit<CropActivity, 'id' | 'loggedAt'>) => {
    const actId = `act-${Date.now()}`;
    const newAct: CropActivity = {
      ...actInput,
      id: actId,
      loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    let updatedTx = data.transactions;
    if (newAct.cost > 0) {
      const autoTx: FinancialTransaction = {
        id: `tx-crop-${Date.now()}`,
        date: newAct.date,
        type: 'EXPENSE',
        category: newAct.activityType === 'Fertilizer' || newAct.activityType === 'Pesticide' ? 'Fertilizer & Pesticide' : 'Labor',
        amount: newAct.cost,
        relatedEntityId: newAct.cropCycleId,
        relatedEntityType: 'crop',
        description: `${newAct.activityType}: ${newAct.notes || newAct.inputUsed || 'Field work'}`,
        paymentMode: 'Cash',
        isAutoGenerated: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      updatedTx = [autoTx, ...updatedTx];
    }

    setData(prev => ({
      ...prev,
      cropActivities: [newAct, ...prev.cropActivities],
      transactions: updatedTx,
    }));
    showToast(`Activity "${newAct.activityType}" recorded.${newAct.cost > 0 ? ` Ledger updated (-₹${newAct.cost}).` : ''}`);
  };

  const logDiseaseScan = (scanInput: Omit<DiseaseDetectionRecord, 'id' | 'loggedAt'>) => {
    const newScan: DiseaseDetectionRecord = {
      ...scanInput,
      id: `scan-${Date.now()}`,
      loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setData(prev => ({
      ...prev,
      diseaseScans: [newScan, ...prev.diseaseScans],
      tasks: [
        {
          id: `task-scan-${Date.now()}`,
          title: `Apply spray advisory for ${newScan.cropName} (${newScan.detectedDisease})`,
          category: 'crop',
          dueTime: 'Tomorrow 09:00 AM',
          priority: 'high',
          completed: false,
          sourceModule: 'Disease Intelligence',
          createdAt: new Date().toISOString().split('T')[0],
        },
        ...prev.tasks,
      ]
    }));
    showToast(`Disease analysis complete (${newScan.confidenceScore}% confidence). High-priority task created.`);
  };

  const addSoilReport = (reportInput: Omit<SoilHealthReport, 'id'>) => {
    const newReport: SoilHealthReport = {
      ...reportInput,
      id: `soil-${Date.now()}`,
    };
    setData(prev => ({
      ...prev,
      soilReports: [newReport, ...prev.soilReports],
    }));
    showToast(`Soil health report added (pH: ${newReport.ph}, Index: ${newReport.soilHealthIndex}).`);
  };

  const updateCropStage = (cropId: string, stage: CropCycle['currentStage']) => {
    setData(prev => ({
      ...prev,
      cropCycles: prev.cropCycles.map(c => c.id === cropId ? { ...c, currentStage: stage } : c)
    }));
    showToast(`Crop stage updated to ${stage}.`);
  };

  // ---------------- DAIRY WORKFLOW ----------------
  const registerAnimal = (animalInput: Omit<Animal, 'id'>): string => {
    const newId = `animal-${Date.now()}`;
    const newAnimal: Animal = { ...animalInput, id: newId };
    setData(prev => ({
      ...prev,
      animals: [...prev.animals, newAnimal],
      profile: {
        ...prev.profile,
        cattleCount: prev.animals.length + 1
      }
    }));
    showToast(`Cattle Tag #${newAnimal.tagNumber} (${newAnimal.breed}) registered.`);
    return newId;
  };

  const updateAnimal = (animalId: string, updates: Partial<Animal>) => {
    setData(prev => ({
      ...prev,
      animals: prev.animals.map(a => a.id === animalId ? { ...a, ...updates } : a)
    }));
    showToast('Animal profile updated.');
  };

  const removeAnimal = (animalId: string) => {
    setData(prev => ({
      ...prev,
      animals: prev.animals.filter(a => a.id !== animalId),
      profile: {
        ...prev.profile,
        cattleCount: Math.max(0, prev.animals.length - 1)
      }
    }));
    showToast('Animal record removed.');
  };

  const recordDailyMilk = (milkInput: Omit<MilkRecord, 'id'>) => {
    const milkId = `milk-${Date.now()}`;
    const newRecord: MilkRecord = { ...milkInput, id: milkId };

    let updatedTx = data.transactions;
    if (newRecord.totalRevenue > 0) {
      const autoTx: FinancialTransaction = {
        id: `tx-milk-${Date.now()}`,
        date: newRecord.date,
        type: 'INCOME',
        category: 'Milk Sale',
        amount: newRecord.totalRevenue,
        relatedEntityId: milkId,
        relatedEntityType: 'dairy',
        description: `Milk sale (${newRecord.litersSold}L @ ₹${newRecord.ratePerLiter}/L) to ${newRecord.buyerName}`,
        paymentMode: 'Dairy MPCS Account',
        isAutoGenerated: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      updatedTx = [autoTx, ...updatedTx];
    }

    setData(prev => ({
      ...prev,
      milkRecords: [newRecord, ...prev.milkRecords.filter(m => m.date !== newRecord.date)],
      transactions: updatedTx,
    }));
    showToast(`Milk entry for ${newRecord.date} saved.${newRecord.totalRevenue > 0 ? ` Revenue added (+₹${newRecord.totalRevenue}).` : ''}`);
  };

  const addAnimalHealthRecord = (recInput: Omit<HealthVaccinationRecord, 'id'>) => {
    const newRec: HealthVaccinationRecord = {
      ...recInput,
      id: `health-${Date.now()}`,
    };

    let updatedTx = data.transactions;
    if (newRec.cost > 0) {
      const autoTx: FinancialTransaction = {
        id: `tx-vet-${Date.now()}`,
        date: newRec.date,
        type: 'EXPENSE',
        category: 'Veterinary',
        amount: newRec.cost,
        relatedEntityId: newRec.id,
        relatedEntityType: 'dairy',
        description: `${newRec.recordType} for Tag #${newRec.tagNumber}`,
        paymentMode: 'Cash',
        isAutoGenerated: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      updatedTx = [autoTx, ...updatedTx];
    }

    let updatedTasks = data.tasks;
    if (newRec.nextDueDate) {
      updatedTasks = [
        {
          id: `task-booster-${Date.now()}`,
          title: `Next ${newRec.recordType} due for Cattle #${newRec.tagNumber}`,
          category: 'dairy',
          dueTime: newRec.nextDueDate,
          priority: 'high',
          completed: false,
          sourceModule: 'Dairy Health',
          createdAt: new Date().toISOString().split('T')[0],
        },
        ...updatedTasks
      ];
    }

    setData(prev => ({
      ...prev,
      healthRecords: [newRec, ...prev.healthRecords],
      transactions: updatedTx,
      tasks: updatedTasks,
    }));
    showToast(`Health record saved for Animal #${newRec.tagNumber}.`);
  };

  const logCattleFeedPurchase = (feedInput: Omit<FeedRecord, 'id'>) => {
    const newFeed: FeedRecord = {
      ...feedInput,
      id: `feed-${Date.now()}`,
    };
    const autoTx: FinancialTransaction = {
      id: `tx-feed-${Date.now()}`,
      date: newFeed.date,
      type: 'EXPENSE',
      category: 'Cattle Feed',
      amount: newFeed.totalCost,
      relatedEntityId: newFeed.id,
      relatedEntityType: 'dairy',
      description: `Feed purchase: ${newFeed.quantityKg}kg ${newFeed.feedName}`,
      paymentMode: 'UPI',
      isAutoGenerated: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setData(prev => ({
      ...prev,
      feedRecords: [newFeed, ...prev.feedRecords],
      transactions: [autoTx, ...prev.transactions],
    }));
    showToast(`Feed purchase logged. Ledger updated (-₹${newFeed.totalCost}).`);
  };

  // ---------------- FINANCE WORKFLOW ----------------
  const addTransaction = (txInput: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTx: FinancialTransaction = {
      ...txInput,
      id: `tx-custom-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    showToast(`Transaction added: ${newTx.type === 'INCOME' ? '+₹' : '-₹'}${newTx.amount}`);
  };

  const financialSummary: FinancialSummary = (() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let cropIncome = 0;
    let cropExpense = 0;
    let dairyIncome = 0;
    let dairyExpense = 0;

    data.transactions.forEach(tx => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (tx.relatedEntityType === 'crop' || tx.category === 'Produce Sale') cropIncome += tx.amount;
        if (tx.relatedEntityType === 'dairy' || tx.category === 'Milk Sale') dairyIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (tx.relatedEntityType === 'crop' || tx.category === 'Fertilizer & Pesticide') cropExpense += tx.amount;
        if (tx.relatedEntityType === 'dairy' || tx.category === 'Cattle Feed' || tx.category === 'Veterinary') dairyExpense += tx.amount;
      }
    });

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      pendingReceivables: 3200,
      pendingPayables: 850,
      cropProfit: cropIncome - cropExpense,
      dairyProfit: dairyIncome - dairyExpense,
    };
  })();

  // ---------------- HARVEST TO WAREHOUSE WORKFLOW ----------------
  const harvestCropToInventory = (cropCycleId: string, harvestQuintals: number, warehouseId: string, grade: InventoryItem['grade']) => {
    const crop = data.cropCycles.find(c => c.id === cropCycleId);
    if (!crop) return;

    const updatedCropCycles = data.cropCycles.map(c => 
      c.id === cropCycleId ? { ...c, currentStage: 'Completed' as const, status: 'harvested' as const, actualHarvestQuintals: harvestQuintals } : c
    );

    const newInventoryItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      warehouseId,
      commodityName: crop.cropName,
      variety: crop.variety,
      quantityQuintals: harvestQuintals,
      bagsCount: Math.ceil(harvestQuintals * 2),
      grade,
      entryDate: new Date().toISOString().split('T')[0],
      sourceType: 'Harvest',
      sourceId: cropCycleId,
    };

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId: newInventoryItem.id,
      movementType: 'IN',
      quantityQuintals: harvestQuintals,
      reason: 'Harvest Added',
      date: new Date().toISOString().split('T')[0],
      notes: `Harvested from ${crop.cropName} (${crop.variety})`,
    };

    const updatedWarehouses = data.warehouses.map(wh => 
      wh.id === warehouseId ? { ...wh, usedCapacityQuintals: wh.usedCapacityQuintals + harvestQuintals } : wh
    );

    const newTask: FarmTask = {
      id: `task-mkt-${Date.now()}`,
      title: `Create market listing for ${harvestQuintals} Quintals of ${crop.cropName}`,
      category: 'warehouse',
      dueTime: 'Tomorrow',
      priority: 'high',
      completed: false,
      sourceModule: 'Warehouse',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setData(prev => ({
      ...prev,
      cropCycles: updatedCropCycles,
      inventory: [newInventoryItem, ...prev.inventory],
      movements: [movement, ...prev.movements],
      warehouses: updatedWarehouses,
      tasks: [newTask, ...prev.tasks],
    }));

    showToast(`Harvest of ${harvestQuintals} Qtl transferred to Warehouse. Crop cycle completed!`);
  };

  const adjustInventoryStock = (inventoryItemId: string, deltaQuintals: number, reason: StockMovement['reason']) => {
    const item = data.inventory.find(i => i.id === inventoryItemId);
    if (!item) return;

    if (deltaQuintals < 0 && item.quantityQuintals < Math.abs(deltaQuintals)) {
      showToast("Error: Cannot deduct more than available inventory stock.");
      return;
    }

    const newQty = item.quantityQuintals + deltaQuintals;
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId,
      movementType: deltaQuintals > 0 ? 'IN' : 'OUT',
      quantityQuintals: Math.abs(deltaQuintals),
      reason,
      date: new Date().toISOString().split('T')[0],
    };

    setData(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === inventoryItemId ? { ...i, quantityQuintals: newQty, bagsCount: Math.ceil(newQty * 2) } : i),
      movements: [movement, ...prev.movements],
      warehouses: prev.warehouses.map(wh => wh.id === item.warehouseId ? { ...wh, usedCapacityQuintals: Math.max(0, wh.usedCapacityQuintals + deltaQuintals) } : wh)
    }));

    showToast(`Inventory adjusted: ${deltaQuintals > 0 ? '+' : ''}${deltaQuintals} Qtl (${reason})`);
  };

  const addInventoryStock = (stockInput: Omit<InventoryItem, 'id'>, reason: StockMovement['reason'] = 'Harvest Added') => {
    const newId = `inv-${Date.now()}`;
    const newItem: InventoryItem = {
      ...stockInput,
      id: newId,
      bagsCount: stockInput.bagsCount || Math.ceil(stockInput.quantityQuintals * 2),
    };

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId: newId,
      movementType: 'IN',
      quantityQuintals: newItem.quantityQuintals,
      reason,
      date: newItem.entryDate || new Date().toISOString().split('T')[0],
      notes: `Added ${newItem.quantityQuintals} Quintals of ${newItem.commodityName}`,
    };

    setData(prev => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
      movements: [movement, ...prev.movements],
      warehouses: prev.warehouses.map(wh => 
        wh.id === newItem.warehouseId 
          ? { ...wh, usedCapacityQuintals: wh.usedCapacityQuintals + newItem.quantityQuintals }
          : wh
      )
    }));

    showToast(`Added ${newItem.quantityQuintals} Qtl of ${newItem.commodityName} to inventory.`);
  };

  // ---------------- MARKETPLACE SALE WORKFLOW ----------------
  const createMarketListing = (listingInput: Omit<MarketListing, 'id' | 'sellerFarmerId' | 'createdAt' | 'status'>) => {
    const newListing: MarketListing = {
      ...listingInput,
      id: `list-${Date.now()}`,
      sellerFarmerId: data.profile.id,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      listings: [newListing, ...prev.listings],
    }));
    showToast(`Market listing created for ${newListing.commodityName} @ ₹${newListing.expectedPricePerQuintal}/Qtl`);
  };

  const confirmMarketSale = (listingId: string, soldQuintals: number, finalPricePerQuintal: number, buyerName: string) => {
    const listing = data.listings.find(l => l.id === listingId);
    if (!listing) return;

    const totalSaleAmount = soldQuintals * finalPricePerQuintal;

    let updatedInventory = data.inventory;
    let updatedMovements = data.movements;
    let updatedWarehouses = data.warehouses;

    if (listing.sourceInventoryId) {
      const invItem = data.inventory.find(i => i.id === listing.sourceInventoryId);
      if (invItem) {
        const remainingQty = Math.max(0, invItem.quantityQuintals - soldQuintals);
        updatedInventory = data.inventory.map(i => i.id === listing.sourceInventoryId ? { ...i, quantityQuintals: remainingQty, bagsCount: Math.ceil(remainingQty * 2) } : i);
        
        updatedMovements = [
          {
            id: `mov-sale-${Date.now()}`,
            inventoryItemId: invItem.id,
            movementType: 'OUT',
            quantityQuintals: soldQuintals,
            reason: 'Sold to Market',
            referenceSaleId: listingId,
            date: new Date().toISOString().split('T')[0],
            notes: `Sold to ${buyerName}`,
          },
          ...data.movements
        ];

        updatedWarehouses = data.warehouses.map(wh => 
          wh.id === invItem.warehouseId ? { ...wh, usedCapacityQuintals: Math.max(0, wh.usedCapacityQuintals - soldQuintals) } : wh
        );
      }
    }

    const saleTx: FinancialTransaction = {
      id: `tx-sale-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      category: 'Produce Sale',
      amount: totalSaleAmount,
      relatedEntityId: listingId,
      relatedEntityType: 'warehouse',
      description: `Produce sale: ${soldQuintals} Qtl ${listing.commodityName} to ${buyerName}`,
      paymentMode: 'Bank Transfer',
      isAutoGenerated: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const updatedListings = data.listings.map(l => 
      l.id === listingId ? { ...l, status: 'Sold' as const } : l
    );

    setData(prev => ({
      ...prev,
      inventory: updatedInventory,
      movements: updatedMovements,
      warehouses: updatedWarehouses,
      transactions: [saleTx, ...prev.transactions],
      listings: updatedListings,
    }));

    showToast(`Sale confirmed! +₹${totalSaleAmount.toLocaleString('en-IN')} added to Finance ledger and warehouse inventory deducted.`);
  };

  // ---------------- COMMUNITY WORKFLOW ----------------
  const addCommunityPost = (content: string, category: CommunityPost['category'], scope: CommunityPost['scope']) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: data.profile.id,
      authorName: data.profile.name,
      authorVillage: `${data.profile.location.village}, ${data.profile.location.district}`,
      scope,
      category,
      content,
      likesCount: 0,
      commentsCount: 0,
      createdAt: "Just now",
      hasLiked: false,
    };
    setData(prev => ({
      ...prev,
      communityPosts: [newPost, ...prev.communityPosts],
    }));
    showToast("Your discussion post was published to the farmer community.");
  };

  const togglePostLike = (postId: string) => {
    setData(prev => ({
      ...prev,
      communityPosts: prev.communityPosts.map(p => {
        if (p.id === postId) {
          const isLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked: isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    }));
  };

  // ---------------- TASKS WORKFLOW ----------------
  const createTask = (taskInput: Omit<FarmTask, 'id' | 'createdAt'>) => {
    const newTask: FarmTask = {
      ...taskInput,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    showToast(`Task "${newTask.title}" scheduled.`);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const newState = !t.completed;
          return { ...t, completed: newState };
        }
        return t;
      })
    }));
  };

  const updateTask = (taskId: string, updates: Partial<FarmTask>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    showToast('Task updated successfully.');
  };

  const deleteTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    showToast('Task removed.');
  };

  // ---------------- ONBOARDING COMPLETION WITH DIRECT DATA SEEDING ----------------
  const completeOnboarding = (
    customData: Partial<FarmerProfile>,
    customFields?: FieldInput[],
    customLivestock?: LivestockInput[]
  ) => {
    // Generate actual registered plots & crop cycles from farmer's onboarding input
    const generatedPlots: Plot[] = (customFields && customFields.length > 0)
      ? customFields.map((f, idx) => ({
          id: `plot-${idx + 1}`,
          farmId: 'farm-1',
          name: f.name,
          areaAcres: f.acres,
          soilType: 'Red Loam',
          irrigationSource: 'Drip Irrigation',
          status: 'active' as const,
        }))
      : data.plots;

    const generatedCrops: CropCycle[] = (customFields && customFields.length > 0)
      ? customFields.map((f, idx) => ({
          id: `crop-${idx + 1}`,
          plotId: `plot-${idx + 1}`,
          farmerId: data.profile.id,
          cropName: f.cropName,
          variety: f.variety || 'Hybrid',
          season: 'Kharif',
          sowingDate: '2026-06-15',
          expectedHarvestDate: '2026-11-20',
          currentStage: 'Vegetative',
          healthStatus: 'Good',
          estimatedYieldQuintals: Math.round(f.acres * 15),
          status: 'active' as const,
        }))
      : (customData.farmType === 'dairy' ? [] : data.cropCycles);

    // Generate actual livestock records from onboarding input
    const generatedAnimals: Animal[] = (customLivestock && customLivestock.length > 0)
      ? customLivestock.flatMap((ls, idx) => 
          Array.from({ length: ls.count }).map((_, cIdx) => ({
            id: `animal-${idx}-${cIdx + 1}`,
            tagNumber: `KA-BLR-${100 + idx * 10 + cIdx + 1}`,
            name: `${ls.breed} #${cIdx + 1}`,
            type: ls.type.includes('Buffalo') ? 'Buffalo' : 'Cow',
            breed: ls.breed,
            ageYears: 3,
            healthStatus: 'Healthy',
            milkingStatus: 'Milking',
            dailyAverageYieldLiters: ls.type.includes('Buffalo') ? 8 : 14,
          }))
        )
      : (customData.farmType === 'crop' ? [] : data.animals);

    const totalAcreage = (customFields && customFields.length > 0)
      ? customFields.reduce((sum, f) => sum + f.acres, 0)
      : (customData.landAreaAcres || data.profile.landAreaAcres);

    const totalCattle = (customLivestock && customLivestock.length > 0)
      ? customLivestock.reduce((sum, l) => sum + l.count, 0)
      : (customData.cattleCount || data.profile.cattleCount);

    const finalSession: AuthSession = {
      uid: authSession.uid || `farmer-${Date.now()}`,
      phoneNumber: customData.phoneNumber || authSession.phoneNumber || data.profile.phoneNumber,
      email: customData.email || authSession.email || data.profile.email,
      displayName: customData.name || authSession.displayName || data.profile.name,
      isAuthenticated: true,
    };
    setAuthSession(finalSession);

    const updatedData = {
      ...data,
      profile: {
        ...data.profile,
        ...customData,
        landAreaAcres: totalAcreage,
        cattleCount: totalCattle,
        onboarded: true,
      },
      plots: generatedPlots,
      cropCycles: generatedCrops,
      animals: generatedAnimals,
    };

    setData(updatedData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch {
      // Storage quota safety
    }

    setIsOnboardingComplete(true);
    showToast(`Welcome ${customData.name || data.profile.name}! Your farm setup is complete.`);

    // Sync to persistent SQLite backend database
    backendUpdateProfile({
      name: customData.name || data.profile.name,
      phone_number: customData.phoneNumber || data.profile.phoneNumber,
      state: customData.location?.state || data.profile.location.state,
      district: customData.location?.district || data.profile.location.district,
      village: customData.location?.village || data.profile.location.village,
      farm_type: customData.farmType || data.profile.farmType,
      land_area_acres: totalAcreage,
      cattle_count: totalCattle,
      language: customData.language || data.profile.language,
      onboarded: true,
      ecosystem_data: JSON.stringify({
        plots: generatedPlots,
        cropCycles: generatedCrops,
        animals: generatedAnimals,
      }),
    });
  };

  const resetToOnboarding = () => {
    // Clear onboarded flag and session so the complete journey can be tested from Screen 1
    setIsOnboardingComplete(false);
    removeStoredToken();
    const emptySession: AuthSession = { uid: null, phoneNumber: null, email: null, displayName: null, isAuthenticated: false };
    setAuthSession(emptySession);

    const updatedData = {
      ...data,
      profile: {
        ...data.profile,
        onboarded: false,
      }
    };
    setData(updatedData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch {
      // Ignore
    }
    showToast("Onboarding reset. Starting setup from Screen 1.");
  };

  const logout = async () => {
    // End active authentication session and return to entry screen,
    // preserving farm records in storage so farmer data is not lost.
    await backendLogout();
    await firebaseSignOut();
    removeStoredToken();
    const emptySession: AuthSession = { uid: null, phoneNumber: null, email: null, displayName: null, isAuthenticated: false };
    setAuthSession(emptySession);

    const updatedData = {
      ...data,
      profile: {
        ...data.profile,
        onboarded: false,
      }
    };
    setData(updatedData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch {
      // Storage safety
    }

    setIsOnboardingComplete(false);
    showToast("Logged out successfully. Your farm records are safely stored.");
  };

  const resetToDefaultData = () => {
    const restored = {
      ...initialEcosystemData,
      profile: {
        ...initialEcosystemData.profile,
        onboarded: true,
      }
    };
    setData(restored);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    } catch {}
    setAuthSession({
      uid: 'farmer-01',
      phoneNumber: '9845012345',
      isAuthenticated: true,
    });
    setIsOnboardingComplete(true);
    showToast("Restored Ramesh (Ballari) default farm ecosystem.");
  };

  return (
    <EcosystemContext.Provider
      value={{
        ...data,
        language: data.profile.language,
        setLanguage,
        t,
        isHydrated,
        isOnboardingComplete,
        completeOnboarding,
        resetToOnboarding,
        logout,
        authSession,
        setAuthSession,
        toastMessage,
        showToast,

        addFarm,
        addPlot,
        addCropCycle,
        logCropActivity,
        logDiseaseScan,
        addSoilReport,
        updateCropStage,

        registerAnimal,
        updateAnimal,
        removeAnimal,
        recordDailyMilk,
        addAnimalHealthRecord,
        logCattleFeedPurchase,

        addTransaction,
        financialSummary,

        harvestCropToInventory,
        adjustInventoryStock,
        addInventoryStock,

        createMarketListing,
        confirmMarketSale,

        addCommunityPost,
        togglePostLike,

        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,

        resetToDefaultData,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-150 max-w-[340px] text-center backdrop-blur-md pointer-events-none flex items-center justify-center gap-1.5 font-medium">
          <span>{toastMessage}</span>
        </div>
      )}
    </EcosystemContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error('useFarmer must be used within an EcosystemProvider');
  }
  return context;
};

export const FarmerProvider = EcosystemProvider;
