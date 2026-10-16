import type { Template, ParsedTemplate } from '@/types/template';
import { TemplateParser } from './templateParser';
import { DocxGenerator } from './docxGenerator';

export class TemplateService {
  private static templates: Template[] = [];
  private static customTemplates: Template[] = [];
  
  /**
   * Lädt alle Templates aus der TXT-Datei
   */
  static async loadTemplates(): Promise<Template[]> {
    try {
      // TXT-Datei laden
      const response = await fetch('/Digital Asset Inheritance PlaybookENx.txt');
      const text = await response.text();
      
      // Templates parsen
      const parsedTemplates = TemplateParser.parseTemplatesFromFile(text);
      
      // In strukturierte Templates konvertieren
      this.templates = parsedTemplates.map((parsedTemplate, index) => 
        TemplateParser.convertToStructuredTemplate(parsedTemplate, `template_${index + 1}`)
      );
      
      // Benutzerdefinierte Templates laden
      this.loadCustomTemplates();
      
      return [...this.templates, ...this.customTemplates];
    } catch (error) {
      console.error('Fehler beim Laden der Templates:', error);
      return [];
    }
  }
  
  /**
   * Gibt alle verfügbaren Templates zurück
   */
  static getAllTemplates(): Template[] {
    return [...this.templates, ...this.customTemplates];
  }
  
  /**
   * Findet ein Template anhand der ID
   */
  static getTemplateById(id: string): Template | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }
  
  /**
   * Gibt Templates nach Kategorie gruppiert zurück
   */
  static getTemplatesByCategory(): Record<string, Template[]> {
    const templates = this.getAllTemplates();
    const grouped: Record<string, Template[]> = {};
    
    templates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });
    
    return grouped;
  }
  
  /**
   * Sucht Templates nach Name oder Beschreibung
   */
  static searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    );
  }
  
  /**
   * Erstellt ein neues benutzerdefiniertes Template
   */
  static createCustomTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    const newTemplate: Template = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true
    };
    
    this.customTemplates.push(newTemplate);
    this.saveCustomTemplates();
    
    return newTemplate;
  }
  
  /**
   * Aktualisiert ein benutzerdefiniertes Template
   */
  static updateCustomTemplate(id: string, updates: Partial<Template>): Template | null {
    const index = this.customTemplates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.customTemplates[index] = {
      ...this.customTemplates[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveCustomTemplates();
    return this.customTemplates[index];
  }
  
  /**
   * Löscht ein benutzerdefiniertes Template
   */
  static deleteCustomTemplate(id: string): boolean {
    const initialLength = this.customTemplates.length;
    this.customTemplates = this.customTemplates.filter(t => t.id !== id);
    
    if (this.customTemplates.length < initialLength) {
      this.saveCustomTemplates();
      return true;
    }
    
    return false;
  }
  
  /**
   * Lädt benutzerdefinierte Templates aus localStorage
   */
  private static loadCustomTemplates(): void {
    try {
      const saved = localStorage.getItem('customTemplates');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.customTemplates = parsed.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Fehler beim Laden der benutzerdefinierten Templates:', error);
      this.customTemplates = [];
    }
  }
  
  /**
   * Speichert benutzerdefinierte Templates in localStorage
   */
  private static saveCustomTemplates(): void {
    try {
      localStorage.setItem('customTemplates', JSON.stringify(this.customTemplates));
    } catch (error) {
      console.error('Fehler beim Speichern der benutzerdefinierten Templates:', error);
    }
  }
  
  /**
   * Exportiert Template-Daten als DOCX
   */
  static async exportToDocx(template: Template, data: Record<string, string>): Promise<Blob> {
    return DocxGenerator.generateDocx(template, data);
  }
  
  /**
   * Exportiert Template-Daten als Textdatei
   */
  static exportToText(template: Template, data: Record<string, string>): string {
    return DocxGenerator.generateTextDocument(template, data);
  }
  
  /**
   * Exportiert und lädt das Dokument herunter
   */
  static async exportAndDownload(
    template: Template, 
    data: Record<string, string | boolean | number>,
    format: 'docx' | 'txt' = 'txt'
  ): Promise<void> {
    return DocxGenerator.exportDocument(template, data, format);
  }
}