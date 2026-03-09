// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/hooks/use-toast';
import { 
  Ban, 
  Plus, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Search,
  Shield,
  Clock
} from 'lucide-react';

interface BlacklistEntry {
  id: string;
  type: 'phone' | 'email' | 'address';
  value: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  notes: string;
}

const SAMPLE_BLACKLIST: BlacklistEntry[] = [
  {
    id: '1',
    type: 'phone',
    value: '+358401234567',
    reason: 'Toistuvia peruutuksia',
    addedBy: 'Admin',
    addedAt: '2026-02-15',
    notes: '5 peräkkäistä peruutusta'
  },
  {
    id: '2',
    type: 'email',
    value: 'scammer@fake.com',
    reason: 'Epäilyttävä toiminta',
    addedBy: 'Admin',
    addedAt: '2026-01-20',
    notes: 'Yritti väärää maksutietoa'
  },
  {
    id: '3',
    type: 'address',
    value: 'Testitie 123, 15100 Lahti',
    reason: 'Ei löydy osoitetta',
    addedBy: 'Kuljettaja',
    addedAt: '2026-03-01',
    notes: 'Osoite ei ole olemassa'
  },
];

const REASON_OPTIONS = [
  { value: 'cancelled', labelFi: 'Toistuvia peruutuksia', labelEn: 'Repeated cancellations' },
  { value: 'no_show', labelFi: 'Ei noudeta tilausta', labelEn: 'No-show for pickup' },
  { value: 'fraud', labelFi: 'Epäilyttävä toiminta', labelEn: 'Suspicious activity' },
  { value: 'abuse', labelFi: 'Väärinkäyttö', labelEn: 'Abuse' },
  { value: 'invalid_address', labelFi: 'Virheellinen osoite', labelEn: 'Invalid address' },
  { value: 'other', labelFi: 'Muu syy', labelEn: 'Other' },
];

export function BlacklistManagement() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(SAMPLE_BLACKLIST);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    type: 'phone' as BlacklistEntry['type'],
    value: '',
    reason: '',
    notes: '',
  });

  const filteredBlacklist = blacklist.filter(entry =>
    entry.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToBlacklist = () => {
    const entry: BlacklistEntry = {
      id: Date.now().toString(),
      ...newEntry,
      addedBy: 'Admin',
      addedAt: new Date().toISOString().split('T')[0],
    };
    setBlacklist(prev => [...prev, entry]);
    setIsCreateOpen(false);
    setNewEntry({
      type: 'phone',
      value: '',
      reason: '',
      notes: '',
    });
    toast({
      title: t('Lisätty mustalle listalle', 'Added to blacklist'),
      description: t(`"${entry.value}" on nyt estetty`, `"${entry.value}" is now blocked`),
    });
  };

  const removeFromBlacklist = (id: string) => {
    const entry = blacklist.find(e => e.id === id);
    setBlacklist(prev => prev.filter(e => e.id !== id));
    toast({
      title: t('Poistettu mustalta listalta', 'Removed from blacklist'),
      description: entry ? t(`"${entry.value}" on nyt sallittu`, `"${entry.value}" is now allowed`) : '',
    });
  };

  const getTypeIcon = (type: BlacklistEntry['type']) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'address': return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: BlacklistEntry['type']) => {
    switch (type) {
      case 'phone': return t('Puhelin', 'Phone');
      case 'email': return t('Sähköposti', 'Email');
      case 'address': return t('Osoite', 'Address');
    }
  };

  const stats = {
    total: blacklist.length,
    phones: blacklist.filter(e => e.type === 'phone').length,
    emails: blacklist.filter(e => e.type === 'email').length,
    addresses: blacklist.filter(e => e.type === 'address').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ban className="w-6 h-6 text-red-500" />
            {t('Musta lista', 'Blacklist')}
          </h2>
          <p className="text-gray-600">
            {t('Hallitse estettyjä asiakkaita ja osoitteita', 'Manage blocked customers and addresses')}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Plus className="w-4 h-4 mr-2" />
              {t('Lisää estoon', 'Add to Blacklist')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t('Lisää mustalle listalle', 'Add to Blacklist')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'Estetyt asiakkaat eivät voi tehdä tilauksia.',
                  'Blocked entries will be prevented from placing orders.'
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('Tyyppi', 'Type')}</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value: BlacklistEntry['type']) => setNewEntry({ ...newEntry, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t('Puhelinnumero', 'Phone Number')}
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('Sähköposti', 'Email')}
                      </div>
                    </SelectItem>
                    <SelectItem value="address">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('Osoite', 'Address')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {newEntry.type === 'phone' && t('Puhelinnumero', 'Phone Number')}
                  {newEntry.type === 'email' && t('Sähköposti', 'Email')}
                  {newEntry.type === 'address' && t('Osoite', 'Address')}
                </Label>
                <Input
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  placeholder={
                    newEntry.type === 'phone' ? '+358401234567' :
                    newEntry.type === 'email' ? 'example@email.com' :
                    'Osoite, Postinumero Kaupunki'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t('Syy', 'Reason')}</Label>
                <Select
                  value={newEntry.reason}
                  onValueChange={(value) => setNewEntry({ ...newEntry, reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Valitse syy', 'Select reason')} />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={language === 'fi' ? option.labelFi : option.labelEn}>
                        {language === 'fi' ? option.labelFi : option.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('Muistiinpanot', 'Notes')} ({t('valinnainen', 'optional')})</Label>
                <Textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder={t('Lisätietoja...', 'Additional details...')}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('Peruuta', 'Cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={addToBlacklist}
                disabled={!newEntry.value || !newEntry.reason}
              >
                <Ban className="w-4 h-4 mr-2" />
                {t('Estä', 'Block')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">{t('Estettyjä', 'Blocked')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.phones}</p>
                <p className="text-sm text-gray-500">{t('Puhelimia', 'Phones')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.emails}</p>
                <p className="text-sm text-gray-500">{t('Sähköposteja', 'Emails')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.addresses}</p>
                <p className="text-sm text-gray-500">{t('Osoitteita', 'Addresses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Hae estettyjä...', 'Search blocked entries...')}
          className="pl-10"
        />
      </div>

      {/* Blacklist Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Estetyt', 'Blocked Entries')}</CardTitle>
          <CardDescription>
            {t('Nämä asiakkaat/osoitteet on estetty tilaamasta', 'These customers/addresses are blocked from ordering')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBlacklist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('Ei estettyjä', 'No blocked entries')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Tyyppi', 'Type')}</TableHead>
                  <TableHead>{t('Arvo', 'Value')}</TableHead>
                  <TableHead>{t('Syy', 'Reason')}</TableHead>
                  <TableHead>{t('Lisätty', 'Added')}</TableHead>
                  <TableHead>{t('Muistiinpanot', 'Notes')}</TableHead>
                  <TableHead className="text-right">{t('Toiminnot', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlacklist.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getTypeIcon(entry.type)}
                        {getTypeLabel(entry.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{entry.value}</TableCell>
                    <TableCell>{entry.reason}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {entry.addedAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                      {entry.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('Poista estosta', 'Remove from Blacklist')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(
                                `Haluatko poistaa "${entry.value}" mustalta listalta? Tämä sallii tilaukset uudelleen.`,
                                `Remove "${entry.value}" from the blacklist? This will allow orders again.`
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Peruuta', 'Cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeFromBlacklist(entry.id)}>
                              {t('Poista estosta', 'Remove')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BlacklistManagement;
