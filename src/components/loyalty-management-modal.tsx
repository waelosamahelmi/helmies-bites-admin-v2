import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { Plus, Edit, Trash2, Save, X, Award, Gift, Settings, Star, Coins, TrendingUp } from "lucide-react";

interface LoyaltyRule {
  id: string;
  name: string;
  description: string | null;
  points_per_euro: number;
  min_order_amount: number;
  pickup_multiplier: number;
  delivery_multiplier: number;
  dine_in_multiplier: number;
  category_bonuses: Record<string, number>;
  branch_id: number | null;
  is_active: boolean;
  priority: number;
  valid_from: string;
  valid_until: string | null;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: 'discount_percentage' | 'discount_fixed' | 'free_item' | 'free_delivery' | 'custom';
  discount_percentage: number | null;
  discount_amount: number | null;
  free_item_id: string | null;
  min_order_amount: number;
  max_uses_per_customer: number | null;
  max_total_uses: number | null;
  current_uses: number;
  allowed_branches: string[] | null;
  pickup_only: boolean;
  delivery_only: boolean;
  dine_in_only: boolean;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

interface LoyaltyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoyaltyManagementModal({ isOpen, onClose }: LoyaltyManagementModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("rules");
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [isAddingReward, setIsAddingReward] = useState(false);

  // Form states
  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    points_per_euro: "1",
    min_order_amount: "0",
    pickup_multiplier: "1",
    delivery_multiplier: "1",
    dine_in_multiplier: "1",
    is_active: true,
    priority: "0",
  });

  const [rewardForm, setRewardForm] = useState({
    name: "",
    description: "",
    points_required: "100",
    reward_type: "discount_percentage" as LoyaltyReward['reward_type'],
    discount_percentage: "5",
    discount_amount: "",
    min_order_amount: "0",
    max_uses_per_customer: "",
    pickup_only: false,
    delivery_only: false,
    dine_in_only: false,
    is_active: true,
  });

  // Fetch loyalty rules
  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["loyalty-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rules")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as LoyaltyRule[];
    },
  });

  // Fetch loyalty rewards
  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data as LoyaltyReward[];
    },
  });

  // Mutations for rules
  const createRuleMutation = useMutation({
    mutationFn: async (data: Partial<LoyaltyRule>) => {
      const { error } = await supabase.from("loyalty_rules").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast({ title: t("Onnistui", "Success"), description: t("Sääntö luotu", "Rule created") });
      resetRuleForm();
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LoyaltyRule> }) => {
      const { error } = await supabase.from("loyalty_rules").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast({ title: t("Onnistui", "Success"), description: t("Sääntö päivitetty", "Rule updated") });
      resetRuleForm();
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast({ title: t("Onnistui", "Success"), description: t("Sääntö poistettu", "Rule deleted") });
    },
  });

  // Mutations for rewards
  const createRewardMutation = useMutation({
    mutationFn: async (data: Partial<LoyaltyReward>) => {
      const { error } = await supabase.from("loyalty_rewards").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] });
      toast({ title: t("Onnistui", "Success"), description: t("Palkinto luotu", "Reward created") });
      resetRewardForm();
    },
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LoyaltyReward> }) => {
      const { error } = await supabase.from("loyalty_rewards").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] });
      toast({ title: t("Onnistui", "Success"), description: t("Palkinto päivitetty", "Reward updated") });
      resetRewardForm();
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] });
      toast({ title: t("Onnistui", "Success"), description: t("Palkinto poistettu", "Reward deleted") });
    },
  });

  const resetRuleForm = () => {
    setRuleForm({
      name: "",
      description: "",
      points_per_euro: "1",
      min_order_amount: "0",
      pickup_multiplier: "1",
      delivery_multiplier: "1",
      dine_in_multiplier: "1",
      is_active: true,
      priority: "0",
    });
    setEditingRule(null);
    setIsAddingRule(false);
  };

  const resetRewardForm = () => {
    setRewardForm({
      name: "",
      description: "",
      points_required: "100",
      reward_type: "discount_percentage",
      discount_percentage: "5",
      discount_amount: "",
      min_order_amount: "0",
      max_uses_per_customer: "",
      pickup_only: false,
      delivery_only: false,
      dine_in_only: false,
      is_active: true,
    });
    setEditingReward(null);
    setIsAddingReward(false);
  };

  const handleEditRule = (rule: LoyaltyRule) => {
    setRuleForm({
      name: rule.name,
      description: rule.description || "",
      points_per_euro: rule.points_per_euro.toString(),
      min_order_amount: rule.min_order_amount.toString(),
      pickup_multiplier: rule.pickup_multiplier.toString(),
      delivery_multiplier: rule.delivery_multiplier.toString(),
      dine_in_multiplier: rule.dine_in_multiplier.toString(),
      is_active: rule.is_active,
      priority: rule.priority.toString(),
    });
    setEditingRule(rule);
    setIsAddingRule(false);
  };

  const handleEditReward = (reward: LoyaltyReward) => {
    setRewardForm({
      name: reward.name,
      description: reward.description || "",
      points_required: reward.points_required.toString(),
      reward_type: reward.reward_type,
      discount_percentage: reward.discount_percentage?.toString() || "",
      discount_amount: reward.discount_amount?.toString() || "",
      min_order_amount: reward.min_order_amount.toString(),
      max_uses_per_customer: reward.max_uses_per_customer?.toString() || "",
      pickup_only: reward.pickup_only,
      delivery_only: reward.delivery_only,
      dine_in_only: reward.dine_in_only,
      is_active: reward.is_active,
    });
    setEditingReward(reward);
    setIsAddingReward(false);
  };

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) {
      toast({ title: t("Virhe", "Error"), description: t("Nimi vaaditaan", "Name required"), variant: "destructive" });
      return;
    }

    const data = {
      name: ruleForm.name,
      description: ruleForm.description || null,
      points_per_euro: parseFloat(ruleForm.points_per_euro),
      min_order_amount: parseFloat(ruleForm.min_order_amount),
      pickup_multiplier: parseFloat(ruleForm.pickup_multiplier),
      delivery_multiplier: parseFloat(ruleForm.delivery_multiplier),
      dine_in_multiplier: parseFloat(ruleForm.dine_in_multiplier),
      is_active: ruleForm.is_active,
      priority: parseInt(ruleForm.priority),
    };

    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  const handleSaveReward = () => {
    if (!rewardForm.name.trim()) {
      toast({ title: t("Virhe", "Error"), description: t("Nimi vaaditaan", "Name required"), variant: "destructive" });
      return;
    }

    const data: Partial<LoyaltyReward> = {
      name: rewardForm.name,
      description: rewardForm.description || null,
      points_required: parseInt(rewardForm.points_required),
      reward_type: rewardForm.reward_type,
      discount_percentage: rewardForm.discount_percentage ? parseFloat(rewardForm.discount_percentage) : null,
      discount_amount: rewardForm.discount_amount ? parseFloat(rewardForm.discount_amount) : null,
      min_order_amount: parseFloat(rewardForm.min_order_amount),
      max_uses_per_customer: rewardForm.max_uses_per_customer ? parseInt(rewardForm.max_uses_per_customer) : null,
      pickup_only: rewardForm.pickup_only,
      delivery_only: rewardForm.delivery_only,
      dine_in_only: rewardForm.dine_in_only,
      is_active: rewardForm.is_active,
    };

    if (editingReward) {
      updateRewardMutation.mutate({ id: editingReward.id, data });
    } else {
      createRewardMutation.mutate(data);
    }
  };

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discount_percentage: t("Prosenttialennus", "Percentage discount"),
      discount_fixed: t("Kiinteä alennus", "Fixed discount"),
      free_item: t("Ilmainen tuote", "Free item"),
      free_delivery: t("Ilmainen toimitus", "Free delivery"),
      custom: t("Mukautettu", "Custom"),
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            {t("Kanta-asiakasohjelma", "Loyalty Program")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t("Pistesäännöt", "Points Rules")}
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              {t("Palkinnot", "Rewards")}
            </TabsTrigger>
          </TabsList>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            {(isAddingRule || editingRule) ? (
              <Card className="border-2 border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Säännön nimi", "Rule Name")} *</Label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                        placeholder={t("Esim. Peruspistet", "e.g. Basic Points")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Pisteet per €", "Points per €")} *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ruleForm.points_per_euro}
                        onChange={(e) => setRuleForm({ ...ruleForm, points_per_euro: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Kuvaus", "Description")}</Label>
                    <Textarea
                      value={ruleForm.description}
                      onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Nouto kerroin", "Pickup multiplier")}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ruleForm.pickup_multiplier}
                        onChange={(e) => setRuleForm({ ...ruleForm, pickup_multiplier: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">{t("1.5 = +50% pisteet", "1.5 = +50% points")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Toimitus kerroin", "Delivery multiplier")}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ruleForm.delivery_multiplier}
                        onChange={(e) => setRuleForm({ ...ruleForm, delivery_multiplier: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Min. tilaus €", "Min order €")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ruleForm.min_order_amount}
                        onChange={(e) => setRuleForm({ ...ruleForm, min_order_amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={ruleForm.is_active}
                      onCheckedChange={(checked) => setRuleForm({ ...ruleForm, is_active: checked })}
                    />
                    <Label>{t("Aktiivinen", "Active")}</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveRule} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                      <Save className="w-4 h-4 mr-2" />
                      {t("Tallenna", "Save")}
                    </Button>
                    <Button onClick={resetRuleForm} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      {t("Peruuta", "Cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setIsAddingRule(true)} className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("Lisää sääntö", "Add Rule")}
              </Button>
            )}

            {rulesLoading ? (
              <p className="text-center py-4">{t("Ladataan...", "Loading...")}</p>
            ) : rules && rules.length > 0 ? (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <Card key={rule.id} className={rule.is_active ? "" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-600" />
                            <span className="font-bold">{rule.name}</span>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? t("Aktiivinen", "Active") : t("Ei aktiivinen", "Inactive")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {rule.points_per_euro} {t("pistettä per €", "points per €")} | 
                            {t("Nouto", "Pickup")}: x{rule.pickup_multiplier} | 
                            {t("Toimitus", "Delivery")}: x{rule.delivery_multiplier}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => confirm(t("Poista?", "Delete?")) && deleteRuleMutation.mutate(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">{t("Ei sääntöjä", "No rules")}</p>
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            {(isAddingReward || editingReward) ? (
              <Card className="border-2 border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Palkinnon nimi", "Reward Name")} *</Label>
                      <Input
                        value={rewardForm.name}
                        onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                        placeholder={t("Esim. 10% alennus", "e.g. 10% discount")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Tarvittavat pisteet", "Points Required")} *</Label>
                      <Input
                        type="number"
                        value={rewardForm.points_required}
                        onChange={(e) => setRewardForm({ ...rewardForm, points_required: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Kuvaus", "Description")}</Label>
                    <Textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Palkinnon tyyppi", "Reward Type")}</Label>
                      <Select
                        value={rewardForm.reward_type}
                        onValueChange={(value) => setRewardForm({ ...rewardForm, reward_type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount_percentage">{t("Prosenttialennus", "Percentage Discount")}</SelectItem>
                          <SelectItem value="discount_fixed">{t("Kiinteä alennus €", "Fixed Discount €")}</SelectItem>
                          <SelectItem value="free_delivery">{t("Ilmainen toimitus", "Free Delivery")}</SelectItem>
                          <SelectItem value="free_item">{t("Ilmainen tuote", "Free Item")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {rewardForm.reward_type === "discount_percentage" && (
                      <div className="space-y-2">
                        <Label>{t("Alennus %", "Discount %")}</Label>
                        <Input
                          type="number"
                          value={rewardForm.discount_percentage}
                          onChange={(e) => setRewardForm({ ...rewardForm, discount_percentage: e.target.value })}
                        />
                      </div>
                    )}

                    {rewardForm.reward_type === "discount_fixed" && (
                      <div className="space-y-2">
                        <Label>{t("Alennus €", "Discount €")}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rewardForm.discount_amount}
                          onChange={(e) => setRewardForm({ ...rewardForm, discount_amount: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Min. tilaus €", "Min order €")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rewardForm.min_order_amount}
                        onChange={(e) => setRewardForm({ ...rewardForm, min_order_amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Maks. käytöt/asiakas", "Max uses/customer")}</Label>
                      <Input
                        type="number"
                        value={rewardForm.max_uses_per_customer}
                        onChange={(e) => setRewardForm({ ...rewardForm, max_uses_per_customer: e.target.value })}
                        placeholder={t("Rajaton", "Unlimited")}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>{t("Tilaustyyppi rajoitukset", "Order Type Restrictions")}</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rewardForm.pickup_only}
                          onCheckedChange={(checked) => setRewardForm({ ...rewardForm, pickup_only: checked, delivery_only: false, dine_in_only: false })}
                        />
                        <Label>{t("Vain nouto", "Pickup only")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rewardForm.delivery_only}
                          onCheckedChange={(checked) => setRewardForm({ ...rewardForm, delivery_only: checked, pickup_only: false, dine_in_only: false })}
                        />
                        <Label>{t("Vain toimitus", "Delivery only")}</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rewardForm.is_active}
                      onCheckedChange={(checked) => setRewardForm({ ...rewardForm, is_active: checked })}
                    />
                    <Label>{t("Aktiivinen", "Active")}</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveReward} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                      <Save className="w-4 h-4 mr-2" />
                      {t("Tallenna", "Save")}
                    </Button>
                    <Button onClick={resetRewardForm} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      {t("Peruuta", "Cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setIsAddingReward(true)} className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("Lisää palkinto", "Add Reward")}
              </Button>
            )}

            {rewardsLoading ? (
              <p className="text-center py-4">{t("Ladataan...", "Loading...")}</p>
            ) : rewards && rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className={reward.is_active ? "" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-yellow-600" />
                            <span className="font-bold">{reward.name}</span>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Star className="w-3 h-3" />
                            {reward.points_required} {t("pistettä", "points")}
                          </Badge>
                          <p className="text-sm text-gray-600">{getRewardTypeLabel(reward.reward_type)}</p>
                          {reward.pickup_only && <Badge variant="secondary">{t("Vain nouto", "Pickup only")}</Badge>}
                          {reward.delivery_only && <Badge variant="secondary">{t("Vain toimitus", "Delivery only")}</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditReward(reward)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => confirm(t("Poista?", "Delete?")) && deleteRewardMutation.mutate(reward.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">{t("Ei palkintoja", "No rewards")}</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
