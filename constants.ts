
import { 
  InventoryItem, ProjectStage, CameraFeed, TaskLog, TourLocation, TourSession, 
  ProjectTemplate, ProjectDocument, DocumentFolder, RFI, Vendor, Contract, Submittal 
} from './types';

export const MOCK_FOLDERS: DocumentFolder[] = [];

// Production-ready empty state - User must upload or AI must extract
export const MOCK_DOCUMENTS: ProjectDocument[] = [];
export const MOCK_RFIS: RFI[] = [];
export const MOCK_SUBMITTALS: Submittal[] = [];
export const MOCK_VENDORS: Vendor[] = [];
export const MOCK_CONTRACTS: Contract[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

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

export const MOCK_CAMERAS: CameraFeed[] = [];
export const MOCK_TASK_LOGS: TaskLog[] = [];
export const TOUR_LOCATIONS: Record<string, TourLocation> = {};
export const INITIAL_TOUR_SESSIONS: TourSession[] = [];
