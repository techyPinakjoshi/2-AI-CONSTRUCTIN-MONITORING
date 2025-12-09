import { InventoryItem, ProjectStage, CameraFeed, TaskLog } from './types';

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

export const MOCK_CAMERAS: CameraFeed[] = [
  { 
    id: 'CAM-01', 
    name: 'North Tower - Crane View', 
    type: 'FIXED', 
    status: 'RECORDING', 
    location: 'Sector A', 
    lastSync: 'Just now',
    activeZones: ['Structural Columns', 'Slab Casting']
  },
  { 
    id: 'DRONE-ALPHA', 
    name: 'Survey Drone Alpha', 
    type: 'DRONE', 
    status: 'IDLE', 
    location: 'Perimeter Boundary', 
    lastSync: '2h ago',
    activeZones: ['Topography', 'Excavation Vol']
  },
  { 
    id: 'CAM-02', 
    name: 'Excavation Pit B', 
    type: 'FIXED', 
    status: 'RECORDING', 
    location: 'Basement Level 2', 
    lastSync: '10s ago',
    activeZones: ['Soil Removal', 'Retaining Wall']
  },
  { 
    id: 'ROVER-01', 
    name: 'Interior Lidar Rover', 
    type: 'ROVER', 
    status: 'OFFLINE', 
    location: 'Lobby', 
    lastSync: '1d ago',
    activeZones: ['Flooring', 'Electrical']
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