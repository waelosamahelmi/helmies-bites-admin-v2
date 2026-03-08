import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Download,
  FileText,
  Calendar,
  CreditCard,
  TrendingUp,
  DollarSign,
  Filter,
  Printer,
  Users,
  ShoppingBag,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Settings2,
  ChevronRight
} from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { fi, enUS } from "date-fns/locale";

interface AdvancedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  restaurantName?: string;
}

type DatePreset = 'custom' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'last90Days' | 'thisYear' | 'lastYear' | 'all';

interface ReportOptions {
  includeCustomerDetails: boolean;
  includeCustomerPhone: boolean;
  includeCustomerEmail: boolean;
  includeOrderItems: boolean;
  includePaymentDetails: boolean;
  includeDeliveryAddress: boolean;
  includeOrderNotes: boolean;
  includeSummary: boolean;
  includeCharts: boolean;
  groupByDate: boolean;
  groupByPaymentMethod: boolean;
  groupByOrderType: boolean;
}

export function AdvancedReportModal({ isOpen, onClose, orders, restaurantName = "Restaurant" }: AdvancedReportModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const dateLocale = language === 'fi' ? fi : enUS;
  
  // Date range state
  const [datePreset, setDatePreset] = useState<DatePreset>('last30Days');
  const [customStartDate, setCustomStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Filter state
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string[]>(['all']);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string[]>(['all']);
  const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
  
  // Export options
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('pdf');
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeCustomerDetails: true,
    includeCustomerPhone: true,
    includeCustomerEmail: false,
    includeOrderItems: true,
    includePaymentDetails: true,
    includeDeliveryAddress: true,
    includeOrderNotes: false,
    includeSummary: true,
    includeCharts: true,
    groupByDate: true,
    groupByPaymentMethod: false,
    groupByOrderType: false,
  });

  // Calculate date range based on preset
  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);
    
    switch (datePreset) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'thisWeek':
        start = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        start = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        end = endOfDay(subDays(startOfWeek(now, { weekStartsOn: 1 }), 1));
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfDay(subDays(startOfMonth(now), 1));
        break;
      case 'last30Days':
        start = subDays(now, 30);
        break;
      case 'last90Days':
        start = subDays(now, 90);
        break;
      case 'thisYear':
        start = startOfYear(now);
        break;
      case 'lastYear':
        start = startOfYear(subYears(now, 1));
        end = endOfDay(subDays(startOfYear(now), 1));
        break;
      case 'custom':
        start = startOfDay(parseISO(customStartDate));
        end = endOfDay(parseISO(customEndDate));
        break;
      case 'all':
      default:
        start = new Date(0);
        break;
    }
    
    return { start, end };
  };

  // Filter orders based on all criteria
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange();
    
    return orders.filter((order: any) => {
      // Date filter
      const orderDate = new Date(order.createdAt);
      if (!isWithinInterval(orderDate, { start, end })) return false;
      
      // Payment method filter
      if (!paymentMethodFilter.includes('all')) {
        const method = order.paymentMethod || 'cash';
        if (!paymentMethodFilter.includes(method)) return false;
      }
      
      // Order type filter
      if (!orderTypeFilter.includes('all')) {
        const type = order.orderType || 'delivery';
        if (!orderTypeFilter.includes(type)) return false;
      }
      
      // Status filter
      if (!statusFilter.includes('all')) {
        if (!statusFilter.includes(order.status)) return false;
      }
      
      return true;
    });
  }, [orders, datePreset, customStartDate, customEndDate, paymentMethodFilter, orderTypeFilter, statusFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalOrders: filteredOrders.length,
      totalRevenue: 0,
      avgOrderValue: 0,
      byPaymentMethod: {} as Record<string, { count: number; total: number }>,
      byOrderType: {} as Record<string, { count: number; total: number }>,
      byStatus: {} as Record<string, number>,
      byDate: {} as Record<string, { count: number; total: number }>,
      deliveryFees: 0,
      tips: 0,
    };
    
    filteredOrders.forEach((order: any) => {
      const amount = parseFloat(order.totalAmount) || 0;
      stats.totalRevenue += amount;
      
      // By payment method
      const method = order.paymentMethod || 'cash';
      if (!stats.byPaymentMethod[method]) {
        stats.byPaymentMethod[method] = { count: 0, total: 0 };
      }
      stats.byPaymentMethod[method].count++;
      stats.byPaymentMethod[method].total += amount;
      
      // By order type
      const type = order.orderType || 'delivery';
      if (!stats.byOrderType[type]) {
        stats.byOrderType[type] = { count: 0, total: 0 };
      }
      stats.byOrderType[type].count++;
      stats.byOrderType[type].total += amount;
      
      // By status
      const status = order.status || 'pending';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // By date
      const dateKey = format(new Date(order.createdAt), 'yyyy-MM-dd');
      if (!stats.byDate[dateKey]) {
        stats.byDate[dateKey] = { count: 0, total: 0 };
      }
      stats.byDate[dateKey].count++;
      stats.byDate[dateKey].total += amount;
      
      // Delivery fees and tips
      stats.deliveryFees += parseFloat(order.deliveryFee) || 0;
      stats.tips += parseFloat(order.tip) || 0;
    });
    
    stats.avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    
    return stats;
  }, [filteredOrders]);

  // Get unique values for filters
  const uniquePaymentMethods = useMemo(() => 
    Array.from(new Set(orders.map((o: any) => o.paymentMethod || 'cash'))),
    [orders]
  );
  
  const uniqueOrderTypes = useMemo(() => 
    Array.from(new Set(orders.map((o: any) => o.orderType || 'delivery'))),
    [orders]
  );
  
  const uniqueStatuses = useMemo(() => 
    Array.from(new Set(orders.map((o: any) => o.status || 'pending'))),
    [orders]
  );

  // Toggle filter arrays
  const toggleFilter = (filter: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value === 'all') {
      setFilter(['all']);
    } else {
      const newFilter = filter.includes(value)
        ? filter.filter(f => f !== value)
        : [...filter.filter(f => f !== 'all'), value];
      setFilter(newFilter.length === 0 ? ['all'] : newFilter);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const { start, end } = getDateRange();
    let csv = '\uFEFF'; // BOM for Excel UTF-8 support
    
    // Header info
    csv += `${restaurantName} - ${t("Myyntiraportti", "Sales Report")}\n`;
    csv += `${t("Aikaväli", "Period")}: ${format(start, 'dd.MM.yyyy', { locale: dateLocale })} - ${format(end, 'dd.MM.yyyy', { locale: dateLocale })}\n`;
    csv += `${t("Luotu", "Generated")}: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}\n\n`;
    
    // Build header row
    const headers = [
      t('Tilausnro', 'Order #'),
      t('Päivämäärä', 'Date'),
      t('Aika', 'Time'),
    ];
    
    if (reportOptions.includeCustomerDetails) {
      headers.push(t('Asiakas', 'Customer'));
      if (reportOptions.includeCustomerPhone) headers.push(t('Puhelin', 'Phone'));
      if (reportOptions.includeCustomerEmail) headers.push('Email');
    }
    
    headers.push(t('Tilaustyyppi', 'Order Type'));
    
    if (reportOptions.includeDeliveryAddress) {
      headers.push(t('Osoite', 'Address'));
    }
    
    headers.push(t('Maksutapa', 'Payment'));
    headers.push(t('Tila', 'Status'));
    
    if (reportOptions.includeOrderItems) {
      headers.push(t('Tuotteet', 'Items'));
    }
    
    if (reportOptions.includeOrderNotes) {
      headers.push(t('Muistiinpanot', 'Notes'));
    }
    
    headers.push(t('Summa', 'Total'));
    
    csv += headers.join(';') + '\n';
    
    // Data rows
    filteredOrders.forEach((order: any) => {
      const row = [
        order.id,
        format(new Date(order.createdAt), 'dd.MM.yyyy'),
        format(new Date(order.createdAt), 'HH:mm'),
      ];
      
      if (reportOptions.includeCustomerDetails) {
        row.push(`"${order.customerName || '-'}"`);
        if (reportOptions.includeCustomerPhone) row.push(order.customerPhone || '-');
        if (reportOptions.includeCustomerEmail) row.push(order.customerEmail || '-');
      }
      
      row.push(getOrderTypeLabel(order.orderType));
      
      if (reportOptions.includeDeliveryAddress) {
        row.push(`"${order.deliveryAddress || '-'}"`);
      }
      
      row.push(getPaymentMethodLabel(order.paymentMethod));
      row.push(getStatusLabel(order.status));
      
      if (reportOptions.includeOrderItems) {
        const items = order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || '-';
        row.push(`"${items}"`);
      }
      
      if (reportOptions.includeOrderNotes) {
        row.push(`"${order.notes || '-'}"`);
      }
      
      row.push(`€${(parseFloat(order.totalAmount) || 0).toFixed(2)}`);
      
      csv += row.join(';') + '\n';
    });
    
    // Summary section
    if (reportOptions.includeSummary) {
      csv += '\n\n' + t('YHTEENVETO', 'SUMMARY') + '\n';
      csv += `${t('Tilauksia yhteensä', 'Total Orders')};${statistics.totalOrders}\n`;
      csv += `${t('Liikevaihto', 'Revenue')};€${statistics.totalRevenue.toFixed(2)}\n`;
      csv += `${t('Keskiarvo/tilaus', 'Avg per Order')};€${statistics.avgOrderValue.toFixed(2)}\n`;
      csv += `${t('Toimitusmaksut', 'Delivery Fees')};€${statistics.deliveryFees.toFixed(2)}\n`;
      
      csv += `\n${t('Maksutavoittain', 'By Payment Method')}\n`;
      Object.entries(statistics.byPaymentMethod).forEach(([method, data]) => {
        csv += `${getPaymentMethodLabel(method)};${data.count} ${t('tilausta', 'orders')};€${data.total.toFixed(2)}\n`;
      });
      
      csv += `\n${t('Tilaustyypeittäin', 'By Order Type')}\n`;
      Object.entries(statistics.byOrderType).forEach(([type, data]) => {
        csv += `${getOrderTypeLabel(type)};${data.count} ${t('tilausta', 'orders')};€${data.total.toFixed(2)}\n`;
      });
    }
    
    downloadFile(csv, `report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`, 'text/csv;charset=utf-8');
    
    toast({
      title: t("Viety onnistuneesti", "Exported Successfully"),
      description: t("CSV-raportti on ladattu", "CSV report has been downloaded"),
    });
  };

  // Export to PDF
  const exportToPDF = async () => {
    const { start, end } = getDateRange();
    
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: t("Virhe", "Error"),
        description: t("Pop-up estetty. Salli pop-upit ja yritä uudelleen.", "Pop-up blocked. Please allow pop-ups and try again."),
        variant: "destructive"
      });
      return;
    }
    
    const html = generatePDFHTML(start, end);
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
    
    toast({
      title: t("PDF valmis", "PDF Ready"),
      description: t("Tulostusikkuna avautuu. Valitse 'Tallenna PDF' tulostaaksesi.", "Print dialog will open. Choose 'Save as PDF' to print."),
    });
  };

  // Generate PDF HTML content
  const generatePDFHTML = (start: Date, end: Date) => {
    const headerBgColor = '#1f2937';
    const accentColor = '#ea580c';
    
    let itemsHTML = '';
    filteredOrders.forEach((order: any, index: number) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
      itemsHTML += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${order.id}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</td>
          ${reportOptions.includeCustomerDetails ? `
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${order.customerName || '-'}${reportOptions.includeCustomerPhone && order.customerPhone ? `<br><small style="color: #6b7280;">${order.customerPhone}</small>` : ''}</td>
          ` : ''}
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${getOrderTypeLabel(order.orderType)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${getPaymentMethodLabel(order.paymentMethod)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            <span style="background-color: ${getStatusColor(order.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${getStatusLabel(order.status)}
            </span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">€${(parseFloat(order.totalAmount) || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${restaurantName} - ${t("Myyntiraportti", "Sales Report")}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 20px; }
          .header { background: linear-gradient(135deg, ${headerBgColor} 0%, #374151 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .header p { margin: 5px 0; opacity: 0.9; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .summary-card { background: #f9fafb; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #e5e7eb; }
          .summary-card .value { font-size: 28px; font-weight: bold; color: ${accentColor}; }
          .summary-card .label { font-size: 12px; color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: ${headerBgColor}; color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .section-title { font-size: 18px; font-weight: bold; color: ${headerBgColor}; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${accentColor}; }
          .breakdown-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
          .breakdown-card { background: #f9fafb; border-radius: 10px; padding: 20px; }
          .breakdown-card h4 { margin: 0 0 15px 0; color: ${headerBgColor}; }
          .breakdown-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${restaurantName}</h1>
          <p style="font-size: 20px; margin-top: 10px;">${t("Myyntiraportti", "Sales Report")}</p>
          <p>${t("Aikaväli", "Period")}: ${format(start, 'dd.MM.yyyy', { locale: dateLocale })} - ${format(end, 'dd.MM.yyyy', { locale: dateLocale })}</p>
          <p>${t("Luotu", "Generated")}: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}</p>
        </div>
        
        ${reportOptions.includeSummary ? `
          <div class="summary-grid">
            <div class="summary-card">
              <div class="value">${statistics.totalOrders}</div>
              <div class="label">${t("Tilauksia", "Orders")}</div>
            </div>
            <div class="summary-card">
              <div class="value">€${statistics.totalRevenue.toFixed(2)}</div>
              <div class="label">${t("Liikevaihto", "Revenue")}</div>
            </div>
            <div class="summary-card">
              <div class="value">€${statistics.avgOrderValue.toFixed(2)}</div>
              <div class="label">${t("Keskiarvo", "Avg Order")}</div>
            </div>
            <div class="summary-card">
              <div class="value">€${statistics.deliveryFees.toFixed(2)}</div>
              <div class="label">${t("Toimitusmaksut", "Delivery Fees")}</div>
            </div>
          </div>
          
          <div class="breakdown-grid">
            <div class="breakdown-card">
              <h4>${t("Maksutavoittain", "By Payment Method")}</h4>
              ${Object.entries(statistics.byPaymentMethod).map(([method, data]) => `
                <div class="breakdown-item">
                  <span>${getPaymentMethodLabel(method)} (${data.count})</span>
                  <span style="font-weight: bold;">€${data.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="breakdown-card">
              <h4>${t("Tilaustyypeittäin", "By Order Type")}</h4>
              ${Object.entries(statistics.byOrderType).map(([type, data]) => `
                <div class="breakdown-item">
                  <span>${getOrderTypeLabel(type)} (${data.count})</span>
                  <span style="font-weight: bold;">€${data.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="section-title">${t("Tilaukset", "Orders")}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t("Päivämäärä", "Date")}</th>
              ${reportOptions.includeCustomerDetails ? `<th>${t("Asiakas", "Customer")}</th>` : ''}
              <th>${t("Tyyppi", "Type")}</th>
              <th>${t("Maksu", "Payment")}</th>
              <th>${t("Tila", "Status")}</th>
              <th style="text-align: right;">${t("Summa", "Total")}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background-color: ${headerBgColor}; color: white;">
              <td colspan="${reportOptions.includeCustomerDetails ? 6 : 5}" style="padding: 12px; font-weight: bold;">
                ${t("YHTEENSÄ", "TOTAL")}
              </td>
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">
                €${statistics.totalRevenue.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>${restaurantName} • ${t("Raportti luotu", "Report generated")} ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
          <p>${t("Tämä raportti on luottamuksellinen", "This report is confidential")}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Helper functions for labels
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, { fi: string; en: string }> = {
      cash: { fi: 'Käteinen', en: 'Cash' },
      card: { fi: 'Kortti', en: 'Card' },
      online: { fi: 'Verkkomaksu', en: 'Online' },
      mobilepay: { fi: 'MobilePay', en: 'MobilePay' },
    };
    return labels[method]?.[language === 'fi' ? 'fi' : 'en'] || method;
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, { fi: string; en: string }> = {
      delivery: { fi: 'Toimitus', en: 'Delivery' },
      pickup: { fi: 'Nouto', en: 'Pickup' },
      dine_in: { fi: 'Paikan päällä', en: 'Dine-in' },
    };
    return labels[type]?.[language === 'fi' ? 'fi' : 'en'] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { fi: string; en: string }> = {
      pending: { fi: 'Odottaa', en: 'Pending' },
      confirmed: { fi: 'Vahvistettu', en: 'Confirmed' },
      preparing: { fi: 'Valmistetaan', en: 'Preparing' },
      ready: { fi: 'Valmis', en: 'Ready' },
      delivered: { fi: 'Toimitettu', en: 'Delivered' },
      completed: { fi: 'Valmis', en: 'Completed' },
      cancelled: { fi: 'Peruutettu', en: 'Cancelled' },
    };
    return labels[status]?.[language === 'fi' ? 'fi' : 'en'] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      delivered: '#10b981',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export
  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToCSV(); // Excel can open CSV
        break;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            {t("Edistynyt raportointi", "Advanced Reporting")}
          </DialogTitle>
          <DialogDescription>
            {t("Luo räätälöityjä raportteja valituilla asetuksilla", "Create customized reports with your selected options")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters" className="gap-2">
                <Filter className="w-4 h-4" />
                {t("Suodattimet", "Filters")}
              </TabsTrigger>
              <TabsTrigger value="options" className="gap-2">
                <Settings2 className="w-4 h-4" />
                {t("Asetukset", "Options")}
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                {t("Esikatselu", "Preview")}
              </TabsTrigger>
            </TabsList>
            
            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4 mt-4">
              {/* Date Range Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    {t("Aikaväli", "Date Range")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'today', label: t('Tänään', 'Today') },
                      { value: 'yesterday', label: t('Eilen', 'Yesterday') },
                      { value: 'thisWeek', label: t('Tämä viikko', 'This Week') },
                      { value: 'lastWeek', label: t('Viime viikko', 'Last Week') },
                      { value: 'thisMonth', label: t('Tämä kuukausi', 'This Month') },
                      { value: 'lastMonth', label: t('Viime kuukausi', 'Last Month') },
                      { value: 'last30Days', label: t('30 päivää', '30 Days') },
                      { value: 'last90Days', label: t('90 päivää', '90 Days') },
                      { value: 'thisYear', label: t('Tämä vuosi', 'This Year') },
                      { value: 'lastYear', label: t('Viime vuosi', 'Last Year') },
                      { value: 'all', label: t('Kaikki', 'All Time') },
                      { value: 'custom', label: t('Mukautettu', 'Custom') },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant={datePreset === preset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDatePreset(preset.value as DatePreset)}
                        className={datePreset === preset.value ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  
                  {datePreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>{t("Alkupäivä", "Start Date")}</Label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Loppupäivä", "End Date")}</Label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Payment Method Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      {t("Maksutapa", "Payment Method")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="payment-all"
                        checked={paymentMethodFilter.includes('all')}
                        onCheckedChange={() => toggleFilter(paymentMethodFilter, setPaymentMethodFilter, 'all')}
                      />
                      <label htmlFor="payment-all" className="text-sm">{t("Kaikki", "All")}</label>
                    </div>
                    {uniquePaymentMethods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={`payment-${method}`}
                          checked={paymentMethodFilter.includes(method)}
                          onCheckedChange={() => toggleFilter(paymentMethodFilter, setPaymentMethodFilter, method)}
                        />
                        <label htmlFor={`payment-${method}`} className="text-sm">{getPaymentMethodLabel(method)}</label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Order Type Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-green-600" />
                      {t("Tilaustyyppi", "Order Type")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-all"
                        checked={orderTypeFilter.includes('all')}
                        onCheckedChange={() => toggleFilter(orderTypeFilter, setOrderTypeFilter, 'all')}
                      />
                      <label htmlFor="type-all" className="text-sm">{t("Kaikki", "All")}</label>
                    </div>
                    {uniqueOrderTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={orderTypeFilter.includes(type)}
                          onCheckedChange={() => toggleFilter(orderTypeFilter, setOrderTypeFilter, type)}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm">{getOrderTypeLabel(type)}</label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Status Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      {t("Tila", "Status")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-all"
                        checked={statusFilter.includes('all')}
                        onCheckedChange={() => toggleFilter(statusFilter, setStatusFilter, 'all')}
                      />
                      <label htmlFor="status-all" className="text-sm">{t("Kaikki", "All")}</label>
                    </div>
                    {uniqueStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={statusFilter.includes(status)}
                          onCheckedChange={() => toggleFilter(statusFilter, setStatusFilter, status)}
                        />
                        <label htmlFor={`status-${status}`} className="text-sm">{getStatusLabel(status)}</label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Options Tab */}
            <TabsContent value="options" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      {t("Asiakastiedot", "Customer Details")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Sisällytä asiakastiedot", "Include customer details")}</label>
                      <Checkbox
                        checked={reportOptions.includeCustomerDetails}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeCustomerDetails: !!checked }))}
                      />
                    </div>
                    {reportOptions.includeCustomerDetails && (
                      <>
                        <div className="flex items-center justify-between pl-4">
                          <label className="text-sm text-muted-foreground">{t("Puhelinnumero", "Phone number")}</label>
                          <Checkbox
                            checked={reportOptions.includeCustomerPhone}
                            onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeCustomerPhone: !!checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between pl-4">
                          <label className="text-sm text-muted-foreground">{t("Sähköposti", "Email")}</label>
                          <Checkbox
                            checked={reportOptions.includeCustomerEmail}
                            onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeCustomerEmail: !!checked }))}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Toimitusosoite", "Delivery address")}</label>
                      <Checkbox
                        checked={reportOptions.includeDeliveryAddress}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeDeliveryAddress: !!checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Order Details Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-green-600" />
                      {t("Tilaustiedot", "Order Details")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Tilauksen tuotteet", "Order items")}</label>
                      <Checkbox
                        checked={reportOptions.includeOrderItems}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeOrderItems: !!checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Maksutiedot", "Payment details")}</label>
                      <Checkbox
                        checked={reportOptions.includePaymentDetails}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includePaymentDetails: !!checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Muistiinpanot", "Notes")}</label>
                      <Checkbox
                        checked={reportOptions.includeOrderNotes}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeOrderNotes: !!checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Report Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-600" />
                      {t("Raportin sisältö", "Report Content")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Sisällytä yhteenveto", "Include summary")}</label>
                      <Checkbox
                        checked={reportOptions.includeSummary}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeSummary: !!checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{t("Sisällytä kaaviot (PDF)", "Include charts (PDF)")}</label>
                      <Checkbox
                        checked={reportOptions.includeCharts}
                        onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeCharts: !!checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Export Format */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-orange-600" />
                      {t("Vientimuoto", "Export Format")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('pdf')}
                        className={`flex items-center gap-2 ${exportFormat === 'pdf' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        <Printer className="w-4 h-4" />
                        PDF
                      </Button>
                      <Button
                        variant={exportFormat === 'csv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('csv')}
                        className={`flex items-center gap-2 ${exportFormat === 'csv' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        <FileText className="w-4 h-4" />
                        CSV
                      </Button>
                      <Button
                        variant={exportFormat === 'excel' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('excel')}
                        className={`flex items-center gap-2 ${exportFormat === 'excel' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                      {t("Tilauksia", "Orders")}
                    </p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {statistics.totalOrders}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">
                      {t("Liikevaihto", "Revenue")}
                    </p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      €{statistics.totalRevenue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">
                      {t("Keskiarvo", "Avg Order")}
                    </p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      €{statistics.avgOrderValue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase">
                      {t("Toimitusmaksut", "Delivery Fees")}
                    </p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                      €{statistics.deliveryFees.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("Maksutavoittain", "By Payment Method")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(statistics.byPaymentMethod).map(([method, data]) => (
                      <div key={method} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{getPaymentMethodLabel(method)}</span>
                          <span className="text-xs text-gray-500">({data.count})</span>
                        </div>
                        <span className="font-bold text-green-600">€{data.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("Tilaustyypeittäin", "By Order Type")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(statistics.byOrderType).map(([type, data]) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{getOrderTypeLabel(type)}</span>
                          <span className="text-xs text-gray-500">({data.count})</span>
                        </div>
                        <span className="font-bold text-green-600">€{data.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Sample Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {t("Esimerkkitilaukset", "Sample Orders")} ({Math.min(5, filteredOrders.length)} / {filteredOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-500">#{order.id}</span>
                          <span>{format(new Date(order.createdAt), 'dd.MM HH:mm')}</span>
                          {reportOptions.includeCustomerDetails && (
                            <span className="text-gray-600">{order.customerName || '-'}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs text-white`} style={{ backgroundColor: getStatusColor(order.status) }}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="font-bold">€{(parseFloat(order.totalAmount) || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-muted-foreground">
            {statistics.totalOrders} {t("tilausta valittu", "orders selected")}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t("Peruuta", "Cancel")}
            </Button>
            <Button 
              onClick={handleExport} 
              className="bg-orange-600 hover:bg-orange-700 gap-2"
              disabled={statistics.totalOrders === 0}
            >
              {exportFormat === 'pdf' ? <Printer className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {exportFormat === 'pdf' 
                ? t("Tulosta / Vie PDF", "Print / Export PDF")
                : t("Vie raportti", "Export Report")
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
