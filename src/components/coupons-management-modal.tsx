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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { Plus, Edit, Trash2, Save, X, Ticket, Copy, Link, Calendar, Percent, DollarSign, Gift, Truck, Search, Users } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_delivery' | 'free_item';
  discount_value: number | null;
  free_item_id: string | null;
  min_order_amount: number;
  max_discount_amount: number | null;
  max_uses_total: number | null;
  max_uses_per_customer: number;
  current_uses: number;
  new_customers_only: boolean;
  allowed_branches: string[] | null;
  pickup_only: boolean;
  delivery_only: boolean;
  dine_in_only: boolean;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  campaign_id: string | null;
  created_at: string;
}

interface CouponsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CouponsManagementModal({ isOpen, onClose }: CouponsManagementModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage" as Coupon['discount_type'],
    discount_value: "10",
    min_order_amount: "0",
    max_discount_amount: "",
    max_uses_total: "",
    max_uses_per_customer: "1",
    new_customers_only: false,
    pickup_only: false,
    delivery_only: false,
    dine_in_only: false,
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: "",
    is_active: true,
    campaign_id: "",
  });

  // Fetch branches for multi-select
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name, name_en").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupon-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const { error } = await supabase.from("coupon_codes").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon-codes"] });
      toast({ title: t("Onnistui", "Success"), description: t("Kuponki luotu", "Coupon created") });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: t("Virhe", "Error"), 
        description: error.message?.includes("duplicate") 
          ? t("Koodi on jo käytössä", "Code already exists") 
          : t("Luonti epäonnistui", "Creation failed"),
        variant: "destructive" 
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const { error } = await supabase.from("coupon_codes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon-codes"] });
      toast({ title: t("Onnistui", "Success"), description: t("Kuponki päivitetty", "Coupon updated") });
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupon_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon-codes"] });
      toast({ title: t("Onnistui", "Success"), description: t("Kuponki poistettu", "Coupon deleted") });
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupon_codes").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon-codes"] });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "10",
      min_order_amount: "0",
      max_discount_amount: "",
      max_uses_total: "",
      max_uses_per_customer: "1",
      new_customers_only: false,
      pickup_only: false,
      delivery_only: false,
      dine_in_only: false,
      valid_from: new Date().toISOString().slice(0, 16),
      valid_until: "",
      is_active: true,
      campaign_id: "",
    });
    setEditingCoupon(null);
    setIsAdding(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value?.toString() || "",
      min_order_amount: coupon.min_order_amount.toString(),
      max_discount_amount: coupon.max_discount_amount?.toString() || "",
      max_uses_total: coupon.max_uses_total?.toString() || "",
      max_uses_per_customer: coupon.max_uses_per_customer.toString(),
      new_customers_only: coupon.new_customers_only,
      pickup_only: coupon.pickup_only,
      delivery_only: coupon.delivery_only,
      dine_in_only: coupon.dine_in_only,
      valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : "",
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : "",
      is_active: coupon.is_active,
      campaign_id: coupon.campaign_id || "",
    });
    setEditingCoupon(coupon);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({ 
        title: t("Virhe", "Error"), 
        description: t("Koodi ja nimi vaaditaan", "Code and name required"), 
        variant: "destructive" 
      });
      return;
    }

    const data: Partial<Coupon> = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      max_uses_total: formData.max_uses_total ? parseInt(formData.max_uses_total) : null,
      max_uses_per_customer: parseInt(formData.max_uses_per_customer) || 1,
      new_customers_only: formData.new_customers_only,
      pickup_only: formData.pickup_only,
      delivery_only: formData.delivery_only,
      dine_in_only: formData.dine_in_only,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      is_active: formData.is_active,
      campaign_id: formData.campaign_id || null,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const copyPromoUrl = (code: string) => {
    const url = `${window.location.origin}/menu?promo=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: t("Kopioitu!", "Copied!"), description: url });
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'free_delivery': return <Truck className="w-4 h-4" />;
      case 'free_item': return <Gift className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const getDiscountLabel = (coupon: Coupon) => {
    switch (coupon.discount_type) {
      case 'percentage': return `${coupon.discount_value}%`;
      case 'fixed': return `€${coupon.discount_value}`;
      case 'free_delivery': return t("Ilmainen toimitus", "Free delivery");
      case 'free_item': return t("Ilmainen tuote", "Free item");
      default: return "";
    }
  };

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.is_active) return false;
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return false;
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return false;
    if (coupon.max_uses_total && coupon.current_uses >= coupon.max_uses_total) return false;
    return true;
  };

  // Filter coupons
  const filteredCoupons = coupons?.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-purple-600" />
            {t("Kuponkikoodit", "Coupon Codes")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(isAdding || editingCoupon) ? (
            <Card className="border-2 border-purple-200 dark:border-purple-900">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Koodi", "Code")} *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER2024"
                        className="uppercase"
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        {t("Luo", "Gen")}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("Nimi", "Name")} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("Kesätarjous 2024", "Summer Sale 2024")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("Kuvaus", "Description")}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Alennustyyppi", "Discount Type")}</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) => setFormData({ ...formData, discount_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">{t("Prosentti %", "Percentage %")}</SelectItem>
                        <SelectItem value="fixed">{t("Kiinteä €", "Fixed €")}</SelectItem>
                        <SelectItem value="free_delivery">{t("Ilmainen toimitus", "Free Delivery")}</SelectItem>
                        <SelectItem value="free_item">{t("Ilmainen tuote", "Free Item")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.discount_type === "percentage" || formData.discount_type === "fixed") && (
                    <div className="space-y-2">
                      <Label>{formData.discount_type === "percentage" ? t("Alennus %", "Discount %") : t("Alennus €", "Discount €")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      />
                    </div>
                  )}

                  {formData.discount_type === "percentage" && (
                    <div className="space-y-2">
                      <Label>{t("Max. alennus €", "Max discount €")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.max_discount_amount}
                        onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                        placeholder={t("Rajaton", "Unlimited")}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Min. tilaus €", "Min order €")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Max käytöt (yht.)", "Max uses (total)")}</Label>
                    <Input
                      type="number"
                      value={formData.max_uses_total}
                      onChange={(e) => setFormData({ ...formData, max_uses_total: e.target.value })}
                      placeholder={t("Rajaton", "Unlimited")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Max/asiakas", "Max/customer")}</Label>
                    <Input
                      type="number"
                      value={formData.max_uses_per_customer}
                      onChange={(e) => setFormData({ ...formData, max_uses_per_customer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Kampanja ID", "Campaign ID")}</Label>
                    <Input
                      value={formData.campaign_id}
                      onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                      placeholder="summer_2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Voimassa alkaen", "Valid from")}</Label>
                    <Input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Voimassa asti", "Valid until")}</Label>
                    <Input
                      type="datetime-local"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t("Rajoitukset", "Restrictions")}</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.pickup_only}
                        onCheckedChange={(checked) => setFormData({ ...formData, pickup_only: checked, delivery_only: false, dine_in_only: false })}
                      />
                      <Label>{t("Vain nouto", "Pickup only")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.delivery_only}
                        onCheckedChange={(checked) => setFormData({ ...formData, delivery_only: checked, pickup_only: false, dine_in_only: false })}
                      />
                      <Label>{t("Vain toimitus", "Delivery only")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.new_customers_only}
                        onCheckedChange={(checked) => setFormData({ ...formData, new_customers_only: checked })}
                      />
                      <Label>{t("Vain uudet asiakkaat", "New customers only")}</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{t("Aktiivinen", "Active")}</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("Tallenna", "Save")}
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    {t("Peruuta", "Cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              {t("Luo kuponki", "Create Coupon")}
            </Button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Etsi koodilla tai nimellä...", "Search by code or name...")}
              className="pl-10"
            />
          </div>

          {/* Coupons List */}
          {isLoading ? (
            <p className="text-center py-4">{t("Ladataan...", "Loading...")}</p>
          ) : filteredCoupons && filteredCoupons.length > 0 ? (
            <div className="space-y-3">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className={isCouponActive(coupon) ? "" : "opacity-60"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                            {coupon.code}
                          </Badge>
                          <span className="font-medium">{coupon.name}</span>
                          <Badge 
                            variant={isCouponActive(coupon) ? "default" : "secondary"}
                            className={isCouponActive(coupon) ? "bg-green-500" : ""}
                          >
                            {isCouponActive(coupon) ? t("Aktiivinen", "Active") : t("Ei aktiivinen", "Inactive")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            {getDiscountTypeIcon(coupon.discount_type)}
                            {getDiscountLabel(coupon)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {coupon.current_uses}/{coupon.max_uses_total || "∞"} {t("käyttöä", "uses")}
                          </span>
                          {coupon.min_order_amount > 0 && (
                            <span>Min. €{coupon.min_order_amount}</span>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {coupon.pickup_only && <Badge variant="secondary">{t("Nouto", "Pickup")}</Badge>}
                          {coupon.delivery_only && <Badge variant="secondary">{t("Toimitus", "Delivery")}</Badge>}
                          {coupon.new_customers_only && <Badge variant="secondary">{t("Uudet", "New")}</Badge>}
                          {coupon.valid_until && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(coupon.valid_until).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPromoUrl(coupon.code)}
                          title={t("Kopioi linkki", "Copy link")}
                        >
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast({ title: t("Kopioitu!", "Copied!") });
                          }}
                          title={t("Kopioi koodi", "Copy code")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: coupon.id, is_active: checked })}
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => confirm(t("Poista?", "Delete?")) && deleteMutation.mutate(coupon.id)}
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
            <div className="text-center py-12 text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{t("Ei kuponkeja", "No coupons")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
