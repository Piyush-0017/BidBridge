export interface GeMBoqItem {
  item: string;
  qty: number;
  unit: string;
  specs: string;
  estimatedRate: number;
}

export interface GeMTenderOpportunity {
  bidNumber: string;
  title: string;
  ministry: string;
  department: string;
  category: "Goods" | "Services" | "Works";
  estimatedCost: number;
  emdAmount: number;
  startDate: string;
  endDate: string;
  localContentMin: number;
  raEnabled: boolean; // Reverse Auction
  isSynced: boolean;
  boqItems: GeMBoqItem[];
  gemPortalUrl: string;
}

export const OFFICIAL_GEM_CATALOGUE: GeMTenderOpportunity[] = [
  {
    bidNumber: "GEM/2025/B/902184",
    title: "Supply, Deployment and Facility Management of High-Availability Enterprise Server Cluster",
    ministry: "Ministry of Electronics and Information Technology (MeitY)",
    department: "National Informatics Centre (NIC)",
    category: "Goods",
    estimatedCost: 12500000,
    emdAmount: 250000,
    startDate: "2025-03-01T10:00:00.000Z",
    endDate: "2025-03-22T17:00:00.000Z",
    localContentMin: 50,
    raEnabled: true,
    isSynced: true,
    boqItems: [
      { item: "Enterprise Rack Server (2U, Dual Intel Xeon, 512GB ECC RAM)", qty: 6, unit: "Units", specs: "RAID-6 NVMe Storage, Redundant 1100W Titanium PSU", estimatedRate: 1500000 },
      { item: "100GbE Managed Top-of-Rack Switch", qty: 2, unit: "Units", specs: "Layer-3 Low Latency Switching with redundant fans", estimatedRate: 1250000 },
      { item: "3-Year 24x7 Mission Critical OEM On-Site Support", qty: 1, unit: "Package", specs: "4-hour call-to-resolution SLA with quarterly health audits", estimatedRate: 1000000 },
    ],
    gemPortalUrl: "https://bidplus.gem.gov.in/showbidDocument/902184",
  },
  {
    bidNumber: "GEM/2025/B/881234",
    title: "Automated Smart City Surveillance & Edge AI Video Analytics Command Platform",
    ministry: "Ministry of Home Affairs",
    department: "Directorate of Urban Security & Police Modernization",
    category: "Works",
    estimatedCost: 20558000,
    emdAmount: 411160,
    startDate: "2025-02-15T09:00:00.000Z",
    endDate: "2025-03-18T18:00:00.000Z",
    localContentMin: 60,
    raEnabled: true,
    isSynced: true,
    boqItems: [
      { item: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom", qty: 50, unit: "Nos", specs: "NDAA Compliant, IK10 Vandal Resistant, IR 150m", estimatedRate: 120000 },
      { item: "64-Channel Enterprise NVR Array with 128TB Raw Storage", qty: 4, unit: "Units", specs: "H.265+ Compression, Hot-Swappable Enterprise SAS Drives", estimatedRate: 650000 },
      { item: "Edge AI License for Automated Number Plate Recognition (ANPR)", qty: 50, unit: "Licenses", specs: "Real-time accuracy > 96% at vehicle speeds up to 120 km/h", estimatedRate: 239160 },
    ],
    gemPortalUrl: "https://bidplus.gem.gov.in/showbidDocument/881234",
  },
  {
    bidNumber: "GEM/2025/B/6124100",
    title: "Comprehensive Annual Maintenance Contract (CAMC) for Network & Optical Fiber Infrastructure",
    ministry: "Ministry of Railways",
    department: "Northern Railway Zone (Signaling & Telecom Division)",
    category: "Services",
    estimatedCost: 4800000,
    emdAmount: 96000,
    startDate: "2025-02-28T10:00:00.000Z",
    endDate: "2025-03-25T15:30:00.000Z",
    localContentMin: 50,
    raEnabled: false,
    isSynced: true,
    boqItems: [
      { item: "Annual Maintenance of Core Optical Fiber Network & Routers", qty: 1, unit: "Year", specs: "Preventive maintenance, 99.9% uptime SLA", estimatedRate: 3000000 },
      { item: "Certified Resident Network Security Engineers", qty: 2, unit: "Persons", specs: "CCNA / CCNP Security Certified, 24/7 rotational shifts", estimatedRate: 900000 },
    ],
    gemPortalUrl: "https://bidplus.gem.gov.in/showbidDocument/6124100",
  },
  {
    bidNumber: "GEM/2025/B/7239011",
    title: "Supply and Commissioning of Tier-III Mobile Container Data Center Units",
    ministry: "Ministry of Defence",
    department: "Defence Research & Development Organisation (DRDO)",
    category: "Goods",
    estimatedCost: 38500000,
    emdAmount: 770000,
    startDate: "2025-03-05T11:00:00.000Z",
    endDate: "2025-04-02T16:00:00.000Z",
    localContentMin: 65,
    raEnabled: true,
    isSynced: false,
    boqItems: [
      { item: "Ruggedized 20ft ISO Mobile Container with Precision Cooling", qty: 2, unit: "Units", specs: "N+1 In-Row DX Cooling, FM-200 Fire Suppression", estimatedRate: 15000000 },
      { item: "120kVA Modular Online UPS with Lithium Iron Phosphate Banks", qty: 2, unit: "Units", specs: "Unity power factor, 30-minute full load runtime", estimatedRate: 4250000 },
    ],
    gemPortalUrl: "https://bidplus.gem.gov.in/showbidDocument/7239011",
  },
  {
    bidNumber: "GEM/2025/B/9541202",
    title: "AI-Powered Electronic Toll Collection & Weigh-In-Motion Sensor Network",
    ministry: "Ministry of Road Transport & Highways",
    department: "National Highways Authority of India (NHAI)",
    category: "Works",
    estimatedCost: 52000000,
    emdAmount: 1040000,
    startDate: "2025-03-10T12:00:00.000Z",
    endDate: "2025-04-08T18:00:00.000Z",
    localContentMin: 55,
    raEnabled: true,
    isSynced: false,
    boqItems: [
      { item: "High-Speed Quartz Weigh-In-Motion Sensors", qty: 16, unit: "Lanes", specs: "OIML R60 Class 0.5 accuracy at highway speeds", estimatedRate: 2000000 },
      { item: "Fastag RFID Overhead Readers & AVC Laser Sensors", qty: 16, unit: "Lanes", specs: "EPC Gen2 Class 1 Compliant with 99.8% read rate", estimatedRate: 1250000 },
    ],
    gemPortalUrl: "https://bidplus.gem.gov.in/showbidDocument/9541202",
  },
];

/**
 * Fetch available GeM bids with sync state
 */
export function getAvailableGeMTenders(search?: string): GeMTenderOpportunity[] {
  if (!search) return OFFICIAL_GEM_CATALOGUE;
  const q = search.toLowerCase();
  return OFFICIAL_GEM_CATALOGUE.filter(
    (t) =>
      t.bidNumber.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.ministry.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q)
  );
}

/**
 * Find single GeM tender by bidNumber
 */
export function findGeMTender(bidNumber: string): GeMTenderOpportunity | undefined {
  return OFFICIAL_GEM_CATALOGUE.find((t) => t.bidNumber === bidNumber);
}
