import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { Plus, Trash2, Save, X, Ban, Phone, Mail, Search, UserX, AlertTriangle } from "lucide-react";

interface BlacklistEntry {
  id: string;
  email: string | null;
  phone: string | null;
  reason: string;
  blocked_by: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BlacklistManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlacklistManagementModal({ isOpen, onClose }: BlacklistManagementModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    reason: "",
    is_active: true,
  });

  // Fetch blacklist entries
  const { data: entries, isLoading } = useQuery({
    queryKey: ["customer-blacklist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_blacklist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlacklistEntry[];
    },
  });

  // Add to blacklist
  const addMutation = useMutation({
    mutationFn: async (data: Partial<BlacklistEntry>) => {
      const { error } = await supabase
        .from("customer_blacklist")
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-blacklist"] });
      toast({
        title: t("Onnistui", "Success"),
        description: t("Asiakas lisätty estolistalle", "Customer added to blacklist"),
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: t("Virhe", "Error"),
        description: t("Lisäys epäonnistui", "Failed to add"),
        variant: "destructive",
      });
    },
  });

  // Toggle status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("customer_blacklist")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-blacklist"] });
      toast({
        title: t("Onnistui", "Success"),
        description: t("Tila päivitetty", "Status updated"),
      });
    },
  });

  // Delete entry
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customer_blacklist")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-blacklist"] });
      toast({
        title: t("Onnistui", "Success"),
        description: t("Merkintä poistettu", "Entry deleted"),
      });
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      phone: "",
      reason: "",
      is_active: true,
    });
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.email && !formData.phone) {
      toast({
        title: t("Virhe", "Error"),
        description: t("Anna sähköposti tai puhelinnumero", "Provide email or phone number"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: t("Virhe", "Error"),
        description: t("Anna syy estolle", "Provide reason for blocking"),
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate({
      email: formData.email || null,
      phone: formData.phone || null,
      reason: formData.reason,
      is_active: formData.is_active,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Haluatko varmasti poistaa tämän eston?", "Are you sure you want to remove this block?"))) {
      deleteMutation.mutate(id);
    }
  };

  // Filter entries
  const filteredEntries = entries?.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.email?.toLowerCase().includes(query) ||
      entry.phone?.toLowerCase().includes(query) ||
      entry.reason.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Ban className="w-6 h-6 text-red-600" />
            {t("Asiakkaiden estolista", "Customer Blacklist")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Form */}
          {isAdding ? (
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">
                    {t("Lisää uusi esto", "Add new block")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("Sähköposti", "Email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t("Puhelinnumero", "Phone Number")}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+358..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">{t("Syy estolle", "Reason for block")} *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder={t("Kirjoita syy...", "Enter reason...")}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="isActive">{t("Aktiivinen esto", "Active block")}</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("Lisää estolistalle", "Add to blacklist")}
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    {t("Peruuta", "Cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              {t("Lisää esto", "Add Block")}
            </Button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Etsi sähköpostilla, puhelinnumerolla tai syyllä...", "Search by email, phone or reason...")}
              className="pl-10"
            />
          </div>

          {/* List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              {t("Ladataan...", "Loading...")}
            </div>
          ) : filteredEntries && filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className={`transition-all ${
                    entry.is_active
                      ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                      : "opacity-60"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <UserX className={`w-5 h-5 ${entry.is_active ? "text-red-600" : "text-gray-400"}`} />
                          <div className="flex gap-2 flex-wrap">
                            {entry.email && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {entry.email}
                              </Badge>
                            )}
                            {entry.phone && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {entry.phone}
                              </Badge>
                            )}
                          </div>
                          <Badge variant={entry.is_active ? "destructive" : "secondary"}>
                            {entry.is_active ? t("Estetty", "Blocked") : t("Ei aktiivinen", "Inactive")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                          <span className="font-medium">{t("Syy", "Reason")}:</span> {entry.reason}
                        </p>
                        <p className="text-xs text-gray-400 ml-8">
                          {t("Lisätty", "Added")}: {new Date(entry.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={entry.is_active}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: entry.id, is_active: checked })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
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
              <Ban className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{t("Ei estettyjä asiakkaita", "No blocked customers")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
