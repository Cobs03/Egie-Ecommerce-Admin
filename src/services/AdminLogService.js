import { supabase } from '../lib/supabase';

export const AdminLogService = {
  /**
   * Create a new activity log entry
   */
  async createLog({ userId, actionType, actionDescription, targetType = null, targetId = null, metadata = {} }) {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .insert({
          user_id: userId,
          action_type: actionType,
          action_description: actionDescription,
          target_type: targetType,
          target_id: targetId,
          metadata: metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating admin log:', error);
      return { data: null, error };
    }
  },

  /**
   * Get activity logs for a specific user
   */
  async getUserLogs(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return { data: [], error };
    }
  },

  /**
   * Get all activity logs with user information
   */
  async getAllLogs(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all logs:', error);
      return { data: [], error };
    }
  },

  /**
   * Format log time ago (e.g., "2m ago", "1hr ago", "Yesterday")
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now - logTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}hr ${diffMins % 60}m ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return logTime.toLocaleDateString();
  }
};

export default AdminLogService;
