import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow h-full"
      onClick={() => onClick(template)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          {template.isCustom && (
            <Badge variant="secondary">Benutzerdefiniert</Badge>
          )}
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{template.category}</Badge>
          <Badge variant="outline">
            {template.sections.length} Sektion{template.sections.length !== 1 ? 'en' : ''}
          </Badge>
          <Badge variant="outline">
            {template.sections.reduce((acc, section) => acc + section.fields.length, 0)} Felder
          </Badge>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Erstellt: {template.createdAt.toLocaleDateString('de-DE')}
        </div>
      </CardContent>
    </Card>
  );
}