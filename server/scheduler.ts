import cron, { ScheduledTask } from 'node-cron';
import { sendAllBranchReports } from './monthly-report-service';

let scheduledTask: ScheduledTask | null = null;

/**
 * Initialize the monthly report scheduler
 * Runs on the 1st day of every month at 8:00 AM (server timezone)
 * Sends reports to all branches that have monthly reports enabled
 */
export function initializeMonthlyReportScheduler(): void {
  // Stop any existing task
  if (scheduledTask) {
    scheduledTask.stop();
  }

  // Schedule: "0 8 1 * *" = At 08:00 on day-of-month 1
  // This runs on the first day of each month at 8:00 AM
  scheduledTask = cron.schedule('0 8 1 * *', async () => {
    console.log('📅 Monthly report scheduler triggered');
    console.log(`📅 Current time: ${new Date().toISOString()}`);
    
    try {
      const results = await sendAllBranchReports();
      console.log(`✅ Monthly reports complete: ${results.sent} sent, ${results.failed} failed`);
    } catch (error) {
      console.error('❌ Scheduler error sending monthly reports:', error);
    }
  }, {
    timezone: 'Europe/Helsinki' // Finnish timezone
  });

  console.log('📅 Monthly report scheduler initialized');
  console.log('📅 Schedule: 1st day of every month at 08:00 (Europe/Helsinki)');
  console.log('📅 Reports will be sent to all branches with monthly reports enabled');
}

/**
 * Stop the monthly report scheduler
 */
export function stopMonthlyReportScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('📅 Monthly report scheduler stopped');
  }
}

/**
 * Check if the scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return scheduledTask !== null;
}

/**
 * Get next scheduled run time (approximate)
 */
export function getNextScheduledRun(): Date {
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0);
  
  // If we're past the 1st of the current month at 8:00, schedule for next month
  const thisMonthRun = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0);
  if (now < thisMonthRun) {
    next = thisMonthRun;
  }
  
  return next;
}
