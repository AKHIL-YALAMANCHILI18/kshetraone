import { 
  FarmerProfile, Farm, Plot, CropCycle, CropActivity, DiseaseDetectionRecord, SoilHealthReport,
  Animal, MilkRecord, HealthVaccinationRecord, FeedRecord,
  FinancialTransaction, Warehouse, InventoryItem, StockMovement,
  MandiRate, MarketListing, BuyerRequirement, CommunityPost, FarmTask
} from '@/types';

export interface EcosystemState {
  profile: FarmerProfile;
  farms: Farm[];
  plots: Plot[];
  cropCycles: CropCycle[];
  cropActivities: CropActivity[];
  diseaseScans: DiseaseDetectionRecord[];
  soilReports: SoilHealthReport[];
  animals: Animal[];
  milkRecords: MilkRecord[];
  healthRecords: HealthVaccinationRecord[];
  feedRecords: FeedRecord[];
  transactions: FinancialTransaction[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  mandiRates: MandiRate[];
  listings: MarketListing[];
  buyerRequirements: BuyerRequirement[];
  communityPosts: CommunityPost[];
  tasks: FarmTask[];
}

export const initialEcosystemData: EcosystemState = {
  profile: {
    id: "farmer-01",
    name: "Basavaraj Patil",
    phoneNumber: "9845012345",
    location: {
      state: "Karnataka",
      district: "Mandya",
      taluk: "Maddur",
      village: "Gejjalagere",
      pincode: "571428"
    },
    farmType: "mixed",
    landAreaAcres: 3.5,
    cattleCount: 4,
    language: "kn",
    onboarded: false,
  },
  farms: [
    {
      id: "farm-1",
      farmerId: "farmer-01",
      name: "Lakshmi Nilaya Farm",
      surveyNumber: "142/2A",
      village: "Gejjalagere",
      totalAreaAcres: 3.5,
      ownership: "owned",
      createdAt: "2025-01-10",
    }
  ],
  plots: [
    {
      id: "plot-1",
      farmId: "farm-1",
      name: "Plot 1 - North Canal Field",
      areaAcres: 2.0,
      soilType: "Red Loam",
      irrigationSource: "Drip Irrigation",
      status: "active",
    },
    {
      id: "plot-2",
      farmId: "farm-1",
      name: "Plot 2 - Borewell Field",
      areaAcres: 1.5,
      soilType: "Sandy Loam",
      irrigationSource: "Borewell",
      status: "active",
    }
  ],
  cropCycles: [
    {
      id: "crop-1",
      plotId: "plot-1",
      farmerId: "farmer-01",
      cropName: "Sugarcane (ಕಬ್ಬು)",
      variety: "Co 86032",
      season: "Kharif",
      sowingDate: "2026-03-15",
      expectedHarvestDate: "2027-02-28",
      currentStage: "Vegetative",
      healthStatus: "Excellent",
      estimatedYieldQuintals: 750,
      status: "active",
    },
    {
      id: "crop-2",
      plotId: "plot-2",
      farmerId: "farmer-01",
      cropName: "Finger Millet / Ragi (ರಾಗಿ)",
      variety: "GPU 28",
      season: "Kharif",
      sowingDate: "2026-07-10",
      expectedHarvestDate: "2026-11-20",
      currentStage: "Flowering",
      healthStatus: "Good",
      estimatedYieldQuintals: 30,
      status: "active",
    }
  ],
  cropActivities: [
    {
      id: "act-1",
      cropCycleId: "crop-1",
      activityType: "Fertilizer",
      date: "2026-09-28",
      cost: 1450,
      inputUsed: "19:19:19 Water Soluble Fertilizer",
      quantityUsed: "25 kg",
      notes: "Applied via drip venturi along with micronutrients.",
      loggedAt: "2026-09-28 17:00",
    },
    {
      id: "act-2",
      cropCycleId: "crop-2",
      activityType: "Weeding",
      date: "2026-09-18",
      cost: 1200,
      inputUsed: "Manual labor",
      quantityUsed: "3 person-days",
      notes: "Second weeding done before panicle initiation.",
      loggedAt: "2026-09-18 16:30",
    }
  ],
  diseaseScans: [
    {
      id: "scan-1",
      cropName: "Sugarcane",
      detectedDisease: "Early Shoot Borer (Mild)",
      confidenceScore: 89.4,
      severity: "Low",
      recommendedActions: [
        "Earthing up soil around canes at 35-45 days",
        "Pheromone traps installation (5 per acre)",
        "Spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L only if ETL crosses 15%"
      ],
      isDemoInference: true,
      loggedAt: "2026-09-25 11:20",
    }
  ],
  soilReports: [
    {
      id: "soil-1",
      plotId: "plot-1",
      sampleDate: "2026-02-15",
      ph: 6.8,
      nitrogenKgPerHa: 240,
      phosphorusKgPerHa: 24,
      potassiumKgPerHa: 280,
      organicCarbonPercent: 0.65,
      soilHealthIndex: "Optimal",
      cropSuitability: ["Sugarcane", "Paddy", "Maize", "Banana"],
    }
  ],
  animals: [
    {
      id: "animal-1",
      tagNumber: "KA-MND-101",
      name: "Gauri",
      type: "Cow",
      breed: "Holstein Friesian Cross",
      ageYears: 4,
      healthStatus: "Healthy",
      milkingStatus: "Milking",
      dailyAverageYieldLiters: 16.5,
      lastVaccinationDate: "2026-05-10",
    },
    {
      id: "animal-2",
      tagNumber: "KA-MND-102",
      name: "Kaveri",
      type: "Cow",
      breed: "Jersey Cross",
      ageYears: 3,
      healthStatus: "Healthy",
      milkingStatus: "Milking",
      dailyAverageYieldLiters: 14.0,
      lastVaccinationDate: "2026-05-10",
    },
    {
      id: "animal-3",
      tagNumber: "KA-MND-103",
      name: "Ganga",
      type: "Buffalo",
      breed: "Murrah",
      ageYears: 5,
      healthStatus: "Healthy",
      milkingStatus: "Milking",
      dailyAverageYieldLiters: 8.5,
      lastVaccinationDate: "2026-05-10",
    },
    {
      id: "animal-4",
      tagNumber: "KA-MND-104",
      name: "Chinnu",
      type: "Cow",
      breed: "HF Calf/Heifer",
      ageYears: 1,
      healthStatus: "Healthy",
      milkingStatus: "Heifer",
      dailyAverageYieldLiters: 0,
      lastVaccinationDate: "2026-07-15",
    }
  ],
  milkRecords: [
    {
      id: "milk-rec-today",
      date: "2026-10-03",
      morningLiters: 18.5,
      eveningLiters: 14.0,
      totalLiters: 32.5,
      avgFat: 4.2,
      avgSnf: 8.6,
      litersSold: 30.0,
      litersRetained: 2.5,
      ratePerLiter: 35.0,
      totalRevenue: 1050.0,
      buyerName: "Gejjalagere MPCS (KMF)",
      isConfirmed: true,
    },
    {
      id: "milk-rec-yesterday",
      date: "2026-10-02",
      morningLiters: 19.0,
      eveningLiters: 14.5,
      totalLiters: 33.5,
      avgFat: 4.3,
      avgSnf: 8.7,
      litersSold: 31.0,
      litersRetained: 2.5,
      ratePerLiter: 35.5,
      totalRevenue: 1100.5,
      buyerName: "Gejjalagere MPCS (KMF)",
      isConfirmed: true,
    }
  ],
  healthRecords: [
    {
      id: "health-1",
      animalId: "animal-1",
      tagNumber: "KA-MND-101",
      recordType: "Vaccination",
      description: "Foot and Mouth Disease (FMD) Bi-annual booster",
      date: "2026-05-10",
      cost: 50,
      nextDueDate: "2026-11-10",
      vetName: "Dr. Suresh (Animal Husbandry Dept)",
    },
    {
      id: "health-2",
      animalId: "animal-4",
      tagNumber: "KA-MND-104",
      recordType: "Deworming",
      description: "Albendazole oral suspension (Deworming)",
      date: "2026-08-05",
      cost: 120,
      nextDueDate: "2026-11-05",
      vetName: "Dr. Suresh",
    }
  ],
  feedRecords: [
    {
      id: "feed-1",
      feedName: "Nandini Cattle Feed Pellets (50 kg)",
      quantityKg: 50,
      costPerKg: 24,
      totalCost: 1200,
      date: "2026-09-30",
      notes: "Procured from milk cooperative society store",
    }
  ],
  transactions: [
    {
      id: "tx-1",
      date: "2026-10-03",
      type: "INCOME",
      category: "Milk Sale",
      amount: 1050,
      relatedEntityId: "milk-rec-today",
      relatedEntityType: "dairy",
      description: "Morning & evening milk supply (30L @ ₹35/L) to MPCS",
      paymentMode: "Dairy MPCS Account",
      isAutoGenerated: true,
      createdAt: "2026-10-03 12:30",
    },
    {
      id: "tx-2",
      date: "2026-10-02",
      type: "INCOME",
      category: "Milk Sale",
      amount: 1100.5,
      relatedEntityId: "milk-rec-yesterday",
      relatedEntityType: "dairy",
      description: "Milk supply 31L to MPCS",
      paymentMode: "Dairy MPCS Account",
      isAutoGenerated: true,
      createdAt: "2026-10-02 18:45",
    },
    {
      id: "tx-3",
      date: "2026-09-30",
      type: "EXPENSE",
      category: "Cattle Feed",
      amount: 1200,
      relatedEntityId: "feed-1",
      relatedEntityType: "dairy",
      description: "Purchased 50kg Nandini Cattle Feed Pellets",
      paymentMode: "UPI",
      isAutoGenerated: true,
      createdAt: "2026-09-30 14:00",
    },
    {
      id: "tx-4",
      date: "2026-09-28",
      type: "EXPENSE",
      category: "Fertilizer & Pesticide",
      amount: 1450,
      relatedEntityId: "act-1",
      relatedEntityType: "crop",
      description: "19:19:19 Fertilizer for Sugarcane Plot A",
      paymentMode: "Cash",
      isAutoGenerated: true,
      createdAt: "2026-09-28 17:05",
    }
  ],
  warehouses: [
    {
      id: "wh-1",
      name: "Gejjalagere Farm Home Godown",
      location: "Gejjalagere, Mandya",
      totalCapacityQuintals: 150,
      usedCapacityQuintals: 45,
      storageType: "Dry Godown",
    }
  ],
  inventory: [
    {
      id: "inv-1",
      warehouseId: "wh-1",
      commodityName: "Finger Millet / Ragi (Previous Harvest)",
      variety: "GPU 28",
      quantityQuintals: 25.0,
      bagsCount: 50,
      grade: "A - Grade 1",
      entryDate: "2025-12-10",
      sourceType: "Harvest",
    },
    {
      id: "inv-2",
      warehouseId: "wh-1",
      commodityName: "Dry Paddy (Sona Masoori)",
      variety: "BPT 5204",
      quantityQuintals: 20.0,
      bagsCount: 40,
      grade: "B - Fair Avg Quality",
      entryDate: "2026-01-05",
      sourceType: "Harvest",
    }
  ],
  movements: [
    {
      id: "mov-1",
      inventoryItemId: "inv-1",
      movementType: "IN",
      quantityQuintals: 25.0,
      reason: "Harvest Added",
      date: "2025-12-10",
      notes: "Bags stored after solar drying (12% moisture).",
    }
  ],
  mandiRates: [
    {
      id: "mandi-1",
      mandiName: "Mandya APMC Market",
      district: "Mandya",
      commodity: "Ragi",
      modalPricePerQuintal: 3850,
      minPrice: 3600,
      maxPrice: 4100,
      arrivalsMetricTon: 14.5,
      updatedDate: "2026-10-03",
      isDemoData: true,
    },
    {
      id: "mandi-2",
      mandiName: "Maddur APMC Sub-Yard",
      district: "Mandya",
      commodity: "Sugarcane (Jaggery Raw)",
      modalPricePerQuintal: 3200,
      minPrice: 3050,
      maxPrice: 3350,
      arrivalsMetricTon: 62.0,
      updatedDate: "2026-10-03",
      isDemoData: true,
    },
    {
      id: "mandi-3",
      mandiName: "Mysuru Bandipalya Market",
      district: "Mysuru",
      commodity: "Paddy (Medium)",
      modalPricePerQuintal: 2480,
      minPrice: 2350,
      maxPrice: 2650,
      arrivalsMetricTon: 45.0,
      updatedDate: "2026-10-03",
      isDemoData: true,
    }
  ],
  listings: [
    {
      id: "list-1",
      sellerFarmerId: "farmer-01",
      commodityName: "Finger Millet / Ragi",
      variety: "GPU 28 Clean Grain",
      quantityQuintals: 15.0,
      expectedPricePerQuintal: 3900,
      location: "Gejjalagere, Mandya",
      status: "Active",
      sourceInventoryId: "inv-1",
      createdAt: "2026-10-01",
    }
  ],
  buyerRequirements: [
    {
      id: "req-1",
      buyerName: "Mandya Organic Farmers Producer Co.",
      buyerType: "FPO Aggregator",
      commodityName: "Finger Millet / Ragi",
      targetQuantityQuintals: 100,
      offeredPricePerQuintal: 3950,
      deliveryLocation: "Maddur Depot (12 km)",
      distanceKm: 12,
      estimatedTransportCostPerQtl: 45,
    },
    {
      id: "req-2",
      buyerName: "Sri Venkateshwara Agro Mills",
      buyerType: "Processor",
      commodityName: "Paddy (Sona Masoori)",
      targetQuantityQuintals: 250,
      offeredPricePerQuintal: 2550,
      deliveryLocation: "Mandya Industrial Area (9 km)",
      distanceKm: 9,
      estimatedTransportCostPerQtl: 35,
    }
  ],
  communityPosts: [
    {
      id: "post-1",
      authorId: "farmer-99",
      authorName: "Nagaraju Kempanna",
      authorVillage: "Keragodu, Mandya",
      scope: "district",
      category: "Crops",
      content: "ಬೆಲ್ಲ ತಯಾರಿಸುವವರಿಗೆ ಮಾಹಿತಿ: ಮದ್ದೂರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕಬ್ಬಿನ ಬೆಲ್ಲಕ್ಕೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹3,400 ಕ್ಕೂ ಹೆಚ್ಚು ದರ ಸಿಗುತ್ತಿದೆ. ಕಟಾವು ಮಾಡುವವರು ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.",
      likesCount: 18,
      commentsCount: 4,
      createdAt: "3 hours ago",
      hasLiked: false,
    },
    {
      id: "post-2",
      authorId: "farmer-88",
      authorName: "Anand Gowda",
      authorVillage: "Besagarahalli, Maddur",
      scope: "state",
      category: "Dairy",
      content: "ಹೈನುಗಾರರಿಗೆ ಎಚ್ಚರಿಕೆ: ಈ ಋತುವಿನಲ್ಲಿ ಜಾನುವಾರುಗಳಲ್ಲಿ ಕಾಲುಬಾಯಿ ಜ್ವರ (FMD) ಲಸಿಕೆ ಹಾಕಿಸದಿದ್ದರೆ ತಕ್ಷಣ ಸ್ಥಳೀಯ ಪಶು ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ. ಲಸಿಕೆ ಉಚಿತವಾಗಿದೆ.",
      likesCount: 32,
      commentsCount: 9,
      createdAt: "Yesterday",
      hasLiked: true,
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Drip fertigation for Sugarcane Plot A",
      category: "crop",
      dueTime: "04:00 PM",
      priority: "high",
      completed: false,
      sourceModule: "Agriculture",
      createdAt: "2026-10-03",
    },
    {
      id: "task-2",
      title: "Evening milk collection at Gejjalagere MPCS",
      category: "dairy",
      dueTime: "06:30 PM",
      priority: "high",
      completed: false,
      sourceModule: "Dairy",
      createdAt: "2026-10-03",
    },
    {
      id: "task-3",
      title: "Check moisture in stored Ragi bags in Godown",
      category: "warehouse",
      dueTime: "Tomorrow 10:00 AM",
      priority: "medium",
      completed: false,
      sourceModule: "Warehouse",
      createdAt: "2026-10-03",
    },
    {
      id: "task-4",
      title: "FMD Booster vaccination for Cow #101 & Heifer #104",
      category: "dairy",
      dueTime: "Tomorrow 02:00 PM",
      priority: "high",
      completed: false,
      sourceModule: "Dairy",
      createdAt: "2026-10-03",
    }
  ]
};
