/**
 * Barrel Export - Sistema de Reservas
 * 
 * Facilita imports limpios desde otras partes de la app:
 * import { CalendarView, useWeeklyBookings, BookingValidator } from '@/reservationSys'
 * 
 * @module reservationSys
 */

// ========================================
// COMPONENTS - Calendar
// ========================================
export { default as CalendarView } from './components/calendar/CalendarView';
export { default as CalendarGrid } from './components/calendar/CalendarGrid';
export { default as CalendarHeader } from './components/calendar/CalendarHeader';
export { default as CalendarDayColumn } from './components/calendar/CalendarDayColumn';
export { default as TimeSlot } from './components/calendar/TimeSlot';
export { default as FloatingDaysSidebar } from './components/calendar/FloatingDaysSidebar';

// ========================================
// COMPONENTS - Sidebar
// ========================================
export { default as CategorySidebar } from './components/sidebar/CategorySidebar';
export { default as CategoryTab } from './components/sidebar/CategoryTab';
export { default as MachineItem } from './components/sidebar/MachineItem';

// ========================================
// COMPONENTS - Modals
// ========================================
export { default as BookingSummaryModal } from './components/modals/BookingSummaryModal';
export { default as CancelBookingModal } from './components/modals/CancelBookingModal';

// ========================================
// COMPONENTS - Other
// ========================================
export { default as BookingBar } from './components/BookingBar';
export { default as ErrorBoundary } from './components/ErrorBoundary';

// ========================================
// COMPONENTS - Mobile
// ========================================
export { default as MobileFooterSelector } from './components/mobile/MobileFooterSelector';

// ========================================
// HOOKS - Mutations
// ========================================
export { useCreateBooking } from './hooks/mutations/useCreateBooking';
export { useCancelBooking } from './hooks/mutations/useCancelBooking';

// ========================================
// HOOKS - Queries
// ========================================
export { useConfig, useOperatingHours, useBookingLimits, useStrikeRules } from './hooks/queries/useConfig';
export { useWeeklyBookings } from './hooks/queries/useWeeklyBookings';
export { useCategories, usePrefetchCategories } from './hooks/queries/useCategories';
export { useMachines } from './hooks/queries/useMachines';

// ========================================
// HOOKS - Logic
// ========================================
export { useCalendarLogic } from './hooks/useCalendarLogic';

// ========================================
// SERVICES
// ========================================
export { default as BookingValidator } from './services/BookingValidator';
