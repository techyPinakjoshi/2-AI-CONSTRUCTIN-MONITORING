
import { 
  InventoryItem, ProjectStage, CameraFeed, TaskLog, TourLocation, TourSession, 
  ProjectTemplate, ProjectDocument, DocumentFolder, RFI, Vendor, Contract, Submittal 
} from './types';

export const MOCK_FOLDERS: DocumentFolder[] = [
  { id: 'f1', name: 'Architectural Plans', parentId: null },
  { id: 'f2', name: 'Structural Analysis', parentId: null },
  { id: 'f3', name: 'Site Surveys', parentId: null },
  { id: 'f4', name: 'S1 - For Coordination', parentId: 'f1' },
];

export const MOCK_DOCUMENTS: ProjectDocument[] = [
  { id: 'd1', name: 'General_Arrangement_L1', extension: 'PDF', size: '2.4MB', version: 3, status: 'S2', approvalStatus: 'PENDING_REVIEW', author: 'Eng. Sharma', lastModified: '2023-11-20', folderId: 'f1', tags: ['Arch', 'L1'] },
  { id: 'd2', name: 'RCC_Slab_Reinforcement', extension: 'DWG', size: '12.8MB', version: 1, status: 'S1', approvalStatus: 'APPROVED', author: 'Rajesh K.', lastModified: '2023-11-22', folderId: 'f2', tags: ['RCC', 'Structural'] },
  { id: 'd3', name: 'Drone_Survey_Boundary', extension: 'LAS', size: '450MB', version: 1, status: 'S0', approvalStatus: 'APPROVED', author: 'DroneAlpha', lastModified: '2023-11-23', folderId: 'f3', tags: ['Survey'] },
];

export const MOCK_RFIS: RFI[] = [
  { id: 'RFI-001', title: 'Column C24 Rebar Conflict', raisedBy: 'Site Supervisor', assignedTo: 'Structural Lead', dueDate: '2023-11-28', status: 'OPEN', priority: 'HIGH', type: 'RFI' },
  { id: 'RFI-002', title: 'MEP Clearance at Grid 4', raisedBy: 'Piping Eng.', assignedTo: 'Project Manager', dueDate: '2023-11-30', status: 'PENDING_APPROVAL', priority: 'MEDIUM', type: 'RFI' },
  { id: 'RFI-003', title: 'Basement Level 2 Waterproofing Clarification', raisedBy: 'Site Lead', assignedTo: 'Civil Eng', dueDate: '2023-12-05', status: 'OPEN', priority: 'MEDIUM', type: 'RFI' },
];

export const MOCK_SUBMITTALS: Submittal[] = [
  { id: 'SUB-101', title: 'External Facade Glass Samples', specSection: '08 80 00', assignedTo: 'Architect', dueDate: '2023-11-25', status: 'UNDER_REVIEW', priority: 'MEDIUM' },
  { id: 'SUB-102', title: 'Shop Drawings: Staircase A Steelwork', specSection: '05 12 00', assignedTo: 'Structural PM', dueDate: '2023-11-20', status: 'OPEN', priority: 'HIGH' },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'TATA Steel', category: 'Reinforcement', rating: 4.8, status: 'QUALIFIED', complianceScore: 98 },
  { id: 'v2', name: 'UltraTech Cement', category: 'Binding Agents', rating: 4.9, status: 'QUALIFIED', complianceScore: 95 },
  { id: 'v3', name: 'Global Scaffolding', category: 'Shuttering', rating: 3.2, status: 'UNDER_REVIEW', complianceScore: 70 },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'CON-101', title: 'Main Structural Works', vendorName: 'L&T Construction', value: 45000000, utilized: 12000000, variations: 500000, status: 'ACTIVE' },
  { id: 'CON-102', title: 'MEP Installation L1-L5', vendorName: 'Sterling & Wilson', value: 8500000, utilized: 0, variations: 0, status: 'PENDING' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Cement Bags (50kg)', quantity: 450, unit: 'bags', minThreshold: 100, lastUpdated: '2023-10-26 09:00' },
  { id: '2', name: 'Steel Rebar (12mm)', quantity: 2500, unit: 'kg', minThreshold: 500, lastUpdated: '2023-10-25 14:30' },
  { id: '3', name: 'Aggregates (20mm)', quantity: 120, unit: 'tons', minThreshold: 20, lastUpdated: '2023-10-26 08:15' },
  { id: '4', name: 'Red Bricks', quantity: 15000, unit: 'pcs', minThreshold: 5000, lastUpdated: '2023-10-24 11:00' },
];

export const STAGES: ProjectStage[] = [
  ProjectStage.SURVEY,
  ProjectStage.EXCAVATION,
  ProjectStage.FOUNDATION,
  ProjectStage.STRUCTURAL,
  ProjectStage.MEP,
  ProjectStage.FACADE,
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'residential',
    name: 'Residential High-Rise',
    description: 'Optimized for housing projects with heavy emphasis on structural columns and interior MEP layers.',
    icon: 'Home',
    defaultLayers: { structural: true, electrical: true, pipes: true, interiors: true },
    recommendedStages: [ProjectStage.STRUCTURAL, ProjectStage.MEP, ProjectStage.FACADE]
  },
  {
    id: 'commercial',
    name: 'Commercial Complex',
    description: 'Designed for offices and malls with complex facade monitoring and extensive structural grids.',
    icon: 'Building',
    defaultLayers: { structural: true, facade: true, electrical: true, bimSlice: true },
    recommendedStages: [ProjectStage.EXCAVATION, ProjectStage.STRUCTURAL, ProjectStage.FACADE]
  },
  {
    id: 'industrial',
    name: 'Industrial Plant',
    description: 'Focused on site survey, massive excavation tracking, and large-scale structural assembly.',
    icon: 'Factory',
    defaultLayers: { structural: true, pipes: true, excavationBlue: true, excavationGreen: true },
    recommendedStages: [ProjectStage.SURVEY, ProjectStage.EXCAVATION, ProjectStage.FOUNDATION]
  }
];

