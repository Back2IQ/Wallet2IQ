import React, { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Save, 
  Eye, 
  FileText, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { Template, TemplateData } from '@/types/template';
import { TemplateService } from '@/lib/templateService';
import { TemplatePreview } from './TemplatePreview';

interface DynamicFormProps {
  template: Template;
  onDataSubmit: (data: TemplateData) => void;
  onCancel: () => void;
}

export function DynamicForm({ template, onDataSubmit, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean | number>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm();

  // Standardwerte setzen
  React.useEffect(() => {
    const defaultValues: Record<string, any> = {};
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultValues[field.id] = field.defaultValue;
        } else if (field.type === 'checkbox') {
          defaultValues[field.id] = false;
        } else if (field.type === 'number') {
          defaultValues[field.id] = '';
        } else {
          defaultValues[field.id] = '';
        }
      });
    });
    form.reset(defaultValues);
  }, [template, form]);

  const handleFieldChange = (fieldId: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Formulardaten validieren
      const isValid = await form.trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      onDataSubmit(formData);
    } catch (error) {
      console.error('Fehler beim Absenden:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      await TemplateService.exportAndDownload(template, formData, 'txt');
    } catch (error) {
      console.error('Fehler beim Export:', error);
    }
  };

  const renderField = (field: Template['sections'][0]['fields'][0]) => {
    const fieldValue = formData[field.id] ?? (field.type === 'checkbox' ? false : '');
    
    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleFieldChange(field.id, e.target.value);
                    }}
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormDescription>
                  {field.placeholder}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleFieldChange(field.id, parseFloat(e.target.value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...formField}
                      onChange={(e) => {
                        formField.onChange(e);
                        handleFieldChange(field.id, e.target.value);
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!formField.value}
                    onCheckedChange={(checked) => {
                      formField.onChange(checked);
                      handleFieldChange(field.id, !!checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  {field.placeholder && (
                    <FormDescription>
                      {field.placeholder}
                    </FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <Select 
                  onValueChange={(value) => {
                    formField.onChange(value);
                    handleFieldChange(field.id, value);
                  }}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'email':
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={field.placeholder}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleFieldChange(field.id, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default: // text
        return (
          <FormField
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleFieldChange(field.id, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  const requiredFields = template.sections.flatMap(section => 
    section.fields.filter(field => field.required)
  );
  
  const filledRequiredFields = requiredFields.filter(field => 
    formData[field.id] !== undefined && 
    formData[field.id] !== '' && 
    formData[field.id] !== false
  ).length;

  const isFormComplete = requiredFields.length === 0 || filledRequiredFields === requiredFields.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-muted-foreground mt-2">{template.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">{template.category}</Badge>
            <Badge variant="outline">
              {template.sections.reduce((acc, section) => acc + section.fields.length, 0)} Felder
            </Badge>
            {requiredFields.length > 0 && (
              <Badge variant={isFormComplete ? "default" : "destructive"}>
                {filledRequiredFields}/{requiredFields.length} Pflichtfelder
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            disabled={!isFormComplete}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Formular anzeigen' : 'Vorschau'}
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!isFormComplete || isSubmitting}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Exportiere...' : 'Als Datei exportieren'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formular */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Formulardaten eingeben</CardTitle>
              <CardDescription>
                Fülle alle erforderlichen Felder aus, um das Dokument zu generieren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-8">
                    {template.sections.map(section => (
                      <div key={section.id} className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid gap-6">
                          {section.fields.map(field => (
                            <div key={field.id}>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Abbrechen
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isFormComplete || isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verarbeite...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Dokument generieren
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Vorschau */}
        {showPreview && (
          <div className="lg:col-span-1">
            <TemplatePreview 
              template={template} 
              data={formData as Record<string, string>}
            />
          </div>
        )}
      </div>
    </div>
  );
}