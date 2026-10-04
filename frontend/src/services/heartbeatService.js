import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'ck_last_heartbeat_check';
const THROTTLE_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Lightweight, throttled organic activity keep-alive trigger.
 *
 * Prevents Supabase project pausing from inactivity without generating
 * excessive database traffic or artificial loops.
 *
 * 1. Checks browser localStorage first. If recent, does nothing.
 * 2. If stale or first visit, invokes the idempotent PostgreSQL RPC record_organic_heartbeat.
 * 3. The PostgreSQL function performs a second check against public.system_heartbeat.
 */
export const triggerOrganicHeartbeat = async () => {
  if (typeof window === 'undefined') return;

  try {
    const lastCheck = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastCheck) {
      const elapsed = now - parseInt(lastCheck, 10);
      if (elapsed < THROTTLE_MS) {
        // Organic activity was already recorded recently in this client
        return;
      }
    }

    // Update local storage throttle timestamp
    localStorage.setItem(STORAGE_KEY, now.toString());

    // Call database RPC with 12 hour minimum interval
    const { error } = await supabase.rpc('record_organic_heartbeat', {
      min_interval_hours: 12,
    });

    if (error) {
      // Silently catch - heartbeat should never interfere with user experience
      console.debug('Heartbeat status:', error.message);
    }
  } catch (err) {
    // Non-blocking
    console.debug('Heartbeat check bypassed:', err?.message);
  }
};

export default {
  triggerOrganicHeartbeat,
};
