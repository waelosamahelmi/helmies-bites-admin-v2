import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useRestaurantSettings } from "@/hooks/use-restaurant-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { CreditCard, Building2, Check, X, RefreshCw, Loader2, Banknote, Smartphone, Info } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  name_en?: string;
  is_active: boolean;
}

interface BranchPaymentMethod {
  id: string;
  branch_id: string;
  payment_method: string;
  is_enabled: boolean;
  display_order: number;
  settings: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

interface BranchPaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// All possible payment methods (will be filtered by what's enabled in main settings)
const ALL_PAYMENT_METHODS = [
  // Basic methods
  { key: "cash_or_card", name: "Käteinen tai kortti", name_en: "Cash or Card", icon: "💳", category: "basic" },
  { key: "cash", name: "Käteinen", name_en: "Cash", icon: "💵", category: "basic" },
  { key: "card", name: "Korttimaksu", name_en: "Card Payment", icon: "💳", category: "basic" },
  // Stripe payment methods
  { key: "stripe_card", name: "Verkkokortit (Stripe)", name_en: "Online Cards (Stripe)", icon: "💳", category: "stripe" },
  { key: "apple_pay", name: "Apple Pay", name_en: "Apple Pay", icon: "🍎", category: "stripe" },
  { key: "google_pay", name: "Google Pay", name_en: "Google Pay", icon: "🤖", category: "stripe" },
  { key: "klarna", name: "Klarna", name_en: "Klarna", icon: "🛒", category: "stripe" },
  { key: "link", name: "Link", name_en: "Link", icon: "🔗", category: "stripe" },
  { key: "ideal", name: "iDEAL", name_en: "iDEAL", icon: "🏦", category: "stripe" },
  { key: "sepa_debit", name: "SEPA-veloitus", name_en: "SEPA Debit", icon: "🏧", category: "stripe" },
  // Other methods
  { key: "mobilepay", name: "MobilePay", name_en: "MobilePay", icon: "📱", category: "other" },
  { key: "invoice", name: "Lasku", name_en: "Invoice", icon: "📄", category: "other" },
  { key: "lunch_voucher", name: "Lounasseteli", name_en: "Lunch Voucher", icon: "🎟️", category: "other" },
];

export function BranchPaymentMethodsModal({ isOpen, onClose }: BranchPaymentMethodsModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Fetch restaurant settings to get enabled payment methods
  const { data: restaurantSettings, isLoading: settingsLoading } = useRestaurantSettings();

  // Get available payment methods based on restaurant settings
  const availablePaymentMethods = useMemo(() => {
    if (!restaurantSettings) return [];
    
    const methods: typeof ALL_PAYMENT_METHODS = [];
    
    // Check if cash/card is enabled in main payment methods
    const mainPaymentMethods = restaurantSettings.paymentMethods || [];
    const cashOrCardMethod = mainPaymentMethods.find((m: any) => 
      m.id === 'cash_or_card' || m.id === 'cash' || m.id === 'card'
    );
    
    if (cashOrCardMethod?.enabled !== false) {
      methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'cash_or_card')!);
    }
    
    // Check if online payment (Stripe) is enabled
    const stripeEnabled = restaurantSettings.stripeEnabled === true;
    
    if (stripeEnabled) {
      // Get Stripe payment methods config
      let stripeConfig: Record<string, boolean> = { card: true }; // Card is always available with Stripe
      
      if (restaurantSettings.stripePaymentMethodsConfig) {
        try {
          stripeConfig = typeof restaurantSettings.stripePaymentMethodsConfig === 'string'
            ? JSON.parse(restaurantSettings.stripePaymentMethodsConfig)
            : restaurantSettings.stripePaymentMethodsConfig;
        } catch (e) {
          console.error('Failed to parse stripe payment methods config:', e);
        }
      }
      
      // Add Stripe card payments
      methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'stripe_card')!);
      
