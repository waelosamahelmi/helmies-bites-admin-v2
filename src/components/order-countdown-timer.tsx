import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface OrderCountdownTimerProps {
  estimatedDeliveryTime: string | null | undefined;
  className?: string;
}

export function OrderCountdownTimer({ estimatedDeliveryTime, className = "" }: OrderCountdownTimerProps) {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  } | null>(null);

  useEffect(() => {
    if (!estimatedDeliveryTime) {
      console.log('⏰ No estimated delivery time provided');
      setTimeRemaining(null);
      return;
    }

    console.log('⏰ Countdown timer initialized with:', {
      estimatedDeliveryTime,
      parsedDate: new Date(estimatedDeliveryTime).toISOString(),
      currentTime: new Date().toISOString()
    });

    const calculateTimeRemaining = () => {
      const now = Date.now();
      // Parse the ISO string - this will correctly handle the timezone
      const deliveryTime = new Date(estimatedDeliveryTime).getTime();
      const diff = deliveryTime - now;

      console.log('⏰ Time remaining calculation:', {
        now: new Date(now).toISOString(),
        deliveryTime: new Date(deliveryTime).toISOString(),
        diff,
        diffMinutes: diff / (1000 * 60)
      });

      if (diff <= 0) {
        return { minutes: 0, seconds: 0, isOverdue: true };
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { minutes, seconds, isOverdue: false };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedDeliveryTime]);

  if (!timeRemaining) {
    return null;
  }

  const { minutes, seconds, isOverdue } = timeRemaining;

  return (
    <div className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} ${className}`}>
      <Clock className={`w-6 h-6 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
      <span className={`text-xl font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {isOverdue
          ? t("Yliajo!", "Overdue!")
          : `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      </span>
    </div>
  );
}
