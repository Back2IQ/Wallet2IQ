export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select' | 'email';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // Für Select-Felder
  defaultValue?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: TemplateSection[];
  createdAt: Date;
  updatedAt: Date;
  isCustom?: boolean; // Ob es ein benutzerdefiniertes Template ist
}

export interface TemplateData {
  [key: string]: string | boolean | number | string[];
}

export interface ParsedTemplate {
  name: string;
  description: string;
  category: string;
  content: string;
  rawText: string;
}