      // Add other enabled Stripe methods
      if (stripeConfig.applePay) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'apple_pay')!);
      }
      if (stripeConfig.googlePay) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'google_pay')!);
      }
      if (stripeConfig.klarna) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'klarna')!);
      }
      if (stripeConfig.link) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'link')!);
      }
      if (stripeConfig.ideal) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'ideal')!);
      }
      if (stripeConfig.sepaDebit) {
        methods.push(ALL_PAYMENT_METHODS.find(m => m.key === 'sepa_debit')!);
      }
    }
    
    return methods.filter(Boolean);
  }, [restaurantSettings]);

  // Fetch branches
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, name_en, is_active")
        .order("name");
      if (error) throw error;
      return data as Branch[];
    },
  });

  // Fetch payment methods for all branches
  const { data: paymentMethods, isLoading: methodsLoading, refetch } = useQuery({
    queryKey: ["branch-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_payment_methods")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as BranchPaymentMethod[];
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ branchId, methodKey, enabled }: { branchId: string; methodKey: string; enabled: boolean }) => {
      // Check if record exists
      const existing = paymentMethods?.find(
        (pm) => pm.branch_id === branchId && pm.payment_method === methodKey
      );

      if (existing) {
        const { error } = await supabase
          .from("branch_payment_methods")
          .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("branch_payment_methods")
          .insert([{
            branch_id: branchId,
            payment_method: methodKey,
            is_enabled: enabled,
            display_order: availablePaymentMethods.findIndex(m => m.key === methodKey),
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-payment-methods"] });
    },
    onError: () => {
      toast({ 
        title: t("Virhe", "Error"), 
        description: t("Päivitys epäonnistui", "Update failed"),
        variant: "destructive" 
      });
    },
  });

  // Initialize default methods for a branch
  const initializeMutation = useMutation({
    mutationFn: async (branchId: string) => {
      const existingMethods = paymentMethods?.filter(pm => pm.branch_id === branchId) || [];
      const existingKeys = existingMethods.map(m => m.payment_method);
      
      const newMethods = availablePaymentMethods
        .filter(m => !existingKeys.includes(m.key))
        .map((m, idx) => ({
          branch_id: branchId,
          payment_method: m.key,
          is_enabled: m.key === 'card', // Only card enabled by default
          display_order: idx,
        }));

      if (newMethods.length > 0) {
        const { error } = await supabase
          .from("branch_payment_methods")
          .insert(newMethods);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-payment-methods"] });
      toast({ 
        title: t("Onnistui", "Success"), 
        description: t("Maksutavat alustettu", "Payment methods initialized") 
      });
    },
  });

  // Enable all for branch (only available methods)
  const enableAllMutation = useMutation({
    mutationFn: async (branchId: string) => {
      const availableKeys = availablePaymentMethods.map(m => m.key);
      const { error } = await supabase
        .from("branch_payment_methods")
        .update({ is_enabled: true, updated_at: new Date().toISOString() })
        .eq("branch_id", branchId)
        .in("payment_method", availableKeys);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-payment-methods"] });
    },
  });

  // Disable all for branch (only available methods)
  const disableAllMutation = useMutation({
    mutationFn: async (branchId: string) => {
      const availableKeys = availablePaymentMethods.map(m => m.key);
      const { error } = await supabase
        .from("branch_payment_methods")
        .update({ is_enabled: false, updated_at: new Date().toISOString() })
        .eq("branch_id", branchId)
        .in("payment_method", availableKeys);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-payment-methods"] });
    },
  });

  const getMethodStatus = (branchId: string, methodKey: string): boolean => {
    const method = paymentMethods?.find(
      (pm) => pm.branch_id === branchId && pm.payment_method === methodKey
    );
    return method?.is_enabled ?? false;
  };

  const getBranchMethodCount = (branchId: string): number => {
    return paymentMethods?.filter(pm => pm.branch_id === branchId && pm.is_enabled).length || 0;
  };

  const isLoading = branchesLoading || methodsLoading || settingsLoading;

  // Set first branch as selected if none selected
  if (!selectedBranchId && branches && branches.length > 0) {
    setSelectedBranchId(branches[0].id);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            {t("Toimipisteen maksutavat", "Branch Payment Methods")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : branches && branches.length > 0 ? (
          <Tabs value={selectedBranchId || branches[0].id} onValueChange={setSelectedBranchId}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(branches.length, 4)}, 1fr)` }}>
              {branches.map((branch) => (
                <TabsTrigger key={branch.id} value={branch.id} className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">{language === 'en' ? (branch.name_en || branch.name) : branch.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {getBranchMethodCount(branch.id)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {branches.map((branch) => (
              <TabsContent key={branch.id} value={branch.id} className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {t(
                      "Valitse mitkä maksutavat ovat käytössä tässä toimipisteessä.",
                      "Select which payment methods are available at this branch."
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => initializeMutation.mutate(branch.id)}
                      disabled={initializeMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t("Alusta", "Initialize")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => enableAllMutation.mutate(branch.id)}
                      disabled={enableAllMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t("Kaikki päälle", "Enable All")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disableAllMutation.mutate(branch.id)}
                      disabled={disableAllMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t("Kaikki pois", "Disable All")}
                    </Button>
                  </div>
                </div>

                {availablePaymentMethods.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      <p>
                        {t(
                          "Ei maksutapoja määritetty. Määritä ensin maksutavat Asetukset → Maksutavat -sivulla.",
                          "No payment methods configured. Please configure payment methods in Settings → Payment Methods first."
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePaymentMethods.map((method) => {
                      const isEnabled = getMethodStatus(branch.id, method.key);
                      return (
                        <Card 
                          key={method.key} 
                          className={`transition-all ${isEnabled ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' : 'opacity-60'}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{method.icon}</span>
                                <div>
                                  <p className="font-medium">
                                    {language === 'en' ? method.name_en : method.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{method.key}</p>
                                </div>
                              </div>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => 
                                  toggleMutation.mutate({ 
                                    branchId: branch.id, 
                                    methodKey: method.key, 
                                    enabled: checked 
                                  })
                                }
                                disabled={toggleMutation.isPending}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {!branch.is_active && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                    {t(
                      "⚠️ Tämä toimipiste ei ole aktiivinen. Maksutapa-asetukset tallentuvat, mutta ne eivät vaikuta tilaamista.",
                      "⚠️ This branch is not active. Payment method settings will be saved but won't affect ordering."
                    )}
                  </div>
                )}

                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {t("Huomio Stripe-maksutavoista", "Note about Stripe Payment Methods")}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t(
                        "Kortti-, Apple Pay-, Google Pay- ja Klarna-maksut käyttävät Stripe-integraatiota. Nämä maksutavat täytyy myös aktivoida Stripe Dashboardissa (Payment Methods -osiossa) jotta ne toimivat.",
                        "Card, Apple Pay, Google Pay and Klarna payments use Stripe integration. These payment methods must also be activated in the Stripe Dashboard (Payment Methods section) to work."
                      )}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{t("Ei toimipisteitä", "No branches")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
