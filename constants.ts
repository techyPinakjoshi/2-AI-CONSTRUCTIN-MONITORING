import { InventoryItem, ProjectStage, CameraFeed, TaskLog, TourLocation, TourSession } from './types';

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
    lastSync: 'Live',
    activeZones: ['Structural Columns', 'Slab Casting'],
    streamType: 'YOUTUBE',
    // Using a construction time-lapse/live example from YouTube
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
    // Using a reliable stock video link for direct playback
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
        name: 'Main Lobby Entry',
        imageUrl: 'https://images.unsplash.com/photo-1590059390048-c8a77d7045c7?q=80&w=2608&auto=format&fit=crop', // Construction Interior
        links: [
            { targetId: 'LOC-B', label: 'Move to Corridor', x: 70, y: 60 },
            { targetId: 'LOC-C', label: 'Exit to Site', x: 20, y: 55 }
        ]
    },
    'LOC-B': {
        id: 'LOC-B',
        name: 'Service Corridor L1',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop', // Concrete hallway
        links: [
            { targetId: 'LOC-A', label: 'Return to Lobby', x: 40, y: 70 },
            { targetId: 'LOC-D', label: 'Inspect MEP Room', x: 80, y: 50 }
        ]
    },
    'LOC-C': {
        id: 'LOC-C',
        name: 'Exterior Perimeter',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop', // Outdoor construction
        links: [
            { targetId: 'LOC-A', label: 'Enter Building', x: 50, y: 65 }
        ]
    },
    'LOC-D': {
        id: 'LOC-D',
        name: 'MEP Control Room',
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2669&auto=format&fit=crop', // Industrial room
        links: [
            { targetId: 'LOC-B', label: 'Back to Corridor', x: 30, y: 70 }
        ]
    }
};

export const INITIAL_TOUR_SESSIONS: TourSession[] = [
    {
        id: 'SESS-001',
        name: 'Weekly Safety Walk',
        date: '2023-10-25',
        duration: '14m 20s',
        steps: [
            { locationId: 'LOC-A', locationName: 'Main Lobby Entry', timestamp: '2023-10-25T09:00:00' },
            { locationId: 'LOC-B', locationName: 'Service Corridor L1', timestamp: '2023-10-25T09:05:12' },
            { locationId: 'LOC-D', locationName: 'MEP Control Room', timestamp: '2023-10-25T09:12:45' }
        ]
    }
];