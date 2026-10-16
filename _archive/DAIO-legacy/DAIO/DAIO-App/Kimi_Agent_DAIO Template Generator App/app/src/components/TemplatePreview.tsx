import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User } from 'lucide-react';
import type { Template } from '@/types/template';

interface TemplatePreviewProps {
  template: Template;
  data: Record<string, string>;
}

export function TemplatePreview({ template, data }: TemplatePreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dokumentenvorschau
        </CardTitle>
        <CardDescription>
          So wird das generierte Dokument aussehen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Dokumentenkopf */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">{template.name}</h2>
              <p className="text-muted-foreground mt-2">{template.description}</p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {data['client_name'] || 'Kunde'}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>

            {/* Dokumenteninhalt */}
            <div className="space-y-6">
              {template.sections.map(section => (
                <div key={section.id} className="space-y-3">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {section.fields.map(field => {
                      const value = data[field.id] || field.defaultValue || '';
                      
                      // Leere Felder nicht anzeigen
                      if (!value || (typeof value === 'string' && value === '')) return null;
                      
                      return (
                        <div key={field.id} className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">
                            {field.label}:
                          </span>
                          <span className="text-base mt-1">
                            {field.type === 'checkbox' 
                              ? (value ? '✓ Ja' : '✗ Nein')
                              : String(value)
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Zusammenfassung */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gesamtfelder ausgefüllt:</span>
                <Badge variant="secondary">
                  {Object.values(data).filter(v => {
                    if (typeof v === 'string') return v !== '';
                    if (typeof v === 'boolean') return v === true;
                    if (typeof v === 'number') return v !== 0;
                    return false;
                  }).length} von {
                    template.sections.reduce((acc, section) => acc + section.fields.length, 0)
                  }
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}