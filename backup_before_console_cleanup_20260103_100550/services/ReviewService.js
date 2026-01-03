import { supabase } from '../lib/supabase.js';

/**
 * ReviewService - Admin service for managing product reviews
 * Handles fetching, filtering, and deleting reviews from all users
 */
class ReviewService {
  /**
   * Get all reviews with optional filtering
   * @param {Object} options - Filter options
   * @param {string} options.product_id - Filter by product ID
   * @param {number} options.rating - Filter by rating (1-5)
   * @param {string} options.search - Search in title, comment, user name, user email
   * @param {number} options.limit - Number of results per page (default: 10)
   * @param {number} options.offset - Offset for pagination (default: 0)
   * @returns {Object} { data, error, total }
   */
  async getAllReviews({ product_id, rating, search, limit = 10, offset = 0 } = {}) {
    try {
      let query = supabase
        .from('product_reviews')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      if (rating) {
        query = query.eq('rating', rating);
      }

      if (search && search.trim()) {
        query = query.or(
          `title.ilike.%${search}%,comment.ilike.%${search}%,user_name.ilike.%${search}%,user_email.ilike.%${search}%`
        );
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: reviews, error, count } = await query;

      if (error) throw error;

      // Fetch product and customer details for each review
      if (reviews && reviews.length > 0) {
        const productIds = [...new Set(reviews.map(r => r.product_id).filter(id => id))];
        const userIds = [...new Set(reviews.map(r => r.user_id).filter(id => id))];
        
        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, images')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
        }

        // Fetch customer profiles with profile pictures
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Map products to reviews
        const productsMap = {};
        if (products) {
          products.forEach(p => {
            productsMap[p.id] = p;
          });
        }

        // Map profiles to reviews
        const profilesMap = {};
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.id] = p;
          });
        }

        // Attach product and profile data to each review
        reviews.forEach(review => {
          review.products = productsMap[review.product_id] || null;
          review.customer = profilesMap[review.user_id] || null;
        });
      }

      return {
        data: reviews || [],
        error: null,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        data: [],
        error: error.message,
        total: 0
      };
    }
  }

  /**
   * Get review statistics
   * @returns {Object} { data: { total, averageRating, byRating }, error }
   */
  async getReviewStats() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating');

      if (error) throw error;

      const total = data.length;
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = total > 0 ? sum / total : 0;

      // Count by rating
      const byRating = {
        5: data.filter(r => r.rating === 5).length,
        4: data.filter(r => r.rating === 4).length,
        3: data.filter(r => r.rating === 3).length,
        2: data.filter(r => r.rating === 2).length,
        1: data.filter(r => r.rating === 1).length,
      };

      return {
        data: {
          total,
          averageRating,
          byRating
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        data: { total: 0, averageRating: 0, byRating: {} },
        error: error.message
      };
    }
  }

  /**
   * Delete a review (admin only) with activity logging
   * @param {string} review_id - Review ID to delete
   * @param {Object} reviewData - Review data for logging
   * @returns {Object} { error }
   */
  async deleteReview(review_id, reviewData = null) {
    try {
      // Delete the review first (most important operation)
      const { error: deleteError } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', review_id);

      if (deleteError) {
        console.error('Error deleting review:', deleteError);
        throw deleteError;
      }

      // Try to log the activity (optional - won't fail delete if logging fails)
      try {
        if (reviewData) {
          // Get current user info
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Get user profile for role information
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, role')
              .eq('id', user.id)
              .single();

            const actorName = profile 
              ? `${profile.first_name} ${profile.last_name}`.trim() 
              : user.email;
            const actorRole = profile?.role || 'admin';
            const customerName = reviewData.customer 
              ? `${reviewData.customer.first_name} ${reviewData.customer.last_name}`.trim()
              : reviewData.user_name || 'Anonymous';
            const productName = reviewData.products?.name || 'Unknown Product';

            // Insert into existing admin_logs table
            await supabase.from('admin_logs').insert({
              user_id: user.id,
              action_type: 'review_delete',
              action_description: `Deleted review by ${customerName} for product "${productName}"`,
              target_type: 'review',
              target_id: review_id,
              metadata: {
                review_title: reviewData.title || 'No title',
                review_comment: reviewData.comment || 'No comment',
                review_rating: reviewData.rating,
                product_name: productName,
                customer_name: customerName,
                deleted_by: actorName,
                deleted_by_role: actorRole
              }
            });
          }
        }
      } catch (loggingError) {
        // Log to console but don't fail the delete operation
        console.warn('Activity logging failed:', loggingError.message);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteReview:', error);
      return { error: error.message };
    }
  }

  /**
   * Get reviews for a specific product
   * @param {string} product_id - Product ID
   * @returns {Object} { data, error }
   */
  async getProductReviews(product_id) {
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product details
      if (reviews && reviews.length > 0) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name, images')
          .eq('id', product_id)
          .single();

        // Attach product data to each review
        reviews.forEach(review => {
          review.products = product;
        });
      }

      return { data: reviews || [], error: null };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get rating summary for a product
   * @param {string} product_id - Product ID
   * @returns {Object} { data, error }
   */
  async getProductRatingSummary(product_id) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', product_id);

      if (error) throw error;

      const total = data.length;
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = total > 0 ? sum / total : 0;

      // Count by rating
      const breakdown = {
        rating_5_count: data.filter(r => r.rating === 5).length,
        rating_4_count: data.filter(r => r.rating === 4).length,
        rating_3_count: data.filter(r => r.rating === 3).length,
        rating_2_count: data.filter(r => r.rating === 2).length,
        rating_1_count: data.filter(r => r.rating === 1).length,
      };

      return {
        data: {
          average_rating: average,
          total_reviews: total,
          ...breakdown
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      return {
        data: {
          average_rating: 0,
          total_reviews: 0,
          rating_5_count: 0,
          rating_4_count: 0,
          rating_3_count: 0,
          rating_2_count: 0,
          rating_1_count: 0,
        },
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new ReviewService();
