import { supabase } from '../lib/supabase.js';

/**
 * InquiryService - Handle product inquiries and replies
 */
class InquiryService {
  /**
   * Get all inquiries with filters (admin only)
   * @param {Object} options - Filter options
   * @returns {Object} { data, count, error }
   */
  async getAllInquiries({ 
    product_id = null, 
    status = null, 
    priority = null,
    search = '', 
    limit = 10, 
    offset = 0 
  } = {}) {
    try {
      let query = supabase
        .from('product_inquiries')
        .select('*', { count: 'exact' });

      // Apply filters
      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
      }

      // Search in subject or question
      if (search) {
        query = query.or(`subject.ilike.%${search}%,question.ilike.%${search}%`);
      }

      // Order by created_at desc (newest first)
      query = query.order('created_at', { ascending: false });

      // Pagination
      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: inquiries, count, error } = await query;

      if (error) throw error;

      // Fetch related data separately
      if (inquiries && inquiries.length > 0) {
        // Get unique product IDs
        const productIds = [...new Set(inquiries.map(i => i.product_id))];
        const { data: products } = await supabase
          .from('products')
          .select('id, name, images')
          .in('id', productIds);

        // Get unique user IDs
        const userIds = [...new Set(inquiries.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .in('id', userIds);

        // Get reply counts for each inquiry
        const inquiryIds = inquiries.map(i => i.id);
        const { data: replyCounts } = await supabase
          .from('inquiry_replies')
          .select('inquiry_id')
          .in('inquiry_id', inquiryIds);

        // Get unread counts for each inquiry
        const { data: unreadCounts } = await supabase
          .from('inquiry_unread_counts')
          .select('inquiry_id, unread_by_staff, unread_by_customer')
          .in('inquiry_id', inquiryIds);

        // Create maps for faster lookup
        const productsMap = {};
        products?.forEach(p => {
          productsMap[p.id] = p;
        });

        const profilesMap = {};
        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });

        const replyCountsMap = {};
        replyCounts?.forEach(r => {
          replyCountsMap[r.inquiry_id] = (replyCountsMap[r.inquiry_id] || 0) + 1;
        });

        const unreadCountsMap = {};
        unreadCounts?.forEach(u => {
          unreadCountsMap[u.inquiry_id] = {
            unread_by_staff: u.unread_by_staff,
            unread_by_customer: u.unread_by_customer
          };
        });

        // Attach related data to inquiries
        inquiries.forEach(inquiry => {
          inquiry.product = productsMap[inquiry.product_id] || null;
          inquiry.customer = profilesMap[inquiry.user_id] || null;
          inquiry.reply_count = replyCountsMap[inquiry.id] || 0;
          inquiry.unread_by_staff = unreadCountsMap[inquiry.id]?.unread_by_staff || 0;
          inquiry.unread_by_customer = unreadCountsMap[inquiry.id]?.unread_by_customer || 0;
        });
      }

