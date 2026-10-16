import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { Template } from '@/types/template';

export class DocxGenerator {
  /**
   * Generiert ein DOCX-Dokument aus einem Template und den eingegebenen Daten
   */
  static async generateDocx(template: Template, data: Record<string, string | boolean | number>): Promise<Blob> {
    try {
      // DOCX-Template erstellen (vereinfachte Version)
      const docContent = this.createDocxContent(template, data);
      
      // Für eine echte DOCX-Generierung bräuchten wir ein echtes DOCX-Template
      // Als Alternative erstellen wir eine strukturierte Textdatei mit DOCX-ähnlicher Formatierung
      const blob = new Blob([docContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      return blob;
    } catch (error) {
      console.error('Fehler bei der DOCX-Generierung:', error);
      throw error;
    }
  }
  
  /**
   * Erstellt den Inhalt für das DOCX-Dokument
   */
  private static createDocxContent(template: Template, data: Record<string, string | boolean | number>): string {
    let content = '';
    
    // Dokumentenkopf
    content += `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    content += `<document>\n`;
    content += `  <header>\n`;
    content += `    <title>${this.escapeXml(template.name)}</title>\n`;
    content += `    <description>${this.escapeXml(template.description)}</description>\n`;
    content += `    <date>${new Date().toLocaleDateString('de-DE')}</date>\n`;
    content += `    <category>${this.escapeXml(template.category)}</category>\n`;
    content += `  </header>\n\n`;
    
    // Dokumenteninhalt
    content += `  <content>\n`;
    
    template.sections.forEach((section, sectionIndex) => {
      content += `    <section id="${section.id}" order="${sectionIndex}">\n`;
      content += `      <title>${this.escapeXml(section.title)}</title>\n`;
      if (section.description) {
        content += `      <description>${this.escapeXml(section.description)}</description>\n`;
      }
      
      content += `      <fields>\n`;
      section.fields.forEach((field, fieldIndex) => {
        const value = data[field.id];
        const displayValue = this.formatValue(value, field.type);
        
        content += `        <field id="${field.id}" type="${field.type}" required="${field.required || false}" order="${fieldIndex}">\n`;
        content += `          <label>${this.escapeXml(field.label)}</label>\n`;
        content += `          <value>${this.escapeXml(displayValue)}</value>\n`;
        if (field.placeholder) {
          content += `          <placeholder>${this.escapeXml(field.placeholder)}</placeholder>\n`;
        }
        content += `        </field>\n`;
      });
      content += `      </fields>\n`;
      content += `    </section>\n\n`;
    });
    
    content += `  </content>\n`;
    
    // Metadaten
    content += `  <metadata>\n`;
    content += `    <templateId>${template.id}</templateId>\n`;
    content += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`;
    content += `    <fieldCount>${template.sections.reduce((acc, section) => acc + section.fields.length, 0)}</fieldCount>\n`;
    content += `    <filledFields>${Object.values(data).filter(v => v !== '' && v !== false && v !== 0).length}</filledFields>\n`;
    content += `  </metadata>\n`;
    
    content += `</document>`;
    
    return content;
  }
  
  /**
   * Erstellt eine menschenlesbare Textversion des Dokuments
   */
  static generateTextDocument(template: Template, data: Record<string, string | boolean | number>): string {
    let content = '';
    
    // Dokumententitel
    content += `${template.name}\n`;
    content += '='.repeat(template.name.length) + '\n\n';
    
    // Beschreibung
    content += `${template.description}\n\n`;
    
    // Metadaten
    content += `Dokument erstellt am: ${new Date().toLocaleDateString('de-DE')}\n`;
    content += `Kategorie: ${template.category}\n`;
    content += `Template: ${template.name}\n\n`;
    
    // Abschnitte und Felder
    template.sections.forEach(section => {
      content += `${section.title}\n`;
      content += '-'.repeat(section.title.length) + '\n';
      
      if (section.description) {
        content += `${section.description}\n\n`;
      }
      
      section.fields.forEach(field => {
        const value = data[field.id];
        const displayValue = this.formatValue(value, field.type);
        
        // Nur nicht-leere Felder anzeigen
        if (displayValue !== '' && displayValue !== 'Nein') {
          content += `${field.label}: ${displayValue}\n`;
        }
      });
      
      content += '\n';
    });
    
    // Zusammenfassung
    const totalFields = template.sections.reduce((acc, section) => acc + section.fields.length, 0);
    const filledFields = Object.values(data).filter(v => v !== '' && v !== false && v !== 0).length;
    
    content += '\n' + '='.repeat(50) + '\n';
    content += 'ZUSAMMENFASSUNG\n';
    content += '='.repeat(50) + '\n';
    content += `Ausgefüllte Felder: ${filledFields} von ${totalFields}\n`;
    content += `Vervollständigungsgrad: ${totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0}%\n`;
    
    return content;
  }
  
  /**
   * Formatiert Werte entsprechend ihrem Typ
   */
  private static formatValue(value: string | boolean | number | undefined, type: string): string {
    if (value === undefined || value === null) return '';
    
    switch (type) {
      case 'checkbox':
        return value === true ? 'Ja' : 'Nein';
      case 'date':
        if (typeof value === 'string' && value) {
          return new Date(value).toLocaleDateString('de-DE');
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toString() : String(value);
      default:
        return String(value);
    }
  }
  
  /**
   * Escaped XML-Sonderzeichen
   */
  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
  
  /**
   * Exportiert das Dokument als Datei
   */
  static async exportDocument(
    template: Template, 
    data: Record<string, string | boolean | number>,
    format: 'docx' | 'txt' = 'txt'
  ): Promise<void> {
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'docx') {
        blob = await this.generateDocx(template, data);
        filename = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xml`;
      } else {
        const textContent = this.generateTextDocument(template, data);
        blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        filename = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      }
      
      saveAs(blob, filename);
    } catch (error) {
      console.error('Fehler beim Export:', error);
      throw error;
    }
  }
}