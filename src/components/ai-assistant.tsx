// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/language-context';
import { useTenant } from '@/lib/tenant-context';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  labelEn: string;
  prompt: string;
  icon: React.ComponentType<any>;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'sales-summary',
    label: 'Päivän myynti',
    labelEn: "Today's Sales",
    prompt: 'Show me today\'s sales summary',
    icon: TrendingUp,
  },
  {
    id: 'popular-items',
    label: 'Suositut tuotteet',
    labelEn: 'Popular Items',
    prompt: 'What are the most popular menu items this week?',
    icon: ShoppingBag,
  },
  {
    id: 'peak-hours',
    label: 'Ruuhka-ajat',
    labelEn: 'Peak Hours',
    prompt: 'What are our busiest hours?',
    icon: Clock,
  },
  {
    id: 'customer-insights',
    label: 'Asiakastiedot',
    labelEn: 'Customer Insights',
    prompt: 'Give me insights about our customers',
    icon: Users,
  },
];

export function AIAssistant() {
  const { t, language } = useLanguage();
  const { tenant } = useTenant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if AI is enabled for this tenant
  const isEnabled = tenant?.features?.aiAssistant ?? false;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Integrate with actual AI backend
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('myynti')) {
      return language === 'fi' 
        ? '📊 Tämän päivän myynti:\n\n• Tilauksia: 47\n• Kokonaismyynti: €1,234.50\n• Keskitilaus: €26.27\n• Suosituin tuote: Falafel Wrap (12 kpl)\n\nMyynti on 15% korkeampi kuin viime viikon keskiarvo! 🎉'
        : '📊 Today\'s Sales Summary:\n\n• Orders: 47\n• Total Revenue: €1,234.50\n• Average Order: €26.27\n• Top Item: Falafel Wrap (12 sold)\n\nSales are 15% higher than last week\'s average! 🎉';
    }
    
    if (lowerQuery.includes('popular') || lowerQuery.includes('suositu')) {
      return language === 'fi'
        ? '🏆 Viikon suosituimmat tuotteet:\n\n1. Falafel Wrap - 89 kpl\n2. Shawarma Plate - 67 kpl\n3. Hummus & Pita - 54 kpl\n4. Mixed Grill - 43 kpl\n5. Baklava - 38 kpl\n\n💡 Vinkki: Harkitse tarjouskampanjaa top 5 tuotteille!'
        : '🏆 This Week\'s Popular Items:\n\n1. Falafel Wrap - 89 sold\n2. Shawarma Plate - 67 sold\n3. Hummus & Pita - 54 sold\n4. Mixed Grill - 43 sold\n5. Baklava - 38 sold\n\n💡 Tip: Consider a promo bundle for top 5 items!';
    }
    
    if (lowerQuery.includes('peak') || lowerQuery.includes('busy') || lowerQuery.includes('ruuhka')) {
      return language === 'fi'
        ? '⏰ Ruuhka-ajat:\n\n• Lounas: 11:30-13:00 (35% tilauksista)\n• Päivällinen: 17:30-19:30 (40% tilauksista)\n• Myöhäisilta: 20:00-21:30 (15% tilauksista)\n\n📈 Perjantai ja lauantai ovat vilkkaimmat päivät.'
        : '⏰ Peak Hours Analysis:\n\n• Lunch: 11:30-13:00 (35% of orders)\n• Dinner: 17:30-19:30 (40% of orders)\n• Late Evening: 20:00-21:30 (15% of orders)\n\n📈 Friday and Saturday are the busiest days.';
    }
    
    if (lowerQuery.includes('customer') || lowerQuery.includes('asiakas')) {
      return language === 'fi'
        ? '👥 Asiakastiedot:\n\n• Uusia asiakkaita tällä viikolla: 23\n• Palaavia asiakkaita: 68%\n• Keskimääräinen tilausväli: 8 päivää\n• Eniten tilaava asuinalue: Keskusta\n\n💡 Palaavat asiakkaat tilaavat keskimäärin 30% enemmän!'
        : '👥 Customer Insights:\n\n• New customers this week: 23\n• Returning customers: 68%\n• Average order frequency: 8 days\n• Top ordering area: City Center\n\n💡 Returning customers order 30% more on average!';
    }
    
    return language === 'fi'
      ? 'Voin auttaa sinua myyntitiedoissa, suosituissa tuotteissa, ruuhka-ajoissa ja asiakastiedoissa. Kysy minulta mitä vain! 🤖'
      : 'I can help you with sales data, popular items, peak hours, and customer insights. Ask me anything! 🤖';
  };

  if (!isEnabled) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="py-12 text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            {t('AI-avustaja', 'AI Assistant')}
          </h3>
          <p className="text-gray-500 mb-4 max-w-sm mx-auto">
            {t(
              'AI-avustaja ei ole käytössä tilissäsi. Päivitä Pro-tilaukseen saadaksesi käyttöön.',
              'AI Assistant is not enabled for your account. Upgrade to Pro to unlock.'
            )}
          </p>
          <Button variant="outline" disabled>
            <Sparkles className="w-4 h-4 mr-2" />
            {t('Päivitä Pro-tilaukseen', 'Upgrade to Pro')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            {t('AI-avustaja', 'AI Assistant')}
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">
              {t('Pikatoiminnot', 'Quick Actions')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => sendMessage(action.prompt)}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {language === 'fi' ? action.label : action.labelEn}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>{t('Kysy minulta mitä vain ravintolastasi!', 'Ask me anything about your restaurant!')}</p>
              </div>
            )}
            
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Kirjoita viesti...', 'Type a message...')}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIAssistant;
