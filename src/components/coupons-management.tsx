// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/hooks/use-toast';
import { 
  Ticket, 
  Plus, 
  Copy, 
  Edit, 
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'freeDelivery' | 'freeItem';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description: string;
  descriptionEn: string;
}

const SAMPLE_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'TERVETULOA',
    type: 'percentage',
    value: 15,
    minOrderAmount: 20,
    maxUses: 100,
    usedCount: 45,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    description: '15% alennus uusille asiakkaille',
    descriptionEn: '15% off for new customers'
  },
  {
    id: '2',
    code: 'KESÄ2026',
    type: 'fixed',
    value: 10,
    minOrderAmount: 30,
    maxUses: 50,
    usedCount: 23,
    validFrom: '2026-06-01',
    validUntil: '2026-08-31',
    isActive: true,
    description: '10€ alennus kesäkampanja',
    descriptionEn: '€10 off summer campaign'
  },
  {
    id: '3',
    code: 'ILMAISTOIMITUS',
    type: 'freeDelivery',
    value: 0,
    minOrderAmount: 25,
    maxUses: 200,
    usedCount: 89,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    description: 'Ilmainen toimitus yli 25€ tilauksille',
    descriptionEn: 'Free delivery on orders over €25'
  },
  {
    id: '4',
    code: 'VANHA2025',
    type: 'percentage',
    value: 20,
    minOrderAmount: 0,
    maxUses: 100,
    usedCount: 100,
    validFrom: '2025-01-01',
    validUntil: '2025-12-31',
    isActive: false,
    description: 'Vanhentunut kampanja',
    descriptionEn: 'Expired campaign'
  },
];

export function CouponsManagement() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(SAMPLE_COUPONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as Coupon['type'],
    value: 10,
    minOrderAmount: 0,
    maxUses: 100,
    validFrom: '',
    validUntil: '',
    description: '',
    descriptionEn: '',
  });

  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.isActive).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalSaved: 1245.50, // Mock calculation
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t('Kopioitu!', 'Copied!'),
      description: t(`Koodi "${code}" kopioitu leikepöydälle`, `Code "${code}" copied to clipboard`),
    });
  };

  const toggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
    toast({
      title: t('Kuponki päivitetty', 'Coupon updated'),
    });
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast({
      title: t('Kuponki poistettu', 'Coupon deleted'),
      variant: 'destructive',
    });
  };

  const createCoupon = () => {
    const coupon: Coupon = {
      id: Date.now().toString(),
      ...newCoupon,
      usedCount: 0,
      isActive: true,
    };
    setCoupons(prev => [...prev, coupon]);
    setIsCreateOpen(false);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 10,
      minOrderAmount: 0,
      maxUses: 100,
      validFrom: '',
      validUntil: '',
      description: '',
      descriptionEn: '',
    });
    toast({
      title: t('Kuponki luotu', 'Coupon created'),
      description: t(`Kuponki "${coupon.code}" on nyt aktiivinen`, `Coupon "${coupon.code}" is now active`),
    });
  };

  const getTypeIcon = (type: Coupon['type']) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'freeDelivery': return <Ticket className="w-4 h-4" />;
      case 'freeItem': return <Ticket className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Coupon['type']) => {
    switch (type) {
      case 'percentage': return t('Prosentti', 'Percentage');
      case 'fixed': return t('Kiinteä', 'Fixed');
      case 'freeDelivery': return t('Ilmainen toimitus', 'Free Delivery');
      case 'freeItem': return t('Ilmainen tuote', 'Free Item');
    }
  };

  const formatValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage': return `${coupon.value}%`;
      case 'fixed': return `€${coupon.value}`;
      case 'freeDelivery': return t('Ilmainen', 'Free');
      case 'freeItem': return t('Ilmainen', 'Free');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-orange-500" />
            {t('Alennuskuponit', 'Discount Coupons')}
          </h2>
          <p className="text-gray-600">
            {t('Luo ja hallitse alennuskoodeja', 'Create and manage discount codes')}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('Luo kuponki', 'Create Coupon')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Luo uusi kuponki', 'Create New Coupon')}</DialogTitle>
              <DialogDescription>
                {t('Täytä kupongin tiedot', 'Fill in the coupon details')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('Koodi', 'Code')}</Label>
                <Input
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="KESÄ2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Tyyppi', 'Type')}</Label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value: Coupon['type']) => setNewCoupon({ ...newCoupon, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t('Prosenttialennus', 'Percentage')}</SelectItem>
                      <SelectItem value="fixed">{t('Kiinteä alennus', 'Fixed Amount')}</SelectItem>
                      <SelectItem value="freeDelivery">{t('Ilmainen toimitus', 'Free Delivery')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('Arvo', 'Value')}</Label>
                  <Input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseInt(e.target.value) || 0 })}
                    disabled={newCoupon.type === 'freeDelivery'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Minitilaus (€)', 'Min Order (€)')}</Label>
                  <Input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Käyttökertoja', 'Max Uses')}</Label>
                  <Input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Alkaa', 'Valid From')}</Label>
                  <Input
                    type="date"
                    value={newCoupon.validFrom}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Päättyy', 'Valid Until')}</Label>
                  <Input
                    type="date"
                    value={newCoupon.validUntil}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('Kuvaus', 'Description')}</Label>
                <Input
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder={t('Kuvaus suomeksi', 'Description in Finnish')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('Peruuta', 'Cancel')}
              </Button>
              <Button onClick={createCoupon} disabled={!newCoupon.code}>
                {t('Luo kuponki', 'Create Coupon')}
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
              <Ticket className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                <p className="text-sm text-gray-500">{t('Kupongit', 'Total Coupons')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeCoupons}</p>
                <p className="text-sm text-gray-500">{t('Aktiivisia', 'Active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsed}</p>
                <p className="text-sm text-gray-500">{t('Käytetty', 'Times Used')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">€{stats.totalSaved.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{t('Säästetty', 'Total Saved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Kaikki kupongit', 'All Coupons')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Koodi', 'Code')}</TableHead>
                <TableHead>{t('Tyyppi', 'Type')}</TableHead>
                <TableHead>{t('Arvo', 'Value')}</TableHead>
                <TableHead>{t('Käytetty', 'Used')}</TableHead>
                <TableHead>{t('Voimassa', 'Valid')}</TableHead>
                <TableHead>{t('Tila', 'Status')}</TableHead>
                <TableHead className="text-right">{t('Toiminnot', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(coupon => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono font-bold">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCouponCode(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getTypeIcon(coupon.type)}
                      {getTypeLabel(coupon.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatValue(coupon)}</TableCell>
                  <TableCell>
                    {coupon.usedCount}/{coupon.maxUses}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {coupon.validUntil}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={() => toggleCoupon(coupon.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default CouponsManagement;
