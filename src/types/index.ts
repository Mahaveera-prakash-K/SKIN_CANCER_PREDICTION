export type UserRole = 'ADMIN' | 'DOCTOR' | 'RESEARCHER' | 'STUDENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  prediction_count?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DermoscopicFeatures {
  asymmetry_index: number;
  border_irregularity: number;
  color_variegation: number;
  estimated_diameter_mm: number;
  pigment_network: string;
}

export interface ExplainabilityData {
  original_image: string;
  heatmap: string;
  overlay: string;
  layer_name?: string;
  method: string;
  explanation_note: string;
}

export interface PredictionResult {
  prediction_id: number;
  predicted_class: string;
  predicted_class_name: string;
  confidence: number;
  probabilities: Record<string, number>;
  dermoscopic_features?: DermoscopicFeatures;
  model: {
    name: string;
    version: string;
    architecture?: string;
    powered_by_gemini?: boolean;
    clinical_reasoning?: string;
  };
  clinical_reasoning?: string;
  explainability: ExplainabilityData;
  disclaimer: string;
  created_at: string;
}

export interface PredictionRecord {
  id: number;
  user_id: number;
  image_path: string;
  predicted_class: string;
  predicted_class_name: string;
  confidence: number;
  probabilities: Record<string, number>;
  model_name: string;
  model_version: string;
  explainability_heatmap_path?: string;
  explainability_overlay_path?: string;
  dermoscopic_features?: DermoscopicFeatures;
  clinical_reasoning?: string;
  notes?: string;
  created_at: string;
}

export interface ModelMetricsSummary {
  test_accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  weighted_precision: number;
  weighted_recall: number;
  weighted_f1: number;
  roc_auc_ovr: number;
  macro_sensitivity: number;
  macro_specificity: number;
}

export interface ModelVersion {
  model_id: string;
  model_name: string;
  architecture: string;
  version: string;
  is_active: boolean;
  parameters: number;
  input_shape: number[];
  inference_time_ms: number;
  training_epochs: number;
  early_stopped_epoch?: number;
  optimizer: string;
  loss_function: string;
  metrics: ModelMetricsSummary;
  class_metrics?: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    sensitivity: number;
    specificity: number;
    roc_auc: number;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  database: string;
  model_loaded: boolean;
  model_name: string;
  model_version: string;
  app_name: string;
  app_version: string;
  disclaimer: string;
}
