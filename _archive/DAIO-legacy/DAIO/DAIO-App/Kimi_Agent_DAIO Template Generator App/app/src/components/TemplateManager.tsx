import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  Plus, 
  FileText, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import type { Template } from '@/types/template';
import { TemplateService } from '@/lib/templateService';

interface TemplateManagerProps {
  onEditTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
  onTemplateSelect: (template: Template) => void;
}

export function TemplateManager({ onEditTemplate, onCreateTemplate, onTemplateSelect }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const loadedTemplates = await TemplateService.loadTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Fehler beim Laden der Templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Möchtest du das Template "${templateName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    setDeletingId(templateId);
    try {
      const success = TemplateService.deleteCustomTemplate(templateId);
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } else {
        alert('Fehler beim Löschen des Templates.');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setDeletingId(null);
    }
  };

  const customTemplates = templates.filter(t => t.isCustom);
  const systemTemplates = templates.filter(t => !t.isCustom);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Templates werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template-Verwaltung</h1>
          <p className="text-muted-foreground mt-2">
            Verwalte deine benutzerdefinierten Templates
          </p>
        </div>
        <Button onClick={onCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Template
        </Button>
      </div>

      {/* Benutzerdefinierte Templates */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Benutzerdefinierte Templates</h2>
          <Badge variant="secondary">{customTemplates.length}</Badge>
        </div>
        
        {customTemplates.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Noch keine benutzerdefinierten Templates</h3>
              <p className="text-muted-foreground mb-4">
                Erstelle dein erstes benutzerdefiniertes Template
              </p>
              <Button onClick={onCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Template erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description || 'Keine Beschreibung'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Benutzerdefiniert</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline">
                        {template.sections.length} Abschnitt{template.sections.length !== 1 ? 'e' : ''}
                      </Badge>
                      <Badge variant="outline">
                        {template.sections.reduce((acc, section) => acc + section.fields.length, 0)} Felder
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Erstellt: {template.createdAt.toLocaleDateString('de-DE')}
                      </div>
                      {template.updatedAt > template.createdAt && (
                        <div className="flex items-center gap-1 mt-1">
                          <Edit className="h-4 w-4" />
                          Geändert: {template.updatedAt.toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onTemplateSelect(template)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Verwenden
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id, template.name)}
                        disabled={deletingId === template.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === template.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* System-Templates */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">System-Templates</h2>
          <Badge variant="outline">{systemTemplates.length}</Badge>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">System-Templates sind schreibgeschützt</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Diese Templates stammen aus der ursprünglichen Playbook-Datei und können nicht bearbeitet oder gelöscht werden. 
                  Du kannst sie jedoch als Basis für neue benutzerdefinierte Templates verwenden.
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="outline">
                          {template.sections.length} Abschnitt{template.sections.length !== 1 ? 'e' : ''}
                        </Badge>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => onTemplateSelect(template)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Template verwenden
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}