      return { data: inquiries || [], count: count || 0, error: null };
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  /**
   * Get inquiry statistics
   * @returns {Object} { data, error }
   */
  async getInquiryStats() {
    try {
      // Get all inquiries
      const { data: inquiries, error } = await supabase
        .from('product_inquiries')
        .select('status, created_at, updated_at');

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: inquiries.length,
        pending: inquiries.filter(i => i.status === 'pending').length,
        answered: inquiries.filter(i => i.status === 'answered').length,
        closed: inquiries.filter(i => i.status === 'closed').length,
        flagged: inquiries.filter(i => i.status === 'flagged').length,
      };

      // Calculate average response time (only for answered inquiries)
      const answeredInquiries = inquiries.filter(i => 
        i.status === 'answered' && i.updated_at !== i.created_at
      );

      if (answeredInquiries.length > 0) {
        const totalResponseTime = answeredInquiries.reduce((sum, inquiry) => {
          const created = new Date(inquiry.created_at);
          const updated = new Date(inquiry.updated_at);
          const hours = (updated - created) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        stats.avgResponseHours = (totalResponseTime / answeredInquiries.length).toFixed(1);
      } else {
        stats.avgResponseHours = 0;
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching inquiry stats:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get single inquiry with all replies
   * @param {string} inquiry_id - Inquiry ID
   * @returns {Object} { data, error }
   */
  async getInquiryWithReplies(inquiry_id) {
    try {
      // Get inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('product_inquiries')
        .select('*')
        .eq('id', inquiry_id)
        .single();

      if (inquiryError) throw inquiryError;

      // Get product
      const { data: product } = await supabase
        .from('products')
        .select('id, name, images')
        .eq('id', inquiry.product_id)
        .single();

      inquiry.product = product;

      // Get customer profile
      const { data: customer } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', inquiry.user_id)
        .single();

      inquiry.customer = customer;

      // Get all replies with user info
      const { data: replies, error: repliesError } = await supabase
        .from('inquiry_replies')
        .select('*')
        .eq('inquiry_id', inquiry_id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Get user info for each reply
      if (replies && replies.length > 0) {
        const replyUserIds = [...new Set(replies.map(r => r.user_id))];
        const { data: replyUsers } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, role')
          .in('id', replyUserIds);

        const usersMap = {};
        replyUsers?.forEach(u => {
          usersMap[u.id] = u;
        });

        replies.forEach(reply => {
          reply.user = usersMap[reply.user_id] || null;
        });
      }

      inquiry.replies = replies || [];

      return { data: inquiry, error: null };
    } catch (error) {
      console.error('Error fetching inquiry with replies:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create a reply to an inquiry (admin or customer)
   * @param {string} inquiry_id - Inquiry ID
   * @param {string} reply_text - Reply text
   * @returns {Object} { data, error }
   */
  async createReply(inquiry_id, reply_text) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Check if user is admin/manager/employee
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdminReply = ['admin', 'manager', 'employee'].includes(profile?.role);

      // Insert reply
      const { data: reply, error } = await supabase
        .from('inquiry_replies')
        .insert({
          inquiry_id,
          user_id: user.id,
          reply_text,
          is_admin_reply: isAdminReply
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      if (isAdminReply) {
        try {
          // Get inquiry details for logging
          const { data: inquiry } = await supabase
            .from('product_inquiries')
            .select('subject, product_id')
            .eq('id', inquiry_id)
            .single();

          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', inquiry?.product_id)
            .single();

          await supabase.from('admin_logs').insert({
            user_id: user.id,
            action_type: 'inquiry_reply',
            action_description: `Replied to inquiry: "${inquiry?.subject}" for product "${product?.name}"`,
            target_type: 'inquiry',
            target_id: inquiry_id,
            metadata: {
              reply_text: reply_text.substring(0, 200),
              reply_id: reply.id,
              role: profile.role
            }
          });
        } catch (loggingError) {
          console.warn('Activity logging failed:', loggingError.message);
        }
      }

      return { data: reply, error: null };
    } catch (error) {
      console.error('Error creating reply:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update inquiry status (admin only)
   * @param {string} inquiry_id - Inquiry ID
   * @param {string} status - New status (pending, answered, closed, flagged)
   * @returns {Object} { error }
   */
  async updateInquiryStatus(inquiry_id, status) {
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', inquiry_id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return { error: error.message };
    }
  }

  /**
   * Update inquiry priority (admin only)
   * @param {string} inquiry_id - Inquiry ID
   * @param {string} priority - New priority (low, normal, high, urgent)
   * @returns {Object} { error }
   */
  async updateInquiryPriority(inquiry_id, priority) {
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', inquiry_id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating inquiry priority:', error);
      return { error: error.message };
    }
  }

  /**
   * Delete inquiry (admin only)
   * @param {string} inquiry_id - Inquiry ID
   * @param {Object} inquiryData - Inquiry data for logging
   * @returns {Object} { error }
   */
  async deleteInquiry(inquiry_id, inquiryData = null) {
    try {
      // Delete inquiry (replies will cascade delete)
      const { error: deleteError } = await supabase
        .from('product_inquiries')
        .delete()
        .eq('id', inquiry_id);

      if (deleteError) {
        console.error('Error deleting inquiry:', deleteError);
        throw deleteError;
      }

      // Try to log the activity
      try {
        if (inquiryData) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, role')
              .eq('id', user.id)
              .single();

            const actorName = profile 
              ? `${profile.first_name} ${profile.last_name}`.trim() 
              : user.email;
            const customerName = inquiryData.customer 
              ? `${inquiryData.customer.first_name} ${inquiryData.customer.last_name}`.trim()
              : 'Anonymous';
            const productName = inquiryData.product?.name || 'Unknown Product';

            await supabase.from('admin_logs').insert({
              user_id: user.id,
              action_type: 'inquiry_delete',
              action_description: `Deleted inquiry by ${customerName} about "${productName}"`,
              target_type: 'inquiry',
              target_id: inquiry_id,
              metadata: {
                subject: inquiryData.subject,
                question: inquiryData.question.substring(0, 200),
                customer_name: customerName,
                product_name: productName,
                deleted_by: actorName,
                deleted_by_role: profile?.role || 'admin'
              }
            });
          }
        }
      } catch (loggingError) {
        console.warn('Activity logging failed:', loggingError.message);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteInquiry:', error);
      return { error: error.message };
    }
  }

  /**
   * Get unread reply count for staff (customer replies not yet read by staff)
   * @returns {Object} { count, error }
   */
  async getUnreadCountForAdmin() {
    try {
      const { count, error } = await supabase
        .from('inquiry_replies')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin_reply', false)
        .eq('read_by_staff', false);

      if (error) throw error;

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error getting unread count for staff:', error);
      return { count: 0, error: error.message };
    }
  }

  /**
   * Mark all replies in an inquiry as read by staff (admin/manager/employee)
   * @param {string} inquiry_id 
   * @returns {Object} { error }
   */
  async markRepliesAsReadByAdmin(inquiry_id) {
    try {
      console.log('📝 Updating replies for inquiry:', inquiry_id);
      
      const { data, error } = await supabase
        .from('inquiry_replies')
        .update({ read_by_staff: true })
        .eq('inquiry_id', inquiry_id)
        .eq('is_admin_reply', false) // Only mark customer replies
        .select();

      console.log('✅ Updated replies:', data?.length || 0, 'rows');
      console.log('Updated data:', data);
      
      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('❌ Error marking replies as read by staff:', error);
      return { error: error.message };
    }
  }

  /**
   * Get inquiries with unread customer replies
   * @returns {Object} { data, error }
   */
  async getInquiriesWithUnreadReplies() {
    try {
      // Get inquiry IDs that have unread customer replies
      const { data: unreadReplies, error: repliesError } = await supabase
        .from('inquiry_replies')
        .select('inquiry_id')
        .eq('is_admin_reply', false)
        .eq('read_by_staff', false);

      if (repliesError) throw repliesError;

      const inquiryIds = [...new Set(unreadReplies.map(r => r.inquiry_id))];

      if (inquiryIds.length === 0) {
        return { data: [], error: null };
      }

      // Get those inquiries with full details
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *,
          customer:profiles!product_inquiries_user_id_fkey(id, first_name, last_name, email, avatar_url),
          product:products(id, name, images)
        `)
        .in('id', inquiryIds);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting inquiries with unread replies:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Mark all staff replies as read for an inquiry (when customer views conversation)
   * @param {string} inquiryId - Inquiry ID
   * @returns {Object} { error }
   */
  async markRepliesAsReadByStaff(inquiryId) {
    try {
      const { error } = await supabase
        .from('inquiry_replies')
        .update({ read_by_staff: true })
        .eq('inquiry_id', inquiryId)
        .eq('is_admin_reply', false);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error marking replies as read by staff:', error);
      return { error: error.message };
    }
  }

  /**
   * Get total unread count for staff across all inquiries
   * @returns {Object} { data: { count }, error }
   */
  async getUnreadCountForStaff() {
    try {
      const { data, error } = await supabase
        .from('inquiry_unread_counts')
        .select('unread_by_staff');

      if (error) throw error;

      const total = data?.reduce((sum, row) => sum + row.unread_by_staff, 0) || 0;

      return { data: { count: total }, error: null };
    } catch (error) {
      console.error('Error getting unread count for staff:', error);
      return { data: { count: 0 }, error: error.message };
    }
  }
}

export default new InquiryService();
