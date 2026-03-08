import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Database,
  TrendingUp,
  Tag,
  Clock,
  Store,
  X,
  MessageSquare,
  Trash2,
  Copy,
  RotateCcw,
  Zap,
  AlertTriangle,
  Play,
  Languages,
  Settings,
  Save,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ChevronDown,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  Mic,
  Paperclip,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatLanguage = "en" | "fi" | "ar";
type ChatSize = "minimized" | "normal" | "expanded" | "fullscreen";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sqlExecuted?: string;
  sqlResult?: any;
  error?: string;
  isExecuting?: boolean;
  pendingConfirmation?: boolean;
  isDestructive?: boolean;
}

interface PendingQuery {
  sql: string;
  explanation: string;
  isDestructive: boolean;
  messageId: string;
}

interface SuggestionCategory {
  icon: React.ReactNode;
  title: { en: string; fi: string; ar: string };
  suggestions: { en: string; fi: string; ar: string }[];
}

interface AIConfig {
  id: number | null;
  api_provider: string;
  api_key: string;
  model: string;
  api_base_url: string;
  max_tokens: number;
  temperature: number;
  is_enabled: boolean;
}

// Translations
const translations = {
  en: {
    aiAssistant: "AI Assistant",
    manageSmartly: "Your intelligent restaurant partner",
    clearChat: "Clear chat",
    welcome: "Welcome to AI Assistant!",
    welcomeDesc: "I can help you with ideas, planning, strategy, analyzing sales, managing products, and much more. Just ask me anything!",
    typeMessage: "Type your message...",
    newChat: "New chat",
    processing: "Processing...",
    result: "Result",
    error: "Error",
    executed: "Executed",
    querySuccess: "Query executed successfully",
    changesSaved: "Changes saved successfully",
    copied: "Copied",
    textCopied: "Text copied to clipboard",
    confirmAction: "Confirm Action",
    confirmDesc: "This action will modify the database. Are you sure you want to continue?",
    cancel: "Cancel",
    execute: "Execute",
    modifyData: "This action will modify data",
    operationCancelled: "Operation cancelled",
    andMoreRows: "...and {count} more rows",
    errorOccurred: "Sorry, an error occurred. Please try again.",
    unknownError: "Unknown error",
    salesAnalysis: "Sales Analysis",
    promotions: "Promotions",
    workingHours: "Working Hours",
    productManagement: "Product Management",
    settings: "Settings",
    apiSettings: "API Settings",
    apiSettingsDesc: "Configure the AI provider and API key",
    apiProvider: "API Provider",
    apiKey: "API Key",
    model: "Model",
    apiBaseUrl: "API Base URL",
    maxTokens: "Max Tokens",
    temperature: "Temperature",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully",
    settingsSaveFailed: "Failed to save settings",
    loadingConfig: "Loading configuration...",
    configNotSet: "API key not configured. Click settings to configure.",
  },
  fi: {
    aiAssistant: "AI Avustaja",
    manageSmartly: "Älykäs ravintolakumppanisi",
    clearChat: "Tyhjennä keskustelu",
    welcome: "Tervetuloa AI Avustajaan!",
    welcomeDesc: "Voin auttaa sinua ideoissa, suunnittelussa, strategiassa, myynnin analysoinnissa, tuotteiden hallinnassa ja paljon muussa. Kysy vain!",
    typeMessage: "Kirjoita viestisi...",
    newChat: "Uusi keskustelu",
    processing: "Käsitellään...",
    result: "Tulos",
    error: "Virhe",
    executed: "Suoritettu",
    querySuccess: "Kysely suoritettu onnistuneesti",
    changesSaved: "Muutokset tallennettu onnistuneesti",
    copied: "Kopioitu",
    textCopied: "Teksti kopioitu leikepöydälle",
    confirmAction: "Vahvista toiminto",
    confirmDesc: "Tämä toiminto muuttaa tietokantaa. Haluatko varmasti jatkaa?",
    cancel: "Peruuta",
    execute: "Suorita",
    modifyData: "Tämä toiminto muuttaa tietoja",
    operationCancelled: "Toiminto peruutettu",
    andMoreRows: "...ja {count} muuta riviä",
    errorOccurred: "Anteeksi, tapahtui virhe. Yritä uudelleen.",
    unknownError: "Tuntematon virhe",
    salesAnalysis: "Myyntianalyysi",
    promotions: "Tarjoukset",
    workingHours: "Aukioloajat",
    productManagement: "Tuotehallinta",
    settings: "Asetukset",
    apiSettings: "API-asetukset",
    apiSettingsDesc: "Määritä AI-palveluntarjoaja ja API-avain",
    apiProvider: "API-palveluntarjoaja",
    apiKey: "API-avain",
    model: "Malli",
    apiBaseUrl: "API-perus-URL",
    maxTokens: "Enimmäistokenit",
    temperature: "Lämpötila",
    saveSettings: "Tallenna asetukset",
    settingsSaved: "Asetukset tallennettu onnistuneesti",
    settingsSaveFailed: "Asetusten tallennus epäonnistui",
    loadingConfig: "Ladataan asetuksia...",
    configNotSet: "API-avainta ei ole määritetty. Napsauta asetuksia määrittääksesi.",
  },
  ar: {
    aiAssistant: "مساعد الذكاء الاصطناعي",
    manageSmartly: "شريكك الذكي في إدارة المطعم",
    clearChat: "مسح المحادثة",
    welcome: "مرحباً بك في مساعد الذكاء الاصطناعي!",
    welcomeDesc: "يمكنني مساعدتك في الأفكار والتخطيط والاستراتيجية وتحليل المبيعات وإدارة المنتجات والمزيد. اسألني أي شيء!",
    typeMessage: "اكتب رسالتك...",
    newChat: "محادثة جديدة",
    processing: "جاري المعالجة...",
    result: "النتيجة",
    error: "خطأ",
    executed: "تم التنفيذ",
    querySuccess: "تم تنفيذ الاستعلام بنجاح",
    changesSaved: "تم حفظ التغييرات بنجاح",
    copied: "تم النسخ",
    textCopied: "تم نسخ النص إلى الحافظة",
    confirmAction: "تأكيد الإجراء",
    confirmDesc: "هذا الإجراء سيعدل قاعدة البيانات. هل أنت متأكد من المتابعة؟",
    cancel: "إلغاء",
    execute: "تنفيذ",
    modifyData: "هذا الإجراء سيعدل البيانات",
    operationCancelled: "تم إلغاء العملية",
    andMoreRows: "...و {count} صفوف أخرى",
    errorOccurred: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
    unknownError: "خطأ غير معروف",
    salesAnalysis: "تحليل المبيعات",
    promotions: "العروض",
    workingHours: "ساعات العمل",
    productManagement: "إدارة المنتجات",
    settings: "الإعدادات",
    apiSettings: "إعدادات API",
    apiSettingsDesc: "تكوين مزود الذكاء الاصطناعي ومفتاح API",
    apiProvider: "مزود API",
    apiKey: "مفتاح API",
    model: "النموذج",
    apiBaseUrl: "عنوان API الأساسي",
    maxTokens: "الحد الأقصى للرموز",
    temperature: "درجة الحرارة",
    saveSettings: "حفظ الإعدادات",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    settingsSaveFailed: "فشل حفظ الإعدادات",
    loadingConfig: "جاري تحميل الإعدادات...",
    configNotSet: "لم يتم تكوين مفتاح API. انقر على الإعدادات للتكوين.",
  }
};

