import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Star, 
  Ban, 
  CheckCircle,
  XCircle,
  Gift,
  ShoppingBag,
  Loader2,
  UserX,
  UserCheck,
  Eye
} from "lucide-react";

interface Customer {
  id: string;
  auth_id: string | null;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  addresses: any[];
  marketing_emails: boolean;
  sms_notifications: boolean;
  is_verified: boolean;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  created_at: string;
  last_login_at: string | null;
}

interface CustomerManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerManagementModal({ open, onOpenChange }: CustomerManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },
    enabled: open,
  });

  // Toggle customer active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("customers")
        .update({ is_active: isActive })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast({
        title: "Asiakkaan tila päivitetty",
        description: "Customer status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add loyalty points
  const addPointsMutation = useMutation({
    mutationFn: async ({ id, points }: { id: string; points: number }) => {
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("loyalty_points")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("customers")
        .update({ loyalty_points: (customer.loyalty_points || 0) + points })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setPointsToAdd("");
      toast({
        title: "Pisteet lisätty",
        description: "Loyalty points added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter customers by search
  const filteredCustomers = customers?.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.email.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query)
    );
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fi-FI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} €`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Asiakashallinta / Customer Management
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Hae asiakkaita... / Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stats Summary */}
            {customers && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Asiakkaita yhteensä</p>
                  <p className="text-xl font-bold text-blue-600">{customers.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Aktiivisia</p>
                  <p className="text-xl font-bold text-green-600">
                    {customers.filter(c => c.is_active).length}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tilauksia yhteensä</p>
                  <p className="text-xl font-bold text-purple-600">
                    {customers.reduce((sum, c) => sum + c.total_orders, 0)}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Liikevaihto</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(customers.reduce((sum, c) => sum + Number(c.total_spent), 0))}
                  </p>
                </div>
              </div>
            )}

            {/* Customer Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredCustomers && filteredCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asiakas / Customer</TableHead>
                      <TableHead>Yhteystiedot / Contact</TableHead>
                      <TableHead className="text-center">Tilaukset</TableHead>
                      <TableHead className="text-center">Käytetty</TableHead>
                      <TableHead className="text-center">Pisteet</TableHead>
                      <TableHead className="text-center">Tila</TableHead>
                      <TableHead className="text-right">Toiminnot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {customer.first_name || customer.last_name
                                ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                                : "Nimetön"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Liittynyt: {formatDate(customer.created_at)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            {customer.total_orders}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {formatCurrency(Number(customer.total_spent))}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {customer.loyalty_points}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {customer.is_active ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktiivinen
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Estetty
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowDetailModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Näytä tiedot
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  const points = prompt("Lisää pisteitä / Add points:");
                                  if (points && !isNaN(Number(points))) {
                                    addPointsMutation.mutate({
                                      id: customer.id,
                                      points: Number(points),
                                    });
                                  }
                                }}
                              >
                                <Gift className="w-4 h-4 mr-2" />
                                Lisää pisteitä
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toggleActiveMutation.mutate({
                                    id: customer.id,
                                    isActive: !customer.is_active,
                                  });
                                }}
                                className={customer.is_active ? "text-red-600" : "text-green-600"}
                              >
                                {customer.is_active ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Estä asiakas
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aktivoi asiakas
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Users className="w-12 h-12 mb-2 opacity-50" />
                  <p>Ei asiakkaita / No customers found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asiakastiedot / Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Nimi / Name</Label>
                  <p className="font-medium">
                    {selectedCustomer.first_name || selectedCustomer.last_name
                      ? `${selectedCustomer.first_name || ""} ${selectedCustomer.last_name || ""}`.trim()
                      : "Ei nimeä"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Sähköposti / Email</Label>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Puhelin / Phone</Label>
                  <p className="font-medium">{selectedCustomer.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Liittynyt / Joined</Label>
                  <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-xs text-gray-500 mb-2 block">Tilastot / Stats</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{selectedCustomer.total_orders}</p>
                    <p className="text-xs text-gray-500">Tilaukset</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <span className="text-lg">€</span>
                    <p className="text-lg font-bold">{formatCurrency(Number(selectedCustomer.total_spent))}</p>
                    <p className="text-xs text-gray-500">Käytetty</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-lg font-bold">{selectedCustomer.loyalty_points}</p>
                    <p className="text-xs text-gray-500">Pisteet</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-xs text-gray-500 mb-2 block">Asetukset / Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Markkinointisähköpostit</span>
                    <Badge variant={selectedCustomer.marketing_emails ? "default" : "secondary"}>
                      {selectedCustomer.marketing_emails ? "Kyllä" : "Ei"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS-ilmoitukset</span>
                    <Badge variant={selectedCustomer.sms_notifications ? "default" : "secondary"}>
                      {selectedCustomer.sms_notifications ? "Kyllä" : "Ei"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vahvistettu</span>
                    <Badge variant={selectedCustomer.is_verified ? "default" : "secondary"}>
                      {selectedCustomer.is_verified ? "Kyllä" : "Ei"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Tallennetut osoitteet ({selectedCustomer.addresses.length})
                  </Label>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {addr.streetAddress}, {addr.postalCode} {addr.city}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
