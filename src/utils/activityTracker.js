/**
 * Activity Tracker - Updates last_login every 5 minutes while user is active
 * This keeps the "Last Login" timestamp accurate and current
 */

import { supabase } from '../lib/supabase';

class ActivityTracker {
  constructor() {
    this.updateInterval = null;
    this.UPDATE_FREQUENCY = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.isTracking = false;
  }

  /**
   * Start tracking user activity
   * Updates last_login every 5 minutes
   */
  startTracking(userId) {
    if (this.isTracking) {
      return;
    }

    if (!userId) {
      console.warn('⚠️ Cannot start activity tracking: No user ID');
      return;
    }
    this.isTracking = true;

    // Update immediately on start
    this.updateLastActivity(userId);

    // Then update every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateLastActivity(userId);
    }, this.UPDATE_FREQUENCY);
  }

  /**
   * Stop tracking user activity
   */
  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.isTracking = false;
    }
  }

  /**
   * Update last_login timestamp in database
   */
  async updateLastActivity(userId) {
    try {
      // Try using RPC function first
      const { error: rpcError } = await supabase.rpc('update_user_last_login', {
        user_id: userId
      });

      if (rpcError) {
        console.warn('⚠️ RPC update failed, using direct update:', rpcError.message);
        
        // Fallback to direct update
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Failed to update last activity:', updateError);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error updating last activity:', error);
    }
  }

  /**
   * Get current tracking status
   */
  isActive() {
    return this.isTracking;
  }

  /**
   * Change update frequency
   * @param {number} minutes - How often to update (in minutes)
   */
  setUpdateFrequency(minutes) {
    this.UPDATE_FREQUENCY = minutes * 60 * 1000;
    
    // Restart tracking if it's already active
    if (this.isTracking) {
      const userId = this.currentUserId;
      this.stopTracking();
      this.startTracking(userId);
    }
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;
