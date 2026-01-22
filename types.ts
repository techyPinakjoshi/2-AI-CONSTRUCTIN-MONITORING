
export enum ProjectStage {
  SURVEY = 'Site Survey',
  EXCAVATION = 'Excavation',
  FOUNDATION = 'Foundation',
  STRUCTURAL = 'Structural',
  MEP = 'MEP & Interiors',
  FACADE = 'Facade'
}

export enum WorkStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export type ViewMode = 'ORBIT' | 'SPLIT' | 'TOUR';

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
  delta?: string;
}

export interface LayerVisibility {
  structural: boolean;
  pipes: boolean;
  electrical: boolean;
  interiors: boolean;
  facade: boolean;
  excavationRed: boolean;
  excavationGreen: boolean;
  excavationBlue: boolean;
  bimSlice: boolean;
}

export type DataSourceType = 'BIM' | 'CAD' | 'ConAI' | 'MANUAL' | 'RECONSTRUCTED' | null;

export interface LayerMetadata {
  id: keyof LayerVisibility;
  hasData: boolean;
  source: DataSourceType;
  lastSynced?: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  type: 'DRONE' | 'FIXED' | 'ROVER';
  status: 'RECORDING' | 'IDLE' | 'OFFLINE';
  location: string;
  lastSync: string;
  activeZones: string[];
  streamUrl?: string;
  streamType?: 'YOUTUBE' | 'DIRECT' | 'STATIC';
}

export interface MaterialUsage {
  name: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalCost: number;
}

export interface TaskLog {
  id: string;
  taskName: string;
  stage: ProjectStage;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  materials: MaterialUsage[];
  totalCost: number;
  verifiedBy: string;
}

export interface ManualProgressLog {
  id: string;
  timestamp: string;
  imageUrl: string;
  comment: string;
  aiFeedback?: string;
  stage: ProjectStage;
}

export interface AiLogEntry {
    id: string;
    timestamp: string;
    cameraName: string;
    description: string;
    detectedObjects: string[];
}

export interface AiDetection {
    id: string;
    label: string;
    status: 'WORKING' | 'IDLE' | 'MOVING';
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TourLocation {
    id: string;
    name: string;
    imageUrl: string;
    links: { targetId: string; label: string; x: number; y: number }[];
}

export interface TourStep {
    locationId: string;
    locationName: string;
    timestamp: string;
}

export interface TourSession {
    id: string;
    name: string;
    date: string;
    duration: string;
    steps: TourStep[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultLayers: Partial<LayerVisibility>;
  recommendedStages: ProjectStage[];
}