// Default config - will be loaded from database
const DEFAULT_CONFIG: AIConfig = {
  id: null,
  api_provider: 'openrouter',
  api_key: '',
  model: 'z-ai/glm-4.5-air:free',
  api_base_url: 'https://openrouter.ai/api/v1/chat/completions',
  max_tokens: 2000,
  temperature: 0.7,
  is_enabled: true
};

export function AIAssistantChat() {
  const { language: appLanguage } = useLanguage();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [chatLanguage, setChatLanguage] = useState<ChatLanguage>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>("normal");
  const [pendingQuery, setPendingQuery] = useState<PendingQuery | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Config state
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editConfig, setEditConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const t = translations[chatLanguage];
  const isRTL = chatLanguage === "ar";
  
  // Load config from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/ai/config', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // Parse numeric fields that might come as strings from DB
          const parsedConfig: AIConfig = {
            ...data,
            max_tokens: parseInt(data.max_tokens) || 2000,
            temperature: parseFloat(data.temperature) || 0.7,
          };
          setConfig(parsedConfig);
          setEditConfig(parsedConfig);
        }
      } catch (error) {
        console.error('Failed to load AI config:', error);
      } finally {
        setIsLoadingConfig(false);
      }
    };
    loadConfig();
  }, []);
  
  // Save config to database
  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const response = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editConfig),
        credentials: 'include'
      });
      
      if (response.ok) {
        setConfig(editConfig);
        setShowSettingsDialog(false);
        toast({
          title: t.settingsSaved,
          description: t.settingsSaved,
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.settingsSaveFailed,
        variant: "destructive"
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const suggestionCategories: SuggestionCategory[] = [
    {
      icon: <Sparkles className="w-4 h-4 text-yellow-500" />,
      title: { 
        en: "Ideas & Planning", 
        fi: "Ideat ja suunnittelu", 
        ar: "الأفكار والتخطيط" 
      },
      suggestions: [
        { en: "Give me ideas to increase weekend sales", fi: "Anna ideoita viikonlopun myynnin kasvattamiseen", ar: "أعطني أفكاراً لزيادة مبيعات عطلة نهاية الأسبوع" },
        { en: "Help me create a summer marketing plan", fi: "Auta minua luomaan kesän markkinointisuunnitelma", ar: "ساعدني في إنشاء خطة تسويقية صيفية" },
        { en: "What new menu items would attract more customers?", fi: "Mitkä uudet ruokalistan tuotteet houkuttelisivat enemmän asiakkaita?", ar: "ما هي الأطباق الجديدة التي ستجذب المزيد من العملاء؟" },
      ]
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      title: { 
        en: "Sales Analysis", 
        fi: "Myyntianalyysi", 
        ar: "تحليل المبيعات" 
      },
      suggestions: [
        { en: "Analyze this week's sales", fi: "Analysoi tämän viikon myynti", ar: "تحليل مبيعات هذا الأسبوع" },
        { en: "Which products sell best?", fi: "Mitkä tuotteet myyvät parhaiten?", ar: "ما هي المنتجات الأكثر مبيعاً؟" },
        { en: "Compare this and last month's sales", fi: "Vertaile tämän ja viime kuukauden myyntiä", ar: "قارن مبيعات هذا الشهر بالشهر الماضي" },
      ]
    },
    {
      icon: <Tag className="w-4 h-4 text-orange-500" />,
      title: { 
        en: "Promotions", 
        fi: "Tarjoukset", 
        ar: "العروض" 
      },
      suggestions: [
        { en: "Create 20% offer for Margherita pizza", fi: "Luo 20% tarjous Margherita-pizzalle", ar: "إنشاء عرض 20% على بيتزا مارجريتا" },
        { en: "Suggest promotion strategies for slow days", fi: "Ehdota tarjousstrategioita hiljaisille päiville", ar: "اقترح استراتيجيات ترويجية للأيام الهادئة" },
        { en: "Remove all expired offers", fi: "Poista kaikki vanhentuneet tarjoukset", ar: "إزالة جميع العروض المنتهية" },
      ]
    },
    {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      title: { 
        en: "Working Hours", 
        fi: "Aukioloajat", 
        ar: "ساعات العمل" 
      },
      suggestions: [
        { en: "Show current working hours", fi: "Näytä nykyiset aukioloajat", ar: "عرض ساعات العمل الحالية" },
        { en: "Change Saturday hours to 12-23", fi: "Muuta lauantain aukioloajaksi 12-23", ar: "تغيير ساعات السبت إلى 12-23" },
        { en: "Close restaurant for tomorrow", fi: "Sulje ravintola huomiseksi", ar: "إغلاق المطعم غداً" },
      ]
    },
    {
      icon: <Store className="w-4 h-4 text-purple-500" />,
      title: { 
        en: "Product Management", 
        fi: "Tuotehallinta", 
        ar: "إدارة المنتجات" 
      },
      suggestions: [
        { en: "Mark 'Pepperoni Pizza' as unavailable", fi: "Merkitse 'Pepperoni Pizza' loppuneeksi", ar: "وضع علامة 'بيتزا بيبروني' غير متوفرة" },
        { en: "Increase all pizza prices by 5%", fi: "Nosta kaikkien pizzojen hintoja 5%", ar: "زيادة أسعار جميع البيتزا بنسبة 5%" },
        { en: "Help me write a description for a new dish", fi: "Auta minua kirjoittamaan kuvaus uudelle ruoalle", ar: "ساعدني في كتابة وصف لطبق جديد" },
      ]
    }
  ];

  // Get database schema context for the AI
  const getDatabaseContext = () => {
    const languageInstruction = chatLanguage === "fi" 
      ? "Respond in Finnish." 
      : chatLanguage === "ar" 
        ? "Respond in Arabic." 
        : "Respond in English.";
    
    return `You are an intelligent AI assistant for Babylon Restaurant's admin panel. You are a versatile assistant who can help with many different tasks.

YOUR CAPABILITIES:
1. **General Assistance**: Answer questions, provide advice, create plans, brainstorm ideas, explain concepts
2. **Restaurant Strategy**: Help with marketing ideas, menu planning, pricing strategies, customer engagement
3. **Business Analysis**: Discuss trends, suggest improvements, analyze business challenges
4. **Database Operations**: Read or modify restaurant data when needed

CRITICAL BEHAVIOR RULES:

**NEVER REPEAT THE SAME QUERY** - If you already fetched data, USE IT. Do not fetch the same data again.

**BE ACTION-ORIENTED** - When the user asks you to DO something (like "create offers"), actually DO IT:
- If you need data first, fetch it ONCE
- Then IMMEDIATELY follow up with the action (UPDATE/INSERT)
- Present the changes you're making, don't just show data and stop

**RESPONSE TYPE DECISION:**
1. For discussions, ideas, advice, planning → Plain text response (NO SQL)
2. For viewing/analyzing data → SQL SELECT query
3. For making changes → SQL UPDATE/INSERT (with explanation of what you're changing)

**WHEN THE USER SAYS "CREATE/MAKE/DO IT":**
If you already have the data from a previous query in the conversation, DO NOT query again!
Instead, immediately proceed with the UPDATE/INSERT to make the requested changes.

Example flow for "create offers for products":
1. First message: Fetch products with SELECT (if needed)
2. When user says "create it" or "make it": Immediately provide UPDATE statement with specific offer_percentage values

RESPONSE FORMAT:
- For plain text: Just write your response naturally
- For SQL queries: Use this JSON format:
  {"sql": "YOUR_SQL_QUERY", "explanation": "Brief explanation", "isDestructive": true/false}

DATABASE SCHEMA:
- categories: id, name, name_en, display_order, is_active
- branches: id, name, name_en, address, city, postal_code, latitude, longitude, phone, email, is_active, display_order, opening_hours (jsonb)
- menu_items: id, category_id, name, name_en, description, description_en, price, image_url, is_vegetarian, is_vegan, is_gluten_free, display_order, is_available, offer_price, offer_percentage, offer_start_date, offer_end_date, has_conditional_pricing, included_toppings_count, branch_id
- orders: id, order_number, customer_name, customer_phone, customer_email, delivery_address, order_type, branch_id, status, subtotal, delivery_fee, small_order_fee, total_amount, payment_method, payment_status, stripe_payment_intent_id, special_instructions, created_at, updated_at
- order_items: id, order_id, menu_item_id, quantity, unit_price, total_price, special_instructions
- toppings: id, name, name_en, name_ar, price, is_active, display_order, category, type, is_required
- topping_groups: id, name, name_en, is_required, max_selections, min_selections, display_order
- restaurant_settings: id, is_open, opening_hours, pickup_hours, delivery_hours, lunch_buffet_hours, special_message, stripe_enabled, online_payment_service_fee
- restaurant_config: id, name, name_en, tagline, tagline_en, description, description_en, phone, email, address (jsonb), social_media (jsonb), hours (jsonb), services (jsonb), delivery_config (jsonb), theme (jsonb)

OFFER SYSTEM (menu_items table):
- offer_percentage: The discount percentage (e.g., 10, 15, 20)
- offer_price: Alternative fixed offer price (usually NULL if using percentage)
- offer_start_date: When offer begins (DATE)
- offer_end_date: When offer expires (DATE)
To create a weekend offer: SET offer_percentage = X, offer_start_date = 'YYYY-MM-DD', offer_end_date = 'YYYY-MM-DD'

SQL RULES:
1. Use SELECT for reading data, UPDATE/INSERT for modifications
2. NEVER use DELETE without explicit user confirmation
3. Mark operations as isDestructive: true for UPDATE/INSERT/DELETE
4. Times in 24-hour format, currency in EUR (€)

EXAMPLES OF WHEN NOT TO USE SQL:
- "Give me ideas for a new pizza" → Creative suggestions (no SQL)
- "How can I increase sales?" → Strategic advice (no SQL)
- "Help me write a menu description" → Write the description (no SQL)

EXAMPLES OF WHEN TO USE SQL:
- "Show me today's orders" → SQL SELECT
- "Change Margherita price to 15€" → SQL UPDATE
- "Create a 20% offer on pizzas" → SQL UPDATE setting offer_percentage=20, offer_start_date, offer_end_date
- User says "do it" or "make it" after you suggested something → Execute the action with SQL

CURRENT DATE: ${new Date().toISOString().split('T')[0]}

${languageInstruction}`;
  };

  // Parse AI response to extract SQL and explanation
  const parseAIResponse = (content: string): { sql?: string; explanation: string; isDestructive?: boolean } => {
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*"sql"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sql: parsed.sql,
          explanation: parsed.explanation || content.replace(jsonMatch[0], '').trim(),
          isDestructive: parsed.isDestructive || false
        };
      }
    } catch (e) {
      // If JSON parsing fails, just return the content as explanation
    }
    return { explanation: content };
  };

  // Execute SQL query via server API
  const executeSQLQuery = async (sql: string, isDestructive: boolean = false): Promise<{ data: any; error: string | null }> => {
    try {
      const response = await fetch('/api/ai/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, isDestructive }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: result.error || 'Query execution failed' };
      }
      
      return { data: result.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  };

  // Send message to AI provider
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Check if API key is configured
    if (!config.api_key) {
      toast({
        title: t.error,
        description: t.configNotSet,
        variant: "destructive"
      });
      setShowSettingsDialog(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isExecuting: true
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetch(config.api_base_url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.api_key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Babylon Restaurant Admin"
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: getDatabaseContext() },
            ...messages.filter(m => m.role !== "system").map(m => {
              // Include SQL results in the message content so AI remembers them
              let messageContent = m.content;
              if (m.sqlResult && m.role === "assistant") {
                const resultPreview = Array.isArray(m.sqlResult) 
                  ? m.sqlResult.slice(0, 20) 
                  : m.sqlResult;
                messageContent += `\n\n[SQL Query Result - ${Array.isArray(m.sqlResult) ? m.sqlResult.length : 1} rows]:\n${JSON.stringify(resultPreview, null, 2)}`;
              }
              if (m.sqlExecuted && m.role === "assistant") {
                messageContent += `\n\n[Executed SQL]: ${m.sqlExecuted}`;
              }
              return {
                role: m.role,
                content: messageContent
              };
            }),
            { role: "user", content: content.trim() }
          ],
          temperature: config.temperature,
          max_tokens: config.max_tokens
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "";
      
      const parsed = parseAIResponse(aiContent);
      
      // Remove thinking message
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

      // If there's SQL to execute
      if (parsed.sql) {
        const messageId = (Date.now() + 2).toString();
        
        // Check if it's a destructive operation (UPDATE, DELETE, INSERT)
        const normalizedSql = parsed.sql.trim().toLowerCase();
        const isDestructiveOp = normalizedSql.startsWith('update') || 
                               normalizedSql.startsWith('delete') || 
                               normalizedSql.startsWith('insert');
        
        const assistantMessage: Message = {
          id: messageId,
          role: "assistant",
          content: parsed.explanation,
          timestamp: new Date(),
          sqlExecuted: parsed.sql,
          isExecuting: false,
          pendingConfirmation: isDestructiveOp,
          isDestructive: isDestructiveOp
        };
        setMessages(prev => [...prev, assistantMessage]);

        // If destructive, wait for confirmation. Otherwise, execute immediately.
        if (isDestructiveOp) {
          setPendingQuery({
            sql: parsed.sql,
            explanation: parsed.explanation,
            isDestructive: true,
            messageId
          });
          setShowConfirmDialog(true);
        } else {
          // Execute SELECT queries immediately
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, isExecuting: true } : m
          ));
          
          const { data: sqlData, error: sqlError } = await executeSQLQuery(parsed.sql, false);
          
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, sqlResult: sqlData, error: sqlError || undefined, isExecuting: false, pendingConfirmation: false }
              : m
          ));

          if (sqlError) {
            toast({
              title: t.error,
              description: sqlError,
              variant: "destructive"
            });
          } else {
            toast({
              title: t.executed,
              description: t.querySuccess,
            });
          }
        }
      } else {
        // Just a conversational response
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: parsed.explanation || aiContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Remove thinking message
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: t.errorOccurred,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : t.unknownError
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, toast, t, chatLanguage, config]);

  // Handle confirmation of destructive queries
  const handleConfirmQuery = async () => {
    if (!pendingQuery) return;
    
    setShowConfirmDialog(false);
    
    // Update message to show executing
    setMessages(prev => prev.map(m => 
      m.id === pendingQuery.messageId 
        ? { ...m, isExecuting: true, pendingConfirmation: false }
        : m
    ));
    
    const { data: sqlData, error: sqlError } = await executeSQLQuery(pendingQuery.sql, true);
    
    // Update message with results
    setMessages(prev => prev.map(m => 
      m.id === pendingQuery.messageId 
        ? { ...m, sqlResult: sqlData, error: sqlError || undefined, isExecuting: false }
        : m
    ));
    
    if (sqlError) {
      toast({
        title: t.error,
        description: sqlError,
        variant: "destructive"
      });
    } else {
      toast({
        title: t.executed,
        description: t.changesSaved,
      });
    }
    
    setPendingQuery(null);
  };
  
  const handleCancelQuery = () => {
    setShowConfirmDialog(false);
    
    // Update message to show cancelled
    if (pendingQuery) {
      setMessages(prev => prev.map(m => 
        m.id === pendingQuery.messageId 
          ? { ...m, pendingConfirmation: false, error: t.operationCancelled }
          : m
      ));
    }
    
    setPendingQuery(null);
  };

  // Execute a pending query manually (from message UI)
  const executeManualQuery = async (messageId: string, sql: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, isExecuting: true, pendingConfirmation: false }
        : m
    ));
    
    const { data: sqlData, error: sqlError } = await executeSQLQuery(sql, true);
    
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, sqlResult: sqlData, error: sqlError || undefined, isExecuting: false }
        : m
    ));
    
    if (sqlError) {
      toast({
        title: t.error,
        description: sqlError,
        variant: "destructive"
      });
    } else {
      toast({
        title: t.executed,
        description: t.changesSaved,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: { en: string; fi: string; ar: string }) => {
    sendMessage(suggestion[chatLanguage]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.copied,
      description: t.textCopied,
    });
  };

  const formatSQLResult = (result: any) => {
    if (!result) return null;
    
    if (Array.isArray(result) && result.length > 0) {
      const keys = Object.keys(result[0]);
      return (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                {keys.map(key => (
                  <th key={key} className="px-2 py-1 text-left border border-gray-200 dark:border-gray-600">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 10).map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {keys.map(key => (
                    <td key={key} className="px-2 py-1 border border-gray-200 dark:border-gray-600">
                      {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.length > 10 && (
            <p className="text-xs text-gray-500 mt-1">
              {t.andMoreRows.replace('{count}', String(result.length - 10))}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  const languageOptions = [
    { code: "en" as ChatLanguage, label: "English", flag: "🇬🇧" },
    { code: "fi" as ChatLanguage, label: "Suomi", flag: "🇫🇮" },
    { code: "ar" as ChatLanguage, label: "العربية", flag: "🇸🇦" },
  ];

  // Get size classes for the chat container
  const getSizeClasses = () => {
    switch (chatSize) {
      case "minimized":
        return "w-80 h-14";
      case "normal":
        return "w-[420px] h-[600px]";
      case "expanded":
        return "w-[600px] h-[700px]";
      case "fullscreen":
        return "fixed inset-4 w-auto h-auto";
      default:
        return "w-[420px] h-[600px]";
    }
  };

  // Handle keyboard shortcut for sending
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-ping opacity-25" />
            
            {/* Main button */}
            <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-violet-500/50 hover:shadow-xl">
              <Bot className="w-7 h-7 text-white" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              {t.aiAssistant}
              <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className={cn(
            "fixed z-50 transition-all duration-300 ease-out",
            chatSize === "fullscreen" ? "inset-4" : "bottom-6 right-6",
            getSizeClasses()
          )}
        >
          <div className={cn(
            "flex flex-col h-full rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl",
            "bg-white/95 dark:bg-gray-900/95",
            chatSize === "minimized" && "cursor-pointer"
          )}
          onClick={() => chatSize === "minimized" && setChatSize("normal")}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800",
              "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
            )}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className={chatSize === "minimized" ? "hidden" : ""}>
                  <h3 className="text-white font-semibold text-sm">{t.aiAssistant}</h3>
                  <p className="text-violet-100 text-xs">{t.manageSmartly}</p>
                </div>
                {chatSize === "minimized" && (
                  <span className="text-white font-medium">{t.aiAssistant}</span>
                )}
              </div>
              
              <div className={cn("flex items-center gap-1", chatSize === "minimized" && "hidden")}>
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                    >
                      <span className="text-base">
                        {languageOptions.find(l => l.code === chatLanguage)?.flag}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    {languageOptions.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setChatLanguage(lang.code)}
                        className={cn(
                          "gap-2 cursor-pointer",
                          chatLanguage === lang.code && "bg-violet-50 dark:bg-violet-900/20"
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {chatLanguage === lang.code && (
                          <CheckCircle className="w-3 h-3 ml-auto text-violet-600" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* More Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem onClick={() => {
                      setEditConfig(config);
                      setShowSettingsDialog(true);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearChat}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.clearChat}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setChatSize("normal")}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Normal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChatSize("expanded")}>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Expanded
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChatSize("fullscreen")}>
                      <PanelRightOpen className="w-4 h-4 mr-2" />
                      Fullscreen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Size toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => setChatSize(chatSize === "fullscreen" ? "normal" : "fullscreen")}
                    >
                      {chatSize === "fullscreen" ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {chatSize === "fullscreen" ? "Minimize" : "Fullscreen"}
                  </TooltipContent>
                </Tooltip>

                {/* Minimize */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => setChatSize("minimized")}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Minimize</TooltipContent>
                </Tooltip>

                {/* Close */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>

              {/* Minimized state controls */}
              {chatSize === "minimized" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={(e) => { e.stopPropagation(); setChatSize("normal"); }}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Messages Area - Hidden when minimized */}
            {chatSize !== "minimized" && (
              <>
                <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      {/* Welcome Message */}
                      <div className="text-center py-8">
                        <div className="relative inline-block">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 shadow-lg">
                            <Bot className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                          </div>
                          <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {t.welcome}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                          {t.welcomeDesc}
                        </p>
                      </div>

                      {/* Suggestion Categories */}
                      <div className="space-y-3">
                        {suggestionCategories.map((category, idx) => (
                          <div 
                            key={idx} 
                            className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-3 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
                          >
                            <h4 className={cn(
                              "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2",
                              isRTL && "flex-row-reverse"
                            )}>
                              {category.icon}
                              {category.title[chatLanguage]}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {category.suggestions.map((suggestion, sIdx) => (
                                <button
                                  key={sIdx}
                                  className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 shadow-sm hover:shadow"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion[chatLanguage]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                            message.role === "user" 
                              ? isRTL ? "flex-row" : "flex-row-reverse" 
                              : isRTL ? "flex-row-reverse" : "flex-row"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Avatar */}
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                            message.role === "user" 
                              ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                              : "bg-gradient-to-br from-violet-500 to-indigo-600"
                          )}>
                            {message.role === "user" ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={cn(
                            "flex-1 max-w-[85%]",
                            message.role === "user" 
                              ? isRTL ? "text-left" : "text-right"
                              : isRTL ? "text-right" : "text-left"
                          )}>
                            <div className={cn(
                              "inline-block rounded-2xl px-4 py-3 shadow-sm",
                              message.role === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                            )}>
                              {message.isExecuting ? (
                                <div className={cn(
                                  "flex items-center gap-2 text-gray-600 dark:text-gray-400",
                                  isRTL && "flex-row-reverse"
                                )}>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">{t.processing}</span>
                                </div>
                              ) : (
                                <>
                                  <p className={cn(
                                    "text-sm whitespace-pre-wrap leading-relaxed",
                                    message.role === "user" ? "text-white" : "text-gray-800 dark:text-gray-200"
                                  )}>
                                    {message.content}
                                  </p>

                                  {/* SQL Query Display */}
                                  {message.sqlExecuted && (
                                    <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className={cn(
                                          "flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400",
                                          isRTL && "flex-row-reverse"
                                        )}>
                                          <Database className="w-3.5 h-3.5" />
                                          <span>SQL Query</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          onClick={() => copyToClipboard(message.sqlExecuted!)}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto font-mono" dir="ltr">
                                        {message.sqlExecuted}
                                      </pre>
                                    </div>
                                  )}

                                  {/* SQL Result */}
                                  {message.sqlResult && !message.error && (
                                    <div className="mt-3">
                                      <div className={cn(
                                        "flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 mb-2",
                                        isRTL && "flex-row-reverse"
                                      )}>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>{t.result}</span>
                                      </div>
                                      {formatSQLResult(message.sqlResult)}
                                    </div>
                                  )}

                                  {/* Error Display */}
                                  {message.error && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                      <div className={cn(
                                        "flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400",
                                        isRTL && "flex-row-reverse"
                                      )}>
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{message.error}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Pending Confirmation UI */}
                                  {message.pendingConfirmation && message.sqlExecuted && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                      <div className={cn(
                                        "flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3",
                                        isRTL && "flex-row-reverse"
                                      )}>
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t.modifyData}</span>
                                      </div>
                                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                                        <Button
                                          size="sm"
                                          onClick={() => executeManualQuery(message.id, message.sqlExecuted!)}
                                          className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                        >
                                          <Play className={cn("w-3 h-3", isRTL ? "ml-1.5" : "mr-1.5")} />
                                          {t.execute}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setMessages(prev => prev.map(m => 
                                            m.id === message.id 
                                              ? { ...m, pendingConfirmation: false, error: t.operationCancelled }
                                              : m
                                          ))}
                                          className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                        >
                                          {t.cancel}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {/* Timestamp */}
                            <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isLoading && <TypingIndicator />}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className={cn(
                      "flex gap-2 items-end",
                      isRTL && "flex-row-reverse"
                    )}>
                      <div className="flex-1 relative">
                        <Textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={t.typeMessage}
                          disabled={isLoading}
                          rows={1}
                          className={cn(
                            "min-h-[44px] max-h-[120px] resize-none py-3 px-4 pr-12 rounded-xl",
                            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                            "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
                            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                            "transition-all duration-200",
                            isRTL && "text-right"
                          )}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        
                        {/* Send button inside input */}
                        <Button 
                          type="submit" 
                          disabled={isLoading || !inputValue.trim()}
                          size="icon"
                          className={cn(
                            "absolute bottom-1.5 h-9 w-9 rounded-lg",
                            "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                            "shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40",
                            "disabled:opacity-50 disabled:shadow-none",
                            "transition-all duration-200",
                            isRTL ? "left-1.5" : "right-1.5"
                          )}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className={cn("w-4 h-4", isRTL && "rotate-180")} />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className={cn(
                      "flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1",
                      isRTL && "flex-row-reverse"
                    )}>
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <button 
                          type="button"
                          onClick={clearChat}
                          className={cn(
                            "flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t.newChat}</span>
                        </button>
                      </div>
                      <div className={cn("flex items-center gap-1 opacity-60", isRTL && "flex-row-reverse")}>
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>AI Powered</span>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Operations */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"} className="max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              {t.confirmAction}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="mb-4 text-gray-600 dark:text-gray-400">{t.confirmDesc}</p>
                {pendingQuery && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">SQL Query:</p>
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-40 font-mono" dir="ltr">
                      {pendingQuery.sql}
                    </pre>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <AlertDialogCancel onClick={handleCancelQuery} className="rounded-xl">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmQuery}
              className="rounded-xl bg-amber-600 hover:bg-amber-700"
            >
              <Play className="w-4 h-4 mr-1.5" />
              {t.execute}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Settings className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t.apiSettings}</h3>
                <p className="text-sm font-normal text-gray-500">{t.apiSettingsDesc}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* API Provider */}
            <div className="grid gap-2">
              <Label htmlFor="api_provider" className={cn("text-sm font-medium", isRTL && "text-right")}>
                {t.apiProvider}
              </Label>
              <Input
                id="api_provider"
                value={editConfig.api_provider}
                onChange={(e) => setEditConfig({...editConfig, api_provider: e.target.value})}
                placeholder="openrouter"
                className={cn("rounded-xl", isRTL && "text-right")}
              />
            </div>
            
            {/* API Key */}
            <div className="grid gap-2">
              <Label htmlFor="api_key" className={cn("text-sm font-medium", isRTL && "text-right")}>
                {t.apiKey}
              </Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showApiKey ? "text" : "password"}
                  value={editConfig.api_key}
                  onChange={(e) => setEditConfig({...editConfig, api_key: e.target.value})}
                  placeholder="sk-or-v1-..."
                  className={cn("pr-10 rounded-xl", isRTL && "text-right")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Model */}
            <div className="grid gap-2">
              <Label htmlFor="model" className={cn("text-sm font-medium", isRTL && "text-right")}>
                {t.model}
              </Label>
              <Input
                id="model"
                value={editConfig.model}
                onChange={(e) => setEditConfig({...editConfig, model: e.target.value})}
                placeholder="z-ai/glm-4.5-air:free"
                className={cn("rounded-xl", isRTL && "text-right")}
              />
            </div>
            
            {/* API Base URL */}
            <div className="grid gap-2">
              <Label htmlFor="api_base_url" className={cn("text-sm font-medium", isRTL && "text-right")}>
                {t.apiBaseUrl}
              </Label>
              <Input
                id="api_base_url"
                value={editConfig.api_base_url}
                onChange={(e) => setEditConfig({...editConfig, api_base_url: e.target.value})}
                placeholder="https://openrouter.ai/api/v1/chat/completions"
                className={cn("rounded-xl", isRTL && "text-right")}
              />
            </div>
            
            {/* Max Tokens & Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_tokens" className={cn("text-sm font-medium", isRTL && "text-right")}>
                  {t.maxTokens}
                </Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={editConfig.max_tokens}
                  onChange={(e) => setEditConfig({...editConfig, max_tokens: parseInt(e.target.value) || 2000})}
                  min={100}
                  max={8000}
                  className={cn("rounded-xl", isRTL && "text-right")}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="temperature" className={cn("text-sm font-medium", isRTL && "text-right")}>
                  {t.temperature}
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={editConfig.temperature}
                  onChange={(e) => setEditConfig({...editConfig, temperature: parseFloat(e.target.value) || 0.7})}
                  min={0}
                  max={2}
                  className={cn("rounded-xl", isRTL && "text-right")}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className={cn("gap-2", isRTL && "flex-row-reverse sm:flex-row-reverse")}>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
              className="rounded-xl"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={saveConfig}
              disabled={isSavingConfig}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isSavingConfig ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t.saveSettings}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default AIAssistantChat;
