/**
 * Format last login timestamp to user-friendly relative time
 * @param {string|Date|null} lastLogin - The last login timestamp
 * @returns {string} Formatted relative time string
 */
export const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return 'Never';

  try {
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInMs = now - loginDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Less than 1 minute
    if (diffInMinutes < 1) {
      return 'Active Now';
    }
    
    // Less than 1 hour
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than 24 hours
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Yesterday
    if (diffInDays === 1) {
      return 'Active yesterday';
    }
    
    // Less than 7 days
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    
    // Less than 30 days
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Less than 365 days
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // More than a year
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    
  } catch (error) {
    console.error('Error formatting last login:', error);
    return 'Never';
  }
};

/**
 * Get status chip color based on last login
 * @param {string|Date|null} lastLogin - The last login timestamp
 * @returns {object} Chip styling object
 */
export const getLastLoginChipStyle = (lastLogin) => {
  if (!lastLogin) {
    return {
      bgcolor: '#424242',
      color: '#fff',
    };
  }

  try {
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now - loginDate) / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    // Active now (less than 1 hour)
    if (diffInHours < 1) {
      return {
        bgcolor: '#00E676', // Green
        color: '#000',
      };
    }
    
    // Active today (less than 24 hours)
    if (diffInHours < 24) {
      return {
        bgcolor: '#4CAF50', // Light green
        color: '#fff',
      };
    }
    
    // Active yesterday (1-2 days)
    if (diffInDays < 2) {
      return {
        bgcolor: '#FFA726', // Orange
        color: '#000',
      };
    }
    
    // Active this week (less than 7 days)
    if (diffInDays < 7) {
      return {
        bgcolor: '#FF9800', // Dark orange
        color: '#fff',
      };
    }
    
    // Active this month (less than 30 days)
    if (diffInDays < 30) {
      return {
        bgcolor: '#757575', // Gray
        color: '#fff',
      };
    }
    
    // Inactive (more than 30 days)
    return {
      bgcolor: '#424242', // Dark gray
      color: '#fff',
    };
    
  } catch (error) {
    console.error('Error getting chip style:', error);
    return {
      bgcolor: '#424242',
      color: '#fff',
    };
  }
};
