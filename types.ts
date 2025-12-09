export enum ProjectStage {
  SURVEY = 'Site Survey',
  EXCAVATION = 'Excavation',
  FOUNDATION = 'Foundation',
  STRUCTURAL = 'Structural',
  MEP = 'MEP & Interiors',
  FACADE = 'Facade'
}

export enum WorkStatus {
  PENDING = 'PENDING', // Red
  IN_PROGRESS = 'IN_PROGRESS', // Blue
  COMPLETED = 'COMPLETED' // Green
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastUpdated: string;
}

export interface SiteMeasurement {
  label: string;
  value: string;
  unit: string;
  delta?: string; // Change from last survey
}

export interface LayerVisibility {
  structural: boolean;
  pipes: boolean;
  electrical: boolean;
  interiors: boolean;
  facade: boolean;
  excavationRed: boolean; // Planned
  excavationGreen: boolean; // Done
  excavationBlue: boolean; // In Progress
}

export type DataSourceType = 'BIM' | 'CAD' | 'ConAI' | 'MANUAL' | null;

export interface LayerMetadata {
  id: keyof LayerVisibility;
  hasData: boolean;
  source: DataSourceType;
  lastSynced?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  actionRequired?: boolean;
}

export interface ProgressUpdate {
  timestamp: string;
  description: string;
  percentage: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  type: 'DRONE' | 'FIXED' | 'ROVER';
  status: 'RECORDING' | 'IDLE' | 'OFFLINE';
  location: string;
  lastSync: string;
  activeZones: string[]; // e.g., ['Zone A - Excavation', 'Zone B - Rebar']
}

// New Types for Progress & BOQ
export interface MaterialUsage {
  name: string;
  quantity: number;
  unit: string;
  unitRate: number; // Currency per unit
  totalCost: number;
}

export interface TaskLog {
  id: string;
  taskName: string;
  stage: ProjectStage;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  durationHours: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  materials: MaterialUsage[];
  totalCost: number;
  verifiedBy: string;
}