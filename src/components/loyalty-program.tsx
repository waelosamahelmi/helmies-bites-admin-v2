// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  Star, 
  Users, 
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Award,
  Percent
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  nameEn: string;
  minPoints: number;
  discount: number;
  color: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  nameEn: string;
  pointsCost: number;
  type: 'discount' | 'freeItem' | 'freeDelivery';
  value: number;
  isActive: boolean;
}

const DEFAULT_TIERS: LoyaltyTier[] = [
  { id: 'bronze', name: 'Pronssi', nameEn: 'Bronze', minPoints: 0, discount: 0, color: 'bg-amber-600' },
  { id: 'silver', name: 'Hopea', nameEn: 'Silver', minPoints: 500, discount: 5, color: 'bg-gray-400' },
  { id: 'gold', name: 'Kulta', nameEn: 'Gold', minPoints: 1500, discount: 10, color: 'bg-yellow-500' },
  { id: 'platinum', name: 'Platina', nameEn: 'Platinum', minPoints: 5000, discount: 15, color: 'bg-purple-500' },
];

const DEFAULT_REWARDS: LoyaltyReward[] = [
  { id: '1', name: '5€ alennus', nameEn: '€5 off', pointsCost: 100, type: 'discount', value: 5, isActive: true },
  { id: '2', name: '10€ alennus', nameEn: '€10 off', pointsCost: 180, type: 'discount', value: 10, isActive: true },
  { id: '3', name: 'Ilmainen toimitus', nameEn: 'Free delivery', pointsCost: 50, type: 'freeDelivery', value: 0, isActive: true },
  { id: '4', name: 'Ilmainen jälkiruoka', nameEn: 'Free dessert', pointsCost: 80, type: 'freeItem', value: 0, isActive: true },
];

export function LoyaltyProgram() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [pointsPerEuro, setPointsPerEuro] = useState(10);
  const [tiers, setTiers] = useState<LoyaltyTier[]>(DEFAULT_TIERS);
  const [rewards, setRewards] = useState<LoyaltyReward[]>(DEFAULT_REWARDS);

  // Mock customer data
  const topCustomers = [
    { id: 1, name: 'Matti Virtanen', email: 'm.virtanen@email.fi', points: 2340, tier: 'gold', orders: 45 },
    { id: 2, name: 'Anna Korhonen', email: 'anna.k@email.fi', points: 1890, tier: 'gold', orders: 38 },
    { id: 3, name: 'Jussi Mäkinen', email: 'jussi.m@email.fi', points: 1200, tier: 'silver', orders: 28 },
    { id: 4, name: 'Liisa Nieminen', email: 'l.nieminen@email.fi', points: 980, tier: 'silver', orders: 22 },
    { id: 5, name: 'Pekka Laine', email: 'pekka.l@email.fi', points: 450, tier: 'bronze', orders: 12 },
  ];

  const stats = {
    totalMembers: 234,
    activeMembers: 178,
    pointsIssued: 45600,
    pointsRedeemed: 12400,
  };

  const handleSaveSettings = () => {
    toast({
      title: t('Asetukset tallennettu', 'Settings saved'),
      description: t('Kanta-asiakasohjelman asetukset on päivitetty.', 'Loyalty program settings have been updated.'),
    });
  };

  const getTierBadge = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return null;
    return (
      <Badge className={`${tier.color} text-white`}>
        {language === 'fi' ? tier.name : tier.nameEn}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-orange-500" />
            {t('Kanta-asiakasohjelma', 'Loyalty Program')}
          </h2>
          <p className="text-gray-600">
            {t('Hallitse kanta-asiakasohjelmaa ja palkintoja', 'Manage loyalty program and rewards')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <span className="text-sm font-medium">
              {isEnabled ? t('Käytössä', 'Enabled') : t('Pois käytöstä', 'Disabled')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-sm text-gray-500">{t('Jäsenet', 'Members')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pointsIssued.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{t('Pisteitä jaettu', 'Points issued')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pointsRedeemed.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{t('Pisteitä käytetty', 'Points redeemed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
                <p className="text-sm text-gray-500">{t('Aktiivisia', 'Active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            {t('Jäsenet', 'Members')}
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            {t('Palkinnot', 'Rewards')}
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Award className="w-4 h-4 mr-2" />
            {t('Tasot', 'Tiers')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            {t('Asetukset', 'Settings')}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Parhaat asiakkaat', 'Top Customers')}</CardTitle>
              <CardDescription>
                {t('Aktiivisimmat kanta-asiakkaat pisteillä', 'Most active loyalty members by points')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Asiakas', 'Customer')}</TableHead>
                    <TableHead>{t('Sähköposti', 'Email')}</TableHead>
                    <TableHead>{t('Taso', 'Tier')}</TableHead>
                    <TableHead className="text-right">{t('Pisteet', 'Points')}</TableHead>
                    <TableHead className="text-right">{t('Tilaukset', 'Orders')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{getTierBadge(customer.tier)}</TableCell>
                      <TableCell className="text-right font-semibold">{customer.points}</TableCell>
                      <TableCell className="text-right">{customer.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('Palkinnot', 'Rewards')}</CardTitle>
                <CardDescription>
                  {t('Hallitse lunastettavia palkintoja', 'Manage redeemable rewards')}
                </CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('Lisää palkinto', 'Add Reward')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Palkinto', 'Reward')}</TableHead>
                    <TableHead>{t('Tyyppi', 'Type')}</TableHead>
                    <TableHead className="text-right">{t('Pisteet', 'Points')}</TableHead>
                    <TableHead>{t('Tila', 'Status')}</TableHead>
                    <TableHead className="text-right">{t('Toiminnot', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map(reward => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">
                        {language === 'fi' ? reward.name : reward.nameEn}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reward.type === 'discount' && <Percent className="w-3 h-3 mr-1" />}
                          {reward.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{reward.pointsCost}</TableCell>
                      <TableCell>
                        <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                          {reward.isActive ? t('Aktiivinen', 'Active') : t('Piilotettu', 'Hidden')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
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
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Jäsenyystasot', 'Membership Tiers')}</CardTitle>
              <CardDescription>
                {t('Määritä kanta-asiakastasot ja edut', 'Define loyalty tiers and benefits')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {tiers.map(tier => (
                  <Card key={tier.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-2 ${tier.color}`} />
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="font-bold text-lg">
                          {language === 'fi' ? tier.name : tier.nameEn}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {tier.minPoints}+ {t('pistettä', 'points')}
                        </p>
                        {tier.discount > 0 && (
                          <Badge className="mt-2" variant="secondary">
                            {tier.discount}% {t('alennus', 'off')}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Ohjelman asetukset', 'Program Settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('Pisteitä per euro', 'Points per euro')}</Label>
                  <Input
                    type="number"
                    value={pointsPerEuro}
                    onChange={(e) => setPointsPerEuro(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-gray-500">
                    {t('Kuinka monta pistettä asiakas saa per käytetty euro', 'How many points customer earns per euro spent')}
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveSettings}>
                {t('Tallenna asetukset', 'Save Settings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LoyaltyProgram;
