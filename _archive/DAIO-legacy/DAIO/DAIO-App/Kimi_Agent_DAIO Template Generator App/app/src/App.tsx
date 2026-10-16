import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Settings, 
  Home, 
  ArrowLeft,
  Lightbulb,
  Wrench
} from 'lucide-react';
import { TemplateSelector } from './components/TemplateSelector';
import { DynamicForm } from './components/DynamicForm';
import { TemplateEditor } from './components/TemplateEditor';
import { TemplateManager } from './components/TemplateManager';
import type { Template, TemplateData } from './types/template';
import './App.css';

type View = 'home' | 'selector' | 'form' | 'editor' | 'manager';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateData>({});

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: TemplateData) => {
    setFormData(data);
    // Hier könnte die Export-Logik kommen
    alert('Dokument erfolgreich generiert! Klicke auf "Als Datei exportieren" um es zu speichern.');
  };

  const handleTemplateSave = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentView('selector');
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              DAIO Template Generator
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Erstelle professionelle Dokumente für digitale Erbschaftsplanung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => navigateTo('selector')}>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Template auswählen</h3>
                <p className="text-muted-foreground">
                  Wähle aus vordefinierten oder benutzerdefinierten Templates
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => navigateTo('manager')}>
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Templates verwalten</h3>
                <p className="text-muted-foreground">
                  Erstelle, bearbeite und lösche deine eigenen Templates
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => navigateTo('editor')}>
              <CardContent className="p-6 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Neues Template</h3>
                <p className="text-muted-foreground">
                  Erstelle ein komplett neues Template von Grund auf
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium mb-2">So funktioniert's:</h3>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Wähle ein Template aus oder erstelle ein neues</li>
                  <li>2. Fülle das dynamische Formular mit deinen Daten</li>
                  <li>3. Nutze die Vorschau, um das Ergebnis zu prüfen</li>
                  <li>4. Exportiere das fertige Dokument als Textdatei</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {currentView !== 'home' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">DAIO Generator</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <Button 
              variant={currentView === 'selector' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigateTo('selector')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button 
              variant={currentView === 'manager' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigateTo('manager')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Verwalten
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      
      case 'selector':
        return (
          <div className="container mx-auto px-4 py-8">
            <TemplateSelector
              onTemplateSelect={handleTemplateSelect}
              showCreateButton={true}
              onCreateTemplate={() => navigateTo('editor')}
            />
          </div>
        );
      
      case 'form':
        if (!selectedTemplate) {
          navigateTo('selector');
          return null;
        }
        return (
          <div className="container mx-auto px-4 py-8">
            <DynamicForm
              template={selectedTemplate}
              onDataSubmit={handleFormSubmit}
              onCancel={() => navigateTo('selector')}
            />
          </div>
        );
      
      case 'editor':
        return (
          <div className="container mx-auto px-4 py-8">
            <TemplateEditor
              template={selectedTemplate || undefined}
              onSave={handleTemplateSave}
              onCancel={() => navigateTo(selectedTemplate ? 'selector' : 'home')}
            />
          </div>
        );
      
      case 'manager':
        return (
          <div className="container mx-auto px-4 py-8">
            <TemplateManager
              onEditTemplate={(template) => {
                setSelectedTemplate(template);
                navigateTo('editor');
              }}
              onCreateTemplate={() => navigateTo('editor')}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>
        );
      
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView !== 'home' && renderHeader()}
      {renderContent()}
    </div>
  );
}

export default App;
