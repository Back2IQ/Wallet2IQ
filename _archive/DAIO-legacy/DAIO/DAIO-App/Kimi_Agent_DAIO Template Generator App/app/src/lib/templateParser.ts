import type { Template, ParsedTemplate } from '@/types/template';

export class TemplateParser {
  /**
   * Parst die TXT-Datei und extrahiert alle Templates
   */
  static parseTemplatesFromFile(fileContent: string): ParsedTemplate[] {
    const templates: ParsedTemplate[] = [];
    const lines = fileContent.split('\n');
    
    let currentTemplate: Partial<ParsedTemplate> = {};
    let currentContent: string[] = [];
    let inTemplate = false;
    let templateStartLine = 0;
    
    // Reguläre Ausdrücke für Template-Erkennung
    const templateHeaderRegex = /^- ([\w\s\-]+) Template$/;
    const purposeRegex = /^Purpose: (.+)$/;
    const usageRegex = /^Usage: (.+)$/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Template-Header erkennen
      const headerMatch = line.match(templateHeaderRegex);
      if (headerMatch) {
        // Vorheriges Template speichern
        if (inTemplate && currentTemplate.name) {
          templates.push({
            name: currentTemplate.name!,
            description: currentTemplate.description || '',
            category: currentTemplate.category || 'General',
            content: currentContent.join('\n'),
            rawText: lines.slice(templateStartLine, i).join('\n')
          });
        }
        
        // Neues Template beginnen
        currentTemplate = {
          name: headerMatch[1].trim(),
          description: '',
          category: this.categorizeTemplate(headerMatch[1])
        };
        currentContent = [];
        inTemplate = true;
        templateStartLine = i;
        continue;
      }
      
      // Purpose-Zeile
      if (inTemplate) {
        const purposeMatch = line.match(purposeRegex);
        if (purposeMatch) {
          currentTemplate.description = purposeMatch[1];
          continue;
        }
        
        // Usage-Zeile (überspringen)
        const usageMatch = line.match(usageRegex);
        if (usageMatch) {
          continue;
        }
        
        // Leere Zeilen am Anfang überspringen
        if (line === '' && currentContent.length === 0) {
          continue;
        }
        
        // Template-Inhalt sammeln
        if (line !== '') {
          currentContent.push(line);
        }
      }
    }
    
    // Letztes Template speichern
    if (inTemplate && currentTemplate.name) {
      templates.push({
        name: currentTemplate.name,
        description: currentTemplate.description || '',
        category: currentTemplate.category || 'General',
        content: currentContent.join('\n'),
        rawText: lines.slice(templateStartLine).join('\n')
      });
    }
    
