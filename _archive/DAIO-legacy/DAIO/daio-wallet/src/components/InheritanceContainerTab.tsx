import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/store/walletStore';
import type { InheritanceContainer } from '@/store/walletStore';

const InheritanceContainerTab: React.FC = () => {
  const inheritanceContainer = useWalletStore(s => s.inheritanceContainer);
  const setInheritanceContainer = useWalletStore(s => s.setInheritanceContainer);

  const [form, setForm] = useState<Partial<InheritanceContainer>>({
    assetInventory: inheritanceContainer?.assetInventory || '',
    accessArchitecture: inheritanceContainer?.accessArchitecture || '',
    heirDesignation: inheritanceContainer?.heirDesignation || '',
    legacyContext: inheritanceContainer?.legacyContext || '',
    platformInstructions: inheritanceContainer?.platformInstructions || '',
    professionalContacts: inheritanceContainer?.professionalContacts || '',
  });

  const level1Complete = !!(form.assetInventory && form.accessArchitecture && form.heirDesignation);
  const level2Complete = level1Complete && !!(form.legacyContext && form.platformInstructions);
  const level3Complete = level2Complete && !!(form.professionalContacts);

  const currentLevel: 1 | 2 | 3 = level3Complete ? 3 : level2Complete ? 2 : 1;

  const handleSave = () => {
    setInheritanceContainer({
      level: currentLevel,
      version: (inheritanceContainer?.version || 0) + 1,
      lastUpdated: Date.now(),
      assetInventory: form.assetInventory || '',
      accessArchitecture: form.accessArchitecture || '',
      heirDesignation: form.heirDesignation || '',
      legacyContext: form.legacyContext || '',
      platformInstructions: form.platformInstructions || '',
      professionalContacts: form.professionalContacts || '',
    });
  };

  const update = (field: keyof InheritanceContainer, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inheritance Container</h2>
          <p className="text-slate-500">Secure documentation for your digital legacy</p>
        </div>
        <Badge variant={currentLevel === 3 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
          Level {currentLevel}/3
        </Badge>
      </div>

      {/* Level 1 */}
      <Card className={level1Complete ? 'border-green-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Level 1 — Foundation
            {level1Complete && <Badge variant="outline" className="text-green-600 border-green-600">Complete</Badge>}
          </CardTitle>
          <CardDescription>Asset inventory, access architecture, and heir designation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Asset Inventory</Label>
            <Input placeholder="List your digital assets, wallets, and accounts..." value={form.assetInventory || ''} onChange={e => update('assetInventory', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Access Architecture</Label>
            <Input placeholder="Describe how assets can be accessed (keys, passwords, locations)..." value={form.accessArchitecture || ''} onChange={e => update('accessArchitecture', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Heir Designation</Label>
            <Input placeholder="Primary and secondary heirs for your digital assets..." value={form.heirDesignation || ''} onChange={e => update('heirDesignation', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Level 2 */}
      <Card className={level2Complete ? 'border-green-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Level 2 — Extended
            {level2Complete && <Badge variant="outline" className="text-green-600 border-green-600">Complete</Badge>}
          </CardTitle>
          <CardDescription>Legacy context and platform-specific instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Legacy Context</Label>
            <Input placeholder="Personal notes, wishes, and context for heirs..." value={form.legacyContext || ''} onChange={e => update('legacyContext', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Platform Instructions</Label>
            <Input placeholder="Step-by-step instructions for each platform..." value={form.platformInstructions || ''} onChange={e => update('platformInstructions', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Level 3 */}
      <Card className={level3Complete ? 'border-green-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Level 3 — Professional
            {level3Complete && <Badge variant="outline" className="text-green-600 border-green-600">Complete</Badge>}
          </CardTitle>
          <CardDescription>Professional contacts and optional multisig configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Professional Contacts</Label>
            <Input placeholder="Notary, attorney, financial advisor contacts..." value={form.professionalContacts || ''} onChange={e => update('professionalContacts', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave}>
        Save Inheritance Container (Level {currentLevel})
      </Button>
    </div>
  );
};

export default InheritanceContainerTab;
