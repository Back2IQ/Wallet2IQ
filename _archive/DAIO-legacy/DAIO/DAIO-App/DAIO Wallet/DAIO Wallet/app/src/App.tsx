import { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Users, 
  Activity, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Lock,
  FileText,
  History,
  UserPlus,
  AlertOctagon,
  Timer,
  Wallet,
  Download,
  Send,
  ArrowDownLeft,
  Copy,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { formatAddress, isValidAddress } from '@/lib/crypto';
import './App.css';

// Wallet Setup Component
function WalletSetup({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<'create' | 'import' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [step, setStep] = useState(1);
  
  const { initializeWallet, importWallet } = useWalletStore();

  const handleCreate = async () => {
    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    
    if (step === 1) {
      await initializeWallet(password);
      setMnemonic('abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress');
      setStep(2);
    } else {
      onComplete();
    }
  };

  const handleImport = async () => {
    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    if (mnemonic.split(' ').length !== 12 && mnemonic.split(' ').length !== 24) {
      toast.error('Ungültige Seed Phrase');
      return;
    }
    
    await importWallet(mnemonic, password);
    onComplete();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopiert!');
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Willkommen bei DAIO Wallet</CardTitle>
            <CardDescription>
              Die erste Wallet mit integrierter Nachlassregelung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-14 text-lg" onClick={() => setMode('create')}>
              <Plus className="w-5 h-5 mr-2" />
              Neue Wallet erstellen
            </Button>
            <Button variant="outline" className="w-full h-14 text-lg" onClick={() => setMode('import')}>
              <Download className="w-5 h-5 mr-2" />
              Wallet importieren
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-slate-500">
            Orchestration without Custody • Governance with Defined Liability
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Neue Wallet erstellen</CardTitle>
            <CardDescription>
              {step === 1 ? 'Setzen Sie ein sicheres Passwort' : 'Sichern Sie Ihre Seed Phrase'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label>Passwort</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" />
                </div>
                <div className="space-y-2">
                  <Label>Passwort bestätigen</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" />
                </div>
              </>
            ) : (
              <>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Schreiben Sie diese 24 Wörter auf und bewahren Sie sie sicher auf.
                  </AlertDescription>
                </Alert>
                <div className="p-4 bg-slate-100 rounded-lg font-mono text-sm cursor-pointer" onClick={() => setShowMnemonic(!showMnemonic)}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">Seed Phrase (24 Wörter)</span>
                    {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <p className={showMnemonic ? '' : 'blur-sm'}>{mnemonic}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => copyToClipboard(mnemonic)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Kopieren
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>}
            <Button className={step === 1 ? 'w-full' : ''} onClick={handleCreate}>
              {step === 1 ? 'Weiter' : 'Wallet erstellen'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet importieren</CardTitle>
          <CardDescription>Geben Sie Ihre Seed Phrase ein</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seed Phrase (12 oder 24 Wörter)</Label>
            <textarea
              className="w-full p-3 border rounded-lg font-mono text-sm min-h-[100px]"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="word1 word2 word3 ..."
            />
          </div>
          <div className="space-y-2">
            <Label>Passwort</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" />
          </div>
          <div className="space-y-2">
            <Label>Passwort bestätigen</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setMode(null)}>Zurück</Button>
          <Button onClick={handleImport}>Wallet importieren</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Unlock Screen
function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const { unlockWallet } = useWalletStore();

  const handleUnlock = async () => {
    const success = await unlockWallet(password);
    if (success) {
      onUnlock();
    } else {
      toast.error('Falsches Passwort');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Wallet entsperren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort eingeben" onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} />
          <Button className="w-full" onClick={handleUnlock}>Entsperren</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  
  const { 
    isInitialized, isLocked, accounts, activeAccountIndex,
    networks, heirs, guardians, keyFragments,
    dmsConfig, auditTrail, transactions, pendingTransactions,
    getActiveAccount, getActiveNetwork, setActiveAccount, addAccount,
    lockWallet, sendTransaction, addHeir, removeHeir, addGuardian,
    removeGuardian, updateDMSConfig, setActiveNetwork, addAuditEntry
  } = useWalletStore();

  const activeAccount = getActiveAccount();
  const activeNetwork = getActiveNetwork();

  useEffect(() => {
    if (isInitialized && !isLocked) {
      addAuditEntry({ action: 'Session Started', details: 'Wallet session initialized', type: 'info' });
    }
  }, []);

  if (!isInitialized) return <WalletSetup onComplete={() => {}} />;
  if (isLocked) return <UnlockScreen onUnlock={() => {}} />;

  const handleSend = async () => {
    if (!isValidAddress(sendTo)) { toast.error('Ungültige Adresse'); return; }
    if (!sendAmount || parseFloat(sendAmount) <= 0) { toast.error('Ungültiger Betrag'); return; }
    try {
      await sendTransaction(sendTo, sendAmount);
      toast.success('Transaktion gesendet!');
      setSendDialogOpen(false);
      setSendTo('');
      setSendAmount('');
    } catch (error) { toast.error('Transaktion fehlgeschlagen'); }
  };

  const triggerPanic = () => {
    toast.error('NOTFALL AKTIVIERT!', { duration: 5000 });
    addAuditEntry({ action: 'PANIC BUTTON', details: 'Notfall-Sequenz aktiviert', type: 'critical' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopiert!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'success': case 'confirmed': return 'bg-green-500';
      case 'warning': case 'pending': return 'bg-yellow-500';
      case 'escalation': return 'bg-orange-500';
      case 'critical': case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DAIO Wallet</h1>
                <p className="text-xs text-slate-500">Digital Asset Inheritance Orchestration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />MiCA-konform
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Network className="w-4 h-4 mr-2" />{activeNetwork.name}<ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {networks.map(network => (
                    <DropdownMenuItem key={network.id} onClick={() => setActiveNetwork(network.id)}>
                      {network.name}{network.isTestnet && <Badge variant="secondary" className="ml-2">Testnet</Badge>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Wallet className="w-4 h-4 mr-2" />{activeAccount ? formatAddress(activeAccount.address) : 'Kein Konto'}<ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {accounts.map((account, index) => (
                    <DropdownMenuItem key={account.address} onClick={() => setActiveAccount(index)} className={index === activeAccountIndex ? 'bg-blue-50' : ''}>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-slate-500">{formatAddress(account.address)}</span>
                        <span className="text-xs text-slate-400">{account.balance} ETH</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => addAccount()}>
                    <Plus className="w-4 h-4 mr-2" />Neues Konto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={lockWallet}><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-4 bg-white p-2 rounded-xl border">
            <TabsTrigger value="dashboard"><Wallet className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
            <TabsTrigger value="send"><Send className="w-4 h-4 mr-2" />Senden</TabsTrigger>
            <TabsTrigger value="dms"><Timer className="w-4 h-4 mr-2" />DMS</TabsTrigger>
            <TabsTrigger value="heirs"><Users className="w-4 h-4 mr-2" />Erben</TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700"><AlertOctagon className="w-4 h-4 mr-2" />Notfall</TabsTrigger>
            <TabsTrigger value="audit"><History className="w-4 h-4 mr-2" />Audit</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Gesamtguthaben</p>
                    <h2 className="text-4xl font-bold">{activeAccount?.balance || '0'} ETH</h2>
                    <p className="text-blue-200 text-sm mt-1">≈ €{(parseFloat(activeAccount?.balance || '0') * 2287).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">{activeNetwork.name}</p>
                    <p className="text-blue-200 text-xs">{formatAddress(activeAccount?.address || '')}</p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-8">
                  <Button className="flex-1 bg-white text-blue-700 hover:bg-blue-50" onClick={() => setSendDialogOpen(true)}>
                    <Send className="w-4 h-4 mr-2" />Senden
                  </Button>
                  <Button variant="outline" className="flex-1 border-white text-white hover:bg-white/10" onClick={() => setShowReceive(true)}>
                    <ArrowDownLeft className="w-4 h-4 mr-2" />Empfangen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-500">Wallet Status</p><p className="text-lg font-semibold text-green-600">Bereit</p></div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-500">DMS Status</p><p className="text-lg font-semibold text-blue-600">{dmsConfig.enabled ? 'Aktiv' : 'Inaktiv'}</p></div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-500">Fragmente</p><p className="text-lg font-semibold text-purple-600">{keyFragments.length}/5</p></div>
                    <Key className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-500">Transaktionen</p><p className="text-lg font-semibold text-orange-600">{transactions.length}</p></div>
                    <History className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Letzte Transaktionen</CardTitle></CardHeader>
              <CardContent>
                {pendingTransactions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">Ausstehend</p>
                    {pendingTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Clock className="w-4 h-4 text-yellow-600" /></div>
                          <div><p className="font-medium">Senden</p><p className="text-sm text-slate-500">{formatAddress(tx.to)}</p></div>
                        </div>
                        <div className="text-right"><p className="font-medium text-yellow-600">-{tx.value} ETH</p><p className="text-xs text-slate-400">Ausstehend</p></div>
                      </div>
                    ))}
                  </div>
                )}
                {transactions.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Keine Transaktionen</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                            {tx.type === 'send' ? <Send className="w-4 h-4 text-red-600" /> : <ArrowDownLeft className="w-4 h-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{tx.type === 'send' ? 'Gesendet' : 'Empfangen'}</p>
                            <p className="text-sm text-slate-500">{tx.type === 'send' ? formatAddress(tx.to) : formatAddress(tx.from)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>{tx.type === 'send' ? '-' : '+'}{tx.value} ETH</p>
                          <p className="text-xs text-slate-400">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send */}
          <TabsContent value="send" className="space-y-6">
            <Card className="max-w-lg mx-auto">
              <CardHeader><CardTitle>ETH senden</CardTitle><CardDescription>Senden Sie ETH an eine beliebige Ethereum-Adresse</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Empfängeradresse</Label>
                  <Input placeholder="0x..." value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Betrag (ETH)</Label>
                  <Input type="number" step="0.001" placeholder="0.0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                  <p className="text-sm text-slate-500">Verfügbar: {activeAccount?.balance || '0'} ETH</p>
                </div>
                <Button className="w-full" onClick={handleSend} disabled={!sendTo || !sendAmount}>
                  <Send className="w-4 h-4 mr-2" />Senden
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DMS */}
          <TabsContent value="dms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Timer className="w-5 h-5 mr-2" />Dead Man's Switch</CardTitle>
                <CardDescription>Drei-Stufen-Eskalation bei Inaktivität</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className={dmsConfig.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}>
                  <Activity className={`w-4 h-4 ${dmsConfig.enabled ? 'text-green-600' : 'text-gray-600'}`} />
                  <AlertTitle>Status: {dmsConfig.enabled ? 'Aktiv' : 'Inaktiv'}</AlertTitle>
                  <AlertDescription>Letzter Login: {formatDate(dmsConfig.lastLogin)}</AlertDescription>
                </Alert>

                <Card className="border-l-4 border-l-yellow-400">
                  <CardHeader><CardTitle className="text-base flex items-center"><span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 text-yellow-700 font-bold">1</span>Stufe 1: Warnung</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-500">Trigger</Label>
                        <Select value={dmsConfig.stage1Days.toString()} onValueChange={(v) => updateDMSConfig({ stage1Days: parseInt(v) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="30">30 Tage</SelectItem><SelectItem value="60">60 Tage</SelectItem><SelectItem value="90">90 Tage</SelectItem><SelectItem value="120">120 Tage</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm text-slate-500">Aktion</Label><p className="text-sm mt-2">E-Mail + Push-Benachrichtigung</p></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-400">
                  <CardHeader><CardTitle className="text-base flex items-center"><span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-orange-700 font-bold">2</span>Stufe 2: Eskalation</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-500">Trigger</Label>
                        <Select value={dmsConfig.stage2Days.toString()} onValueChange={(v) => updateDMSConfig({ stage2Days: parseInt(v) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="120">120 Tage</SelectItem><SelectItem value="150">150 Tage</SelectItem><SelectItem value="180">180 Tage</SelectItem><SelectItem value="210">210 Tage</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm text-slate-500">Aktion</Label><p className="text-sm mt-2">E-Mail + SMS + Sekundäre Kontakte</p></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardHeader><CardTitle className="text-base flex items-center text-red-600"><span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2 text-red-700 font-bold">3</span>Stufe 3: Aktivierung</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-500">Trigger</Label>
                        <Select value={dmsConfig.stage3Days.toString()} onValueChange={(v) => updateDMSConfig({ stage3Days: parseInt(v) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="270">270 Tage</SelectItem><SelectItem value="300">300 Tage</SelectItem><SelectItem value="365">365 Tage</SelectItem><SelectItem value="450">450 Tage</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm text-slate-500">Aktion</Label><p className="text-sm mt-2 text-red-600 font-medium">Key-Fragmente werden an Erben verteilt</p></div>
                    </div>
                    <Alert className="mt-4 bg-red-50 border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-700"><strong>Proof-of-Life-Check:</strong> 14-tägiger Check vor Aktivierung</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <div className="flex items-center space-x-2">
                  <Switch id="dms-enabled" checked={dmsConfig.enabled} onCheckedChange={(checked) => updateDMSConfig({ enabled: checked })} />
                  <Label htmlFor="dms-enabled">Dead Man's Switch aktivieren</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heirs */}
          <TabsContent value="heirs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2" />Erben</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {heirs.map((heir) => (
                      <div key={heir.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-700 font-medium">{heir.name.charAt(0)}</span></div>
                          <div><p className="font-medium">{heir.name}</p><p className="text-sm text-slate-500">{heir.relationship}</p><p className="text-xs text-slate-400">{heir.email}</p></div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeHeir(heir.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild><Button variant="outline" className="w-full"><UserPlus className="w-4 h-4 mr-2" />Erben hinzufügen</Button></DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>Erben hinzufügen</DialogTitle></DialogHeader><AddHeirForm onAdd={addHeir} /></DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2" />Notar & Guardian</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {guardians.map((guardian) => (
                      <div key={guardian.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Shield className="w-5 h-5 text-purple-700" /></div>
                          <div><p className="font-medium">{guardian.name}</p><p className="text-sm text-slate-500">{guardian.role}</p></div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeGuardian(guardian.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild><Button variant="outline" className="w-full"><UserPlus className="w-4 h-4 mr-2" />Guardian hinzufügen</Button></DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>Guardian hinzufügen</DialogTitle></DialogHeader><AddGuardianForm onAdd={addGuardian} /></DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Schlüsselfragmente (SSS)</CardTitle><CardDescription>3 von 5 Fragmente nötig für Rekonstruktion</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {keyFragments.map((fragment, i) => (
                    <div key={fragment.id} className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><Key className="w-6 h-6 text-blue-600" /></div>
                      <p className="text-sm font-medium">Fragment {i + 1}</p>
                      <p className="text-xs text-slate-500">{fragment.holder}</p>
                      <Badge className="mt-2 text-xs" variant="outline">{fragment.status === 'distributed' ? 'Verteilt' : fragment.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency */}
          <TabsContent value="emergency" className="space-y-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <AlertTitle className="text-red-900">Notfall-Protokolle</AlertTitle>
              <AlertDescription className="text-red-700">Diese Funktionen sind für Notfallszenarien vorgesehen.</AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center text-red-700"><AlertOctagon className="w-5 h-5 mr-2" />Panic Button</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-4">Sofortige Schlüssel-Revocation bei Diebstahl oder akuter Bedrohung.</p>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="destructive" className="w-full"><AlertTriangle className="w-4 h-4 mr-2" />NOTFALL AKTIVIEREN</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle className="text-red-600">Notfall bestätigen</DialogTitle><DialogDescription>Dies wird neue Schlüsselfragmente generieren.</DialogDescription></DialogHeader>
                      <DialogFooter><Button variant="outline">Abbrechen</Button><Button variant="destructive" onClick={triggerPanic}>Ja, Notfall aktivieren</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center text-orange-700"><Lock className="w-5 h-5 mr-2" />Duress-PIN</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-4">Falsche PIN, die scheinbar entsperrt, aber heimlich Alarm auslöst.</p>
                  <Button variant="outline" className="w-full border-orange-300 text-orange-600" onClick={() => toast.info('Funktion in Entwicklung')}>
                    <Settings className="w-4 h-4 mr-2" />Duress-PIN konfigurieren
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-2" />Audit-Trail</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditTrail.map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(entry.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <span className="text-xs text-slate-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{entry.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>ETH senden</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Empfänger</Label><Input placeholder="0x..." value={sendTo} onChange={(e) => setSendTo(e.target.value)} /></div>
            <div className="space-y-2"><Label>Betrag (ETH)</Label><Input type="number" step="0.001" placeholder="0.0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSendDialogOpen(false)}>Abbrechen</Button><Button onClick={handleSend} disabled={!sendTo || !sendAmount}>Senden</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent>
          <DialogHeader><DialogTitle>ETH empfangen</DialogTitle><DialogDescription>Teilen Sie diese Adresse, um ETH zu empfangen</DialogDescription></DialogHeader>
          <div className="py-4 text-center">
            <div className="bg-slate-100 p-6 rounded-lg mb-4"><p className="font-mono text-lg break-all">{activeAccount?.address}</p></div>
            <Button onClick={() => copyToClipboard(activeAccount?.address || '')}><Copy className="w-4 h-4 mr-2" />Adresse kopieren</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">DAIO Wallet v1.0 - Orchestration without Custody</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>MiCA-konform</span><span>•</span><span>BIP-39/32</span><span>•</span><span>SSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components
function AddHeirForm({ onAdd }: { onAdd: (heir: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = () => {
    onAdd({ name, email, phone, relationship });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="space-y-2"><Label>E-Mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label>Telefon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="space-y-2"><Label>Beziehung</Label><Input value={relationship} onChange={(e) => setRelationship(e.target.value)} /></div>
      <Button onClick={handleSubmit} className="w-full">Hinzufügen</Button>
    </div>
  );
}

function AddGuardianForm({ onAdd }: { onAdd: (guardian: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Notar');

  const handleSubmit = () => {
    onAdd({ name, email, phone, role });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="space-y-2"><Label>E-Mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label>Telefon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="space-y-2"><Label>Rolle</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Notar">Notar</SelectItem><SelectItem value="Guardian">Guardian</SelectItem><SelectItem value="Anwalt">Anwalt</SelectItem></SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="w-full">Hinzufügen</Button>
    </div>
  );
}

export default App;