export const MOCK_CAMERAS: CameraFeed[] = [
  { 
    id: 'CAM-01', 
    name: 'North Tower - Crane View', 
    type: 'FIXED', 
    status: 'RECORDING', 
    location: 'Sector A', 
    lastSync: 'Live',
    activeZones: ['Structural Columns', 'Slab Casting'],
    streamType: 'YOUTUBE',
    streamUrl: 'https://www.youtube.com/embed/86YLFOog4GM?autoplay=1&mute=1&controls=0&loop=1&playlist=86YLFOog4GM'
  },
  { 
    id: 'CAM-02', 
    name: 'Excavation Pit B', 
    type: 'FIXED', 
    status: 'RECORDING', 
    location: 'Basement Level 2', 
    lastSync: 'Live',
    activeZones: ['Soil Removal', 'Retaining Wall'],
    streamType: 'DIRECT',
    streamUrl: 'https://cdn.coverr.co/videos/coverr-construction-site-with-cranes-2646/1080p.mp4'
  },
  { 
    id: 'DRONE-ALPHA', 
    name: 'Survey Drone Alpha', 
    type: 'DRONE', 
    status: 'IDLE', 
    location: 'Perimeter Boundary', 
    lastSync: '2h ago',
    activeZones: ['Topography', 'Excavation Vol'],
    streamType: 'STATIC'
  },
  { 
    id: 'ROVER-01', 
    name: 'Interior Lidar Rover', 
    type: 'ROVER', 
    status: 'OFFLINE', 
    location: 'Lobby', 
    lastSync: '1d ago',
    activeZones: ['Flooring', 'Electrical'],
    streamType: 'STATIC'
  }
];

export const MOCK_TASK_LOGS: TaskLog[] = [
  {
    id: 'TASK-101',
    taskName: 'Site Clearing & Grading (Sector A)',
    stage: ProjectStage.SURVEY,
    startTime: '2023-10-01T08:00:00',
    endTime: '2023-10-03T16:30:00',
    durationHours: 56.5,
    status: 'COMPLETED',
    verifiedBy: 'Eng. Sharma',
    totalCost: 45000,
    materials: [
      { name: 'Diesel Fuel (JCB)', quantity: 200, unit: 'L', unitRate: 90, totalCost: 18000 },
      { name: 'Labor (Unskilled)', quantity: 45, unit: 'man-days', unitRate: 600, totalCost: 27000 }
    ]
  },
  {
    id: 'TASK-102',
    taskName: 'Excavation - North Pit',
    stage: ProjectStage.EXCAVATION,
    startTime: '2023-10-05T07:00:00',
    endTime: '2023-10-12T18:00:00',
    durationHours: 180,
    status: 'COMPLETED',
    verifiedBy: 'Eng. Sharma',
    totalCost: 125000,
    materials: [
      { name: 'JCB Rental', quantity: 80, unit: 'hrs', unitRate: 1200, totalCost: 96000 },
      { name: 'Truck Trips (Soil Disposal)', quantity: 50, unit: 'trips', unitRate: 500, totalCost: 25000 },
      { name: 'Safety Barriers', quantity: 20, unit: 'pcs', unitRate: 200, totalCost: 4000 }
    ]
  },
  {
    id: 'TASK-103',
    taskName: 'PCC Pouring - Foundation B1',
    stage: ProjectStage.FOUNDATION,
    startTime: '2023-10-15T09:00:00',
    endTime: '2023-10-15T15:00:00',
    durationHours: 6,
    status: 'COMPLETED',
    verifiedBy: 'Eng. Rajesh',
    totalCost: 62000,
    materials: [
      { name: 'Cement (OPC)', quantity: 80, unit: 'bags', unitRate: 400, totalCost: 32000 },
      { name: 'Sand', quantity: 200, unit: 'cu.ft', unitRate: 50, totalCost: 10000 },
      { name: 'Aggregates (40mm)', quantity: 150, unit: 'cu.ft', unitRate: 60, totalCost: 9000 },
      { name: 'Labor', quantity: 10, unit: 'man-days', unitRate: 800, totalCost: 8000 }
    ]
  }
];

export const TOUR_LOCATIONS: Record<string, TourLocation> = {
  'LOC-A': {
    id: 'LOC-A',
    name: 'Main Entrance / Gate A',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    links: [{ targetId: 'LOC-B', label: 'Go to North Tower', x: 50, y: 50 }]
  },
  'LOC-B': {
    id: 'LOC-B',
    name: 'North Tower - L1 Slab',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop',
    links: [{ targetId: 'LOC-A', label: 'Back to Gate', x: 20, y: 80 }]
  }
};

export const INITIAL_TOUR_SESSIONS: TourSession[] = [
  {
    id: 'SESS-001',
    name: 'Weekly Safety Walkthrough',
    date: '2023-11-20',
    duration: '14m 20s',
    steps: [
      { locationId: 'LOC-A', locationName: 'Main Entrance', timestamp: '2023-11-20T10:00:00Z' },
      { locationId: 'LOC-B', locationName: 'North Tower', timestamp: '2023-11-20T10:05:00Z' },
      { locationId: 'LOC-A', locationName: 'Main Entrance', timestamp: '2023-11-20T10:14:20Z' }
    ]
  }
];
