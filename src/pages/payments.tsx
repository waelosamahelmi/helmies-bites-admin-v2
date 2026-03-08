import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, DollarSign, Search, AlertCircle, CalendarIcon, ArrowLeft, Wallet, Globe, Moon, Sun, LogOut, Menu, X, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { format } from "date-fns";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  paymentStatus: string;
  paymentMethod: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

interface OrphanedPayment {
  stripe_payment_intent_id: string;
  stripe_status: string;
  stripe_amount: number;
  stripe_currency: string;
  stripe_created: string;
  stripe_customer_email: string | null;
  stripe_description: string | null;
  stripe_metadata: Record<string, any>;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useSupabaseAuth();
  const [, navigate] = useLocation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // New filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Orphaned payments
  const [orphanedPayments, setOrphanedPayments] = useState<OrphanedPayment[]>([]);
  const [showOrphanedPayments, setShowOrphanedPayments] = useState(false);
  const [loadingOrphaned, setLoadingOrphaned] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<OrphanedPayment | null>(null);
  const [linkOrderId, setLinkOrderId] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linking, setLinking] = useState(false);

  // Translation function
  const adminT = (fi: string, en: string, ar: string) => {
    if (language === "fi") return fi;
    if (language === "en") return en;
    if (language === "ar") return ar;
    return fi;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();

      // Filter only orders with online payment
      const onlineOrders = data.filter(
        (order: Order) => order.paymentMethod === "online" || order.paymentMethod === "stripe"
      );

      setOrders(onlineOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const syncPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/sync-payments");
      if (!response.ok) throw new Error("Failed to sync payments");
      const result = await response.json();

      toast({
        title: adminT("Synkronointi valmis", "Sync Complete", "اكتمل التزامن"),
        description: adminT(
          `Päivitetty: ${result.updated}, Jo synkronoitu: ${result.already_synced}`,
          `Updated: ${result.updated}, Already synced: ${result.already_synced}`,
          `محدث: ${result.updated}، متزامن بالفعل: ${result.already_synced}`
        ),
      });

      // Refresh orders after sync
      fetchOrders();
    } catch (error) {
      console.error("Error syncing payments:", error);
      toast({
        title: adminT("Virhe", "Error", "خطأ"),
        description: adminT(
          "Synkronointi epäonnistui",
          "Failed to sync payments",
          "فشل تزامن المدفوعات"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrphanedPayments = async () => {
    setLoadingOrphaned(true);
    try {
      const response = await fetch("/api/stripe/stripe-payments");
      if (!response.ok) throw new Error("Failed to fetch Stripe payments");
      const result = await response.json();

      // Filter only orphaned payments (not in database)
      const orphaned = result.payments.filter((p: any) => !p.db_order_id && p.stripe_status === 'succeeded');
      setOrphanedPayments(orphaned);
      setShowOrphanedPayments(true);

      toast({
        title: adminT("Ladattu", "Loaded", "تم التحميل"),
        description: adminT(
          `Löytyi ${orphaned.length} maksamatonta maksua`,
          `Found ${orphaned.length} orphaned payments`,
          `تم العثور على ${orphaned.length} مدفوعات بدون طلبات`
        ),
      });
    } catch (error) {
      console.error("Error fetching orphaned payments:", error);
      toast({
        title: adminT("Virhe", "Error", "خطأ"),
        description: adminT(
          "Maksujen lataus epäonnistui",
          "Failed to load payments",
          "فشل تحميل المدفوعات"
        ),
        variant: "destructive",
      });
    } finally {
      setLoadingOrphaned(false);
    }
  };

  const handleLinkPayment = async () => {
    if (!selectedPayment || !linkOrderId) {
      toast({
        title: adminT("Virhe", "Error", "خطأ"),
        description: adminT(
          "Valitse tilaus",
          "Please enter order ID",
          "الرجاء إدخال رقم الطلب"
        ),
        variant: "destructive",
      });
      return;
    }

    setLinking(true);
    try {
      const response = await fetch("/api/stripe/link-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: selectedPayment.stripe_payment_intent_id,
          orderId: parseInt(linkOrderId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to link payment");
      }

      toast({
        title: adminT("Linkitetty", "Linked Successfully", "تم الربط بنجاح"),
        description: adminT(
          `Maksu linkitetty tilaukseen #${linkOrderId}`,
          `Payment linked to order #${linkOrderId}`,
          `تم ربط الدفعة بالطلب #${linkOrderId}`
        ),
      });

      setShowLinkDialog(false);
      setLinkOrderId("");
      fetchOrphanedPayments(); // Refresh orphaned payments
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Link payment error:", error);
      toast({
        title: adminT("Virhe", "Error", "خطأ"),
        description: error instanceof Error ? error.message : "Failed to link payment",
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  const handleRefundClick = (order: Order) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalAmount);
    setShowRefundDialog(true);
  };

  const handleRefund = async () => {
    if (!selectedOrder || !selectedOrder.stripePaymentIntentId) {
      toast({
        title: "Error",
        description: "No payment intent ID found for this order",
        variant: "destructive",
      });
      return;
    }

    setRefunding(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://babylon-admin.fly.dev';
      const response = await fetch(`${apiUrl}/api/stripe/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: selectedOrder.stripePaymentIntentId,
          amount: parseFloat(refundAmount),
          orderId: selectedOrder.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Refund failed");
      }

      const result = await response.json();

      toast({
        title: "Refund Successful",
        description: `Refunded €${refundAmount} for order #${selectedOrder.orderNumber}`,
      });

      setShowRefundDialog(false);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error("Refund error:", error);
      toast({
        title: "Refund Failed",
        description: error instanceof Error ? error.message : "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setRefunding(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;

    // Payment method filter
    const matchesPaymentMethod =
      paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;

    // Date range filter
    const orderDate = new Date(order.createdAt);
    const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
    const matchesDateTo = !dateTo || orderDate <= new Date(dateTo.getTime() + 86400000); // Add 1 day to include the end date

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending_payment: "secondary",
      failed: "destructive",
      refunded: "outline",
    };

    const labels: Record<string, string> = {
      paid: "Paid",
      pending_payment: "Pending",
      failed: "Failed",
      refunded: "Refunded",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const totalPaid = filteredOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  const totalRefunded = filteredOrders
    .filter((o) => o.paymentStatus === "refunded")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {adminT("Maksut & palautukset", "Payments & Refunds", "المدفوعات والمرتجعات")}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {adminT("Hallintapaneeli", "Admin Panel", "لوحة الإدارة")}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Button onClick={syncPayments} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {adminT("Synkronoi Stripe", "Sync Stripe", "مزامنة Stripe")}
              </Button>

              <Button onClick={fetchOrders} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {adminT("Päivitä", "Refresh", "تحديث")}
              </Button>

              <Button onClick={fetchOrphanedPayments} variant="outline" size="sm" disabled={loadingOrphaned}>
                <AlertCircle className={`mr-2 h-4 w-4 ${loadingOrphaned ? 'animate-spin' : ''}`} />
                {adminT("Näytä linkittämättömät", "Orphaned Payments", "المدفوعات غير المربوطة")}
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="px-3 py-2"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Language Selection */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="px-3 py-2 flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {language === "fi" ? "FI" : language === "en" ? "EN" : "AR"}
                  </span>
                </Button>

                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <button
                      onClick={() => {
                        setLanguage("fi");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg text-sm ${
                        language === "fi" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : ""
                      }`}
                    >
                      🇫🇮 Suomi
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        language === "en" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : ""
                      }`}
                    >
                      🇺🇸 English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("ar");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg text-sm ${
                        language === "ar" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : ""
                      }`}
                    >
                      🇸🇦 العربية
                    </button>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-4">
              <Button onClick={syncPayments} variant="outline" className="w-full justify-start" disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {adminT("Synkronoi Stripe", "Sync Stripe", "مزامنة Stripe")}
              </Button>

              <Button onClick={fetchOrders} variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                {adminT("Päivitä", "Refresh", "تحديث")}
              </Button>

              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full justify-start"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {theme === "dark" ? adminT("Vaalea teema", "Light theme", "السمة الفاتحة") : adminT("Tumma teema", "Dark theme", "السمة المظلمة")}
              </Button>

              <Button
                variant="outline"
                onClick={signOut}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {adminT("Kirjaudu ulos", "Sign out", "تسجيل الخروج")}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6 space-y-6">

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {adminT("Maksettu yhteensä", "Total Paid", "إجمالي المدفوع")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalPaid.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredOrders.filter((o) => o.paymentStatus === "paid").length}{" "}
                {adminT("maksua", "payments", "مدفوعات")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {adminT("Palautettu yhteensä", "Total Refunded", "إجمالي المسترد")}
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalRefunded.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredOrders.filter((o) => o.paymentStatus === "refunded").length}{" "}
                {adminT("palautusta", "refunds", "استردادات")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {adminT("Odottaa", "Pending", "قيد الانتظار")}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredOrders.filter((o) => o.paymentStatus === "pending_payment").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {adminT("Odottaa maksua", "Awaiting payment", "في انتظار الدفع")}
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{adminT("Maksut", "Payments", "المدفوعات")}</CardTitle>
              <CardDescription>
                {adminT("Hae ja hallitse verkkomaksuja", "Search and manage online payments", "البحث وإدارة المدفوعات عبر الإنترنت")}
              </CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label className="text-xs mb-2 block">
                {adminT("Hae", "Search", "بحث")}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={adminT("Tilausnumero, nimi, sähköposti...", "Order number, name, email...", "رقم الطلب، الاسم، البريد الإلكتروني...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-xs mb-2 block">
                {adminT("Tila", "Status", "الحالة")}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{adminT("Kaikki", "All", "الكل")}</SelectItem>
                  <SelectItem value="paid">{adminT("Maksettu", "Paid", "مدفوع")}</SelectItem>
                  <SelectItem value="pending_payment">{adminT("Odottaa", "Pending", "قيد الانتظار")}</SelectItem>
                  <SelectItem value="failed">{adminT("Epäonnistunut", "Failed", "فشل")}</SelectItem>
                  <SelectItem value="refunded">{adminT("Palautettu", "Refunded", "مسترد")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Label className="text-xs mb-2 block">
                {adminT("Alkaen", "From", "من")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dateFrom && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd.MM.yyyy") : adminT("Valitse", "Pick", "اختر")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div>
              <Label className="text-xs mb-2 block">
                {adminT("Asti", "To", "إلى")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dateTo && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd.MM.yyyy") : adminT("Valitse", "Pick", "اختر")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                {adminT("Tyhjennä suodattimet", "Clear filters", "مسح الفلاتر")}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{adminT("Tilaus #", "Order #", "طلب #")}</TableHead>
                  <TableHead>{adminT("Asiakas", "Customer", "العميل")}</TableHead>
                  <TableHead>{adminT("Summa", "Amount", "المبلغ")}</TableHead>
                  <TableHead>{adminT("Tila", "Status", "الحالة")}</TableHead>
                  <TableHead>{adminT("Päivämäärä", "Date", "التاريخ")}</TableHead>
                  <TableHead>{adminT("Maksu ID", "Payment ID", "معرف الدفع")}</TableHead>
                  <TableHead>{adminT("Toiminnot", "Actions", "الإجراءات")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {adminT("Ei maksuja", "No payments found", "لم يتم العثور على مدفوعات")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber || order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>€{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("fi-FI", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">
                          {order.stripePaymentIntentId
                            ? `${order.stripePaymentIntentId.substring(0, 20)}...`
                            : "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        {order.paymentStatus === "paid" &&
                          order.stripePaymentIntentId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefundClick(order)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {adminT("Palauta", "Refund", "استرداد")}
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{adminT("Tee palautus", "Issue Refund", "إصدار استرداد")}</DialogTitle>
              <DialogDescription>
                {adminT("Palauta maksu tilaukselle", "Refund payment for order", "استرداد الدفع للطلب")} #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="refund-amount">
                  {adminT("Palautuksen määrä (€)", "Refund Amount (€)", "مبلغ الاسترداد (€)")}
                </Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {adminT("Alkuperäinen summa", "Original amount", "المبلغ الأصلي")}: €{selectedOrder?.totalAmount}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>{adminT("Varoitus", "Warning", "تحذير")}:</strong>{" "}
                  {adminT(
                    "Tämä palauttaa maksun Stripen kautta. Asiakas saa palautuksen 5-10 arkipäivässä.",
                    "This will refund the payment through Stripe. The customer will receive the refund in 5-10 business days.",
                    "سيؤدي هذا إلى استرداد الدفع عبر Stripe. سيحصل العميل على الاسترداد خلال 5-10 أيام عمل."
                  )}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRefundDialog(false)}
                disabled={refunding}
              >
                {adminT("Peruuta", "Cancel", "إلغاء")}
              </Button>
              <Button
                onClick={handleRefund}
                disabled={refunding || !refundAmount || parseFloat(refundAmount) <= 0}
              >
                {refunding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {adminT("Käsitellään...", "Processing...", "معالجة...")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {adminT("Tee palautus", "Issue Refund", "إصدار استرداد")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Orphaned Payments Section */}
        {showOrphanedPayments && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    {adminT("Linkittämättömät maksut", "Orphaned Payments", "المدفوعات غير المربوطة")}
                  </CardTitle>
                  <CardDescription>
                    {adminT(
                      "Nämä maksut löytyvät Stripestä, mutta niitä ei ole linkitetty mihinkään tilaukseen",
                      "These payments exist in Stripe but are not linked to any order",
                      "هذه المدفوعات موجودة في Stripe لكنها غير مرتبطة بأي طلب"
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowOrphanedPayments(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOrphaned ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : orphanedPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {adminT(
                    "Ei linkittämättömiä maksuja",
                    "No orphaned payments found",
                    "لم يتم العثور على مدفوعات غير مربوطة"
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{adminT("Payment ID", "Payment ID", "معرف الدفع")}</TableHead>
                      <TableHead>{adminT("Summa", "Amount", "المبلغ")}</TableHead>
                      <TableHead>{adminT("Päivämäärä", "Date", "التاريخ")}</TableHead>
                      <TableHead>{adminT("Sähköposti", "Email", "البريد الإلكتروني")}</TableHead>
                      <TableHead>{adminT("Metadata", "Metadata", "البيانات")}</TableHead>
                      <TableHead>{adminT("Toiminnot", "Actions", "الإجراءات")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanedPayments.map((payment) => (
                      <TableRow key={payment.stripe_payment_intent_id}>
                        <TableCell>
                          <code className="text-xs">
                            {payment.stripe_payment_intent_id.substring(0, 20)}...
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          €{payment.stripe_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.stripe_created).toLocaleDateString("fi-FI", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          {payment.stripe_customer_email || (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.stripe_metadata && Object.keys(payment.stripe_metadata).length > 0 ? (
                            <div className="text-xs space-y-1">
                              {Object.entries(payment.stripe_metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              {adminT("Ei metadataa", "No metadata", "لا توجد بيانات")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowLinkDialog(true);
                            }}
                          >
                            {adminT("Linkitä tilaukseen", "Link to Order", "ربط بطلب")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Link Payment Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {adminT("Linkitä maksu tilaukseen", "Link Payment to Order", "ربط الدفع بطلب")}
              </DialogTitle>
              <DialogDescription>
                {adminT(
                  "Syötä tilauksen ID, johon haluat linkittää tämän maksun",
                  "Enter the order ID you want to link this payment to",
                  "أدخل رقم الطلب الذي تريد ربط هذا الدفع به"
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{adminT("Maksu:", "Payment:", "الدفع:")}</strong>{" "}
                  €{selectedPayment?.stripe_amount.toFixed(2)}
                  <br />
                  <strong>ID:</strong> <code className="text-xs">{selectedPayment?.stripe_payment_intent_id}</code>
                </p>
              </div>

              <div>
                <Label htmlFor="order-id">
                  {adminT("Tilauksen ID", "Order ID", "رقم الطلب")}
                </Label>
                <Input
                  id="order-id"
                  type="number"
                  value={linkOrderId}
                  onChange={(e) => setLinkOrderId(e.target.value)}
                  placeholder={adminT("Esim. 140", "E.g. 140", "مثال: 140")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {adminT(
                    "Löydät tilauksen ID:n tilaukset-sivulta",
                    "You can find the order ID on the orders page",
                    "يمكنك العثور على رقم الطلب في صفحة الطلبات"
                  )}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkOrderId("");
                }}
                disabled={linking}
              >
                {adminT("Peruuta", "Cancel", "إلغاء")}
              </Button>
              <Button
                onClick={handleLinkPayment}
                disabled={linking || !linkOrderId}
              >
                {linking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {adminT("Linkitetään...", "Linking...", "جاري الربط...")}
                  </>
                ) : (
                  adminT("Linkitä", "Link", "ربط")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
