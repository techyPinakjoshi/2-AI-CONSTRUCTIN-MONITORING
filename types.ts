
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
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type UserRole = 'MAKER' | 'CHECKER' | 'VIEWER';
export type WorkflowType = 'RFI' | 'SUBMITTAL' | 'INSPECTION' | 'CHANGE_ORDER';

export type ViewMode = 'ORBIT' | 'SPLIT' | 'TOUR';

// CDE & Document Management
export interface ProjectDocument {
  id: string;
  name: string;
  extension: string;
  size: string;
  version: number;
  status: 'S0' | 'S1' | 'S2' | 'S3' | 'S4'; // ISO 19650 standards
  approvalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  author: string;
  checker?: string;
  lastModified: string;
  folderId: string;
  tags: string[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
}

// Collaboration & Workflows
export interface RFI {
  id: string;
  title: string;
  raisedBy: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING_APPROVAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type?: WorkflowType;
}

export interface Submittal {
  id: string;
  title: string;
  specSection: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'APPROVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Procurement & Suppliers
export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: 'QUALIFIED' | 'UNDER_REVIEW' | 'BLACKLISTED';
  complianceScore: number;
}

// Financials & Contracts
export interface Contract {
  id: string;
  title: string;
  vendorName: string;
  value: number;
  utilized: number;
  variations: number;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
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