    return templates;
  }
  
  /**
   * Kategorisiert Templates basierend auf dem Namen
   */
  private static categorizeTemplate(templateName: string): string {
    const name = templateName.toLowerCase();
    
    if (name.includes('onboarding') || name.includes('client')) {
      return 'Onboarding';
    }
    if (name.includes('inventory') || name.includes('asset')) {
      return 'Asset Management';
    }
    if (name.includes('container') || name.includes('inheritance')) {
      return 'Inheritance Planning';
    }
    if (name.includes('consent') || name.includes('protection')) {
      return 'Legal & Compliance';
    }
    if (name.includes('checklist')) {
      return 'Process Management';
    }
    if (name.includes('expectation') || name.includes('management')) {
      return 'Client Relations';
    }
    
    return 'General';
  }
  
  /**
   * Konvertiert ein geparstes Template in ein strukturiertes Template-Objekt
   */
  static convertToStructuredTemplate(parsedTemplate: ParsedTemplate, id: string): Template {
    // Felder aus dem Template-Inhalt extrahieren
    const sections = this.extractSections(parsedTemplate.content);
    
    return {
      id,
      name: parsedTemplate.name,
      description: parsedTemplate.description,
      category: parsedTemplate.category,
      sections,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false
    };
  }
  
  /**
   * Extrahiert Sektionen und Felder aus dem Template-Inhalt
   */
  private static extractSections(content: string): Template['sections'] {
    const sections: Template['sections'] = [];
    const lines = content.split('\n');
    
    let currentSection: Partial<Template['sections'][0]> = {
      id: 'main',
      title: 'Main Information',
      fields: []
    };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Überschriften erkennen (in Großbuchstaben oder mit ====)
      if (this.isSectionHeader(trimmedLine)) {
        // Vorherige Sektion speichern
        if (currentSection.fields && currentSection.fields.length > 0) {
          sections.push(currentSection as Template['sections'][0]);
        }
        
        // Neue Sektion beginnen
        currentSection = {
          id: this.generateSectionId(trimmedLine),
          title: trimmedLine.replace(/=+$/, '').trim(),
          fields: []
        };
        continue;
      }
      
      // Platzhalter-Felder erkennen ([PLACEHOLDER])
      const field = this.extractField(trimmedLine);
      if (field && currentSection.fields) {
        currentSection.fields.push(field);
      }
    }
    
    // Letzte Sektion speichern
    if (currentSection.fields && currentSection.fields.length > 0) {
      sections.push(currentSection as Template['sections'][0]);
    }
    
    // Wenn keine Sektionen gefunden wurden, eine Standard-Sektion erstellen
    if (sections.length === 0) {
      sections.push({
        id: 'main',
        title: 'Main Information',
        fields: this.extractAllFields(content)
      });
    }
    
    return sections;
  }
  
  /**
   * Prüft, ob eine Zeile eine Sektionsüberschrift ist
   */
  private static isSectionHeader(line: string): boolean {
    return line.length > 3 && (
      line === line.toUpperCase() || // Alles Großbuchstaben
      line.endsWith('=====') || // Unterstrichene Überschrift
      line.endsWith('-----') || // Gedankenstrich-Überschrift
      line.match(/^[A-Z][A-Z\s]+$/) !== null // Nur Großbuchstaben und Leerzeichen
    );
  }
  
  /**
   * Generiert eine ID für eine Sektion
   */
  private static generateSectionId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }
  
  /**
   * Extrahiert ein einzelnes Feld aus einer Zeile
   */
  private static extractField(line: string): Template['sections'][0]['fields'][0] | null {
    // Platzhalter in eckigen Klammern erkennen
    const placeholderRegex = /\[([A-Z][A-Z_\s]+)\]/g;
    const match = placeholderRegex.exec(line);
    
    if (match) {
      const placeholder = match[1];
      const label = placeholder
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        id: placeholder.toLowerCase().replace(/\s+/g, '_'),
        label,
        type: this.determineFieldType(placeholder),
        required: line.includes('*') || line.includes('(required)'),
        placeholder: label
      };
    }
    
    return null;
  }
  
  /**
   * Extrahiert alle Felder aus dem gesamten Inhalt
   */
  private static extractAllFields(content: string): Template['sections'][0]['fields'] {
    const fields: Template['sections'][0]['fields'][0][] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const field = this.extractField(line.trim());
      if (field && !fields.some(f => f.id === field.id)) {
        fields.push(field);
      }
    }
    
    return fields;
  }
  
  /**
   * Bestimmt den Feldtyp basierend auf dem Platzhalternamen
   */
  private static determineFieldType(placeholder: string): Template['sections'][0]['fields'][0]['type'] {
    const lower = placeholder.toLowerCase();
    
    if (lower.includes('date') || lower.includes('birth')) {
      return 'date';
    }
    if (lower.includes('email')) {
      return 'email';
    }
    if (lower.includes('number') || lower.includes('amount') || lower.includes('value')) {
      return 'number';
    }
    if (lower.includes('description') || lower.includes('notes') || lower.includes('comments')) {
      return 'textarea';
    }
    if (lower.includes('yes') || lower.includes('no') || lower.includes('checkbox')) {
      return 'checkbox';
    }
    
    return 'text';
  }
}