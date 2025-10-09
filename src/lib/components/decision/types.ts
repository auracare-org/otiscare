export type DecisionNode = {
  id: string;
  type: 'decision';
  title?: string;
  question?: string;
  details?: unknown;
  yes?: TreeNode;
  no?: TreeNode;
  choices?: Array<{ label: string; next: TreeNode }>;
  options?: Array<{ label: string; next: TreeNode }>;
  child?: TreeNode;
  additional?: unknown;
};

export type ActionNode = {
  id: string;
  type: 'action';
  title?: string;
  actions?: string[];
  safetyNet?: boolean;
};

export type TreatmentNode = {
  id: string;
  type: 'treatment';
  title?: string;
  drug?: string;
  durationDays?: number;
  dose?: unknown;
  formulations?: string[];
  route?: string;
  legalCategory?: string;
  plus?: string[];
  followUp?: string;
  safetyNet?: boolean;
  referralIfWorsen?: boolean;
  inherits?: string;
};

export type TreeNode = DecisionNode | ActionNode | TreatmentNode;

export type PatientHistory = {
  age?: number;
  durationDays?: number;
  bilateral?: boolean;
  otorrhoea?: boolean;
  penicillinAllergy?: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  fever?: boolean;
};

