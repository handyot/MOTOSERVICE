import {
  detectElectricalHazards as coreDetectElectricalHazards,
  executeDiagnosticEvaluation as coreExecuteDiagnosticEvaluation,
} from './voltia-core.mjs';
import {
  DiagnosticSymptom,
  VoltIADiagnosisResult,
  VoltIASafetyAlert,
} from '@/types';

export interface DiagnoseRequest {
  symptom: DiagnosticSymptom;
  brand?: string;
  model?: string;
  voltageV?: number;
  userInput?: string;
  answers?: Record<string, string>;
}

export const detectElectricalHazards = coreDetectElectricalHazards as (text: string) => VoltIASafetyAlert | null;
export const executeDiagnosticEvaluation = coreExecuteDiagnosticEvaluation as (req: DiagnoseRequest) => VoltIADiagnosisResult;
