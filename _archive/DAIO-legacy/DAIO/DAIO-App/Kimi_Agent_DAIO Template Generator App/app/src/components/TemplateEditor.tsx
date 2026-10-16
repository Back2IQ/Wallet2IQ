import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Hash,
  Type,
  Calendar,
  CheckSquare,
  List
} from 'lucide-react';
import type { Template, TemplateField, TemplateSection } from '@/types/template';
import { TemplateService } from '@/lib/templateService';
import { v4 as uuidv4 } from 'uuid';

interface TemplateEditorProps {
  template?: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [sections, setSections] = useState<TemplateSection[]>(template?.sections || [
    {
      id: 'main',
      title: 'Hauptinformationen',
      fields: []
    }
  ]);

  const fieldTypes = [
    { value: 'text', label: 'Textfeld', icon: Type },
    { value: 'textarea', label: 'Mehrzeiliger Text', icon: Type },
    { value: 'number', label: 'Zahl', icon: Hash },
    { value: 'date', label: 'Datum', icon: Calendar },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'select', label: 'Auswahlliste', icon: List },
    { value: 'email', label: 'E-Mail', icon: Type }
  ];

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `section_${uuidv4()}`,
      title: `Neuer Abschnitt ${sections.length + 1}`,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const addField = (sectionId: string) => {
    const newField: TemplateField = {
      id: `field_${uuidv4()}`,
      label: 'Neues Feld',
      type: 'text',
      required: false
    };
    
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : section
    ));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Bitte gib einen Namen für das Template ein.');
      return;
    }

    const newTemplate: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      sections: sections.filter(section => section.fields.length > 0)
    };

    if (template?.id) {
      // Update existing template
      const updated = TemplateService.updateCustomTemplate(template.id, newTemplate);
      if (updated) {
        onSave(updated);
      }
    } else {
      // Create new template
      const created = TemplateService.createCustomTemplate(newTemplate);
      onSave(created);
    }
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {template ? 'Template bearbeiten' : 'Neues Template erstellen'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Erstelle ein benutzerdefiniertes Template für deine Dokumente
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template-Eigenschaften */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template-Eigenschaften</CardTitle>
              <CardDescription>
                Grundlegende Informationen zum Template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name des Templates"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibung des Templates"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Kategorie</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">Allgemein</SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                    <SelectItem value="Asset Management">Vermögensverwaltung</SelectItem>
                    <SelectItem value="Inheritance Planning">Erbschaftsplanung</SelectItem>
                    <SelectItem value="Legal & Compliance">Rechtliches & Compliance</SelectItem>
                    <SelectItem value="Process Management">Prozessmanagement</SelectItem>
                    <SelectItem value="Client Relations">Kundenbeziehungen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Abschnitte:</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Felder gesamt:</span>
                  <span className="font-medium">
                    {sections.reduce((acc, section) => acc + section.fields.length, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abschnitte und Felder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Abschnitte und Felder</CardTitle>
                  <CardDescription>
                    Strukturiere dein Template in Abschnitte mit verschiedenen Feldern
                  </CardDescription>
                </div>
                <Button onClick={addSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Abschnitt hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          placeholder="Abschnittsname"
                          className="text-lg font-medium"
                        />
                        <Textarea
                          value={section.description || ''}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          placeholder="Beschreibung (optional)"
                          className="mt-2 text-sm"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(section.id)}
                        className="ml-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {section.fields.map((field) => {
                        const Icon = getFieldIcon(field.type);
                        return (
                          <Card key={field.id} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Feldname</label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                    placeholder="Anzeigename des Feldes"
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Feldtyp</label>
                                  <Select 
                                    value={field.type} 
                                    onValueChange={(value: any) => updateField(section.id, field.id, { type: value })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fieldTypes.map((fieldType) => {
                                        const IconComponent = fieldType.icon;
                                        return (
                                          <SelectItem key={fieldType.value} value={fieldType.value}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className="h-4 w-4" />
                                              {fieldType.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Platzhalter</label>
                                  <Input
                                    value={field.placeholder || ''}
                                    onChange={(e) => updateField(section.id, field.id, { placeholder: e.target.value })}
                                    placeholder="Platzhalter-Text"
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="flex items-end">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={field.required || false}
                                      onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium">Pflichtfeld</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(section.id, field.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Feld entfernen
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <Button 
                      onClick={() => addField(section.id)} 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Feld hinzufügen
                    </Button>
                  </div>
                ))}
              </div>
              
              {sections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Füge deinem Template den ersten Abschnitt hinzu</p>
                  <Button onClick={addSection} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Abschnitt erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}