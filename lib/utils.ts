import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  // Validate locale - fallback to 'ar' if invalid
  const validLocale = ['ar', 'en', 'ar-EG', 'en-US'].includes(locale) ? locale : 'ar';
  return new Intl.DateTimeFormat(validLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  // Validate locale - fallback to 'ar' if invalid
  const validLocale = ['ar', 'en', 'ar-EG', 'en-US'].includes(locale) ? locale : 'ar';
  return new Intl.DateTimeFormat(validLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Trainee Status
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    transferred: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-gray-100 text-gray-800',
    
    // Report Status
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revision_required: 'bg-orange-100 text-orange-800',
    
    // Task Status
    in_progress: 'bg-blue-100 text-blue-800',
    submitted: 'bg-purple-100 text-purple-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
}

export function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.round((elapsed / total) * 100);
}

export function getDaysRemaining(date: string): number {
  const target = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: string): boolean {
  return new Date(date) < new Date();
}
