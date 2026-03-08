import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { CalendarDays, Mail, Send, Loader2, CheckCircle, AlertCircle, Clock, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Branch {
  id: number;
  name: string;
  monthlyReportEmail: string | null;
  monthlyReportEnabled: boolean | null;
}

interface BranchesResponse {
  branches: Branch[];
  schedulerRunning: boolean;
  nextRun: string;
}

export function MonthlyReportSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [branchesData, setBranchesData] = useState<BranchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Selected branch state
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  
  // For manual send
  const [manualEmail, setManualEmail] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const t = (fi: string, en: string, ar: string) => {
    if (language === 'fi') return fi;
    if (language === 'ar') return ar;
    return en;
  };

  // Generate month options
  const months = [
    { value: "1", label: t("Tammikuu", "January", "يناير") },
    { value: "2", label: t("Helmikuu", "February", "فبراير") },
    { value: "3", label: t("Maaliskuu", "March", "مارس") },
    { value: "4", label: t("Huhtikuu", "April", "أبريل") },
    { value: "5", label: t("Toukokuu", "May", "مايو") },
    { value: "6", label: t("Kesäkuu", "June", "يونيو") },
    { value: "7", label: t("Heinäkuu", "July", "يوليو") },
    { value: "8", label: t("Elokuu", "August", "أغسطس") },
    { value: "9", label: t("Syyskuu", "September", "سبتمبر") },
    { value: "10", label: t("Lokakuu", "October", "أكتوبر") },
    { value: "11", label: t("Marraskuu", "November", "نوفمبر") },
    { value: "12", label: t("Joulukuu", "December", "ديسمبر") },
  ];

  // Generate year options (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
  ];

  // Set default month to previous month
  useEffect(() => {
    const now = new Date();
    const prevMonth = now.getMonth(); // 0-indexed, so this gives previous month
    setSelectedMonth(String(prevMonth === 0 ? 12 : prevMonth));
    setSelectedYear(String(prevMonth === 0 ? currentYear - 1 : currentYear));
  }, [currentYear]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/monthly-report/branches", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }
      
      const data: BranchesResponse = await response.json();
      setBranchesData(data);
      
      // Auto-select first branch if available
      if (data.branches && data.branches.length > 0 && !selectedBranchId) {
        const firstBranch = data.branches[0];
        setSelectedBranchId(String(firstBranch.id));
        setEmail(firstBranch.monthlyReportEmail || "");
        setEnabled(firstBranch.monthlyReportEnabled || false);
        setManualEmail(firstBranch.monthlyReportEmail || "");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      // Set empty branches so UI shows the warning
      setBranchesData({ branches: [], schedulerRunning: false, nextRun: new Date().toISOString() });
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Toimipisteiden lataus epäonnistui",
          "Failed to load branches",
          "فشل تحميل الفروع"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Handle branch selection change
  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    const branch = branchesData?.branches.find(b => b.id === parseInt(branchId));
    if (branch) {
      setEmail(branch.monthlyReportEmail || "");
      setEnabled(branch.monthlyReportEnabled || false);
      setManualEmail(branch.monthlyReportEmail || "");
    }
  };

  const handleSave = async () => {
    if (!selectedBranchId) {
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Valitse toimipiste",
          "Please select a branch",
          "الرجاء اختيار فرع"
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/monthly-report/settings/${selectedBranchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: t("Tallennettu", "Saved", "تم الحفظ"),
        description: t(
          "Kuukausiraportin asetukset tallennettu",
          "Monthly report settings saved",
          "تم حفظ إعدادات التقرير الشهري"
        ),
      });
      
      fetchBranches(); // Refresh
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Asetusten tallennus epäonnistui",
          "Failed to save settings",
          "فشل حفظ الإعدادات"
        ),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendManual = async () => {
    if (!manualEmail) {
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Syötä sähköpostiosoite",
          "Please enter an email address",
          "الرجاء إدخال عنوان البريد الإلكتروني"
        ),
        variant: "destructive",
      });
      return;
    }

    if (!selectedBranchId) {
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Valitse toimipiste",
          "Please select a branch",
          "الرجاء اختيار فرع"
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      const response = await fetch(`/api/monthly-report/send/${selectedBranchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: manualEmail,
          month: selectedMonth || undefined,
          year: selectedYear || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send report");
      }

      toast({
        title: t("Lähetetty", "Sent", "تم الإرسال"),
        description: t(
          `Raportti lähetetty osoitteeseen ${manualEmail}`,
          `Report sent to ${manualEmail}`,
          `تم إرسال التقرير إلى ${manualEmail}`
        ),
      });
    } catch (error) {
      console.error("Error sending report:", error);
      toast({
        title: t("Virhe", "Error", "خطأ"),
        description: t(
          "Raportin lähetys epäonnistui",
          "Failed to send report",
          "فشل إرسال التقرير"
        ),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t("Kuukausiraportti", "Monthly Report", "التقرير الشهري")}
        </CardTitle>
        <CardDescription>
          {t(
            "Lähetä automaattinen kuukausiraportti sähköpostilla jokaiselle toimipisteelle",
            "Send automatic monthly report via email for each branch",
            "إرسال تقرير شهري تلقائي عبر البريد الإلكتروني لكل فرع"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scheduler Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          {branchesData?.schedulerRunning ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {branchesData?.schedulerRunning
                ? t("Ajastin aktiivinen", "Scheduler active", "المجدول نشط")
                : t("Ajastin ei käynnissä", "Scheduler not running", "المجدول غير نشط")}
            </p>
            {branchesData?.nextRun && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t("Seuraava lähetys", "Next run", "التشغيل التالي")}: {new Date(branchesData.nextRun).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Branch Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            {t("Toimipiste", "Branch", "الفرع")}
          </Label>
          {branchesData?.branches && branchesData.branches.length > 0 ? (
            <>
              <Select value={selectedBranchId} onValueChange={handleBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Valitse toimipiste", "Select branch", "اختر الفرع")} />
                </SelectTrigger>
                <SelectContent>
                  {branchesData.branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                      {branch.monthlyReportEnabled && (
                        <span className="ml-2 text-green-500">✓</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  "Valitse toimipiste, jolle haluat määrittää kuukausiraportin asetukset",
                  "Select which branch to configure monthly report settings for",
                  "اختر الفرع الذي تريد تكوين إعدادات التقرير الشهري له"
                )}
              </p>
            </>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t(
                  "Ei toimipisteitä saatavilla. Varmista, että tietokanta on päivitetty.",
                  "No branches available. Make sure the database is updated.",
                  "لا توجد فروع متاحة. تأكد من تحديث قاعدة البيانات."
                )}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                {t(
                  "Suorita SQL-migraatio: ALTER TABLE branches ADD COLUMN monthly_report_email TEXT, ADD COLUMN monthly_report_enabled BOOLEAN DEFAULT FALSE;",
                  "Run SQL migration: ALTER TABLE branches ADD COLUMN monthly_report_email TEXT, ADD COLUMN monthly_report_enabled BOOLEAN DEFAULT FALSE;",
                  "قم بتشغيل ترحيل SQL: ALTER TABLE branches ADD COLUMN monthly_report_email TEXT, ADD COLUMN monthly_report_enabled BOOLEAN DEFAULT FALSE;"
                )}
              </p>
            </div>
          )}
        </div>

        {selectedBranchId && branchesData?.branches && branchesData.branches.length > 0 && (
          <>
            {/* Auto Report Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t("Automaattinen lähetys", "Automatic Sending", "الإرسال التلقائي")}
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="report-email">
                  {t("Sähköpostiosoite", "Email Address", "عنوان البريد الإلكتروني")}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="report-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reports@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="report-enabled">
                    {t("Ota käyttöön", "Enable", "تفعيل")}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      "Lähetä raportti automaattisesti kuun 1. päivänä",
                      "Send report automatically on 1st of each month",
                      "إرسال التقرير تلقائياً في اليوم الأول من كل شهر"
                    )}
                  </p>
                </div>
                <Switch
                  id="report-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {t("Tallenna asetukset", "Save Settings", "حفظ الإعدادات")}
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Manual Send */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t("Lähetä manuaalisesti", "Send Manually", "الإرسال اليدوي")}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t("Kuukausi", "Month", "الشهر")}</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Valitse", "Select", "اختر")} />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("Vuosi", "Year", "السنة")}</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Valitse", "Select", "اختر")} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-email">
                  {t("Lähetä osoitteeseen", "Send to", "إرسال إلى")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="manual-email"
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="reports@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendManual} 
                disabled={sending || !manualEmail}
                variant="secondary"
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t("Lähetä raportti nyt", "Send Report Now", "إرسال التقرير الآن")}
              </Button>
            </div>
          </>
        )}

        {/* Summary of enabled branches */}
        {branchesData && branchesData.branches.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {t("Käytössä olevat toimipisteet", "Enabled Branches", "الفروع المفعلة")}
              </h4>
              <div className="space-y-1">
                {branchesData.branches.filter(b => b.monthlyReportEnabled).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      "Ei käytössä olevia toimipisteitä",
                      "No branches enabled",
                      "لا توجد فروع مفعلة"
                    )}
                  </p>
                ) : (
                  branchesData.branches
                    .filter(b => b.monthlyReportEnabled)
                    .map(branch => (
                      <div key={branch.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{branch.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">→ {branch.monthlyReportEmail}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
