import { supabase } from '../lib/supabase';

class PopupAdService {
  // Get all popup ads (admin)
  async getAllPopupAds() {
    try {
      const { data, error } = await supabase
        .from('popup_ads')
        .select(`
          *,
          creator:created_by(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching popup ads:', error);
      return { data: null, error };
    }
  }

  // Get active popup ads for display
  async getActivePopupAds(page = 'home') {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('popup_ads')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .contains('show_on_pages', [page])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching active popup ads:', error);
      return { data: null, error };
    }
  }

  // Create popup ad
  async createPopupAd(popupData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('popup_ads')
        .insert([{
          ...popupData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating popup ad:', error);
      return { data: null, error };
    }
  }

  // Update popup ad
  async updatePopupAd(id, popupData) {
    try {
      const { data, error } = await supabase
        .from('popup_ads')
        .update({
          ...popupData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating popup ad:', error);
      return { data: null, error };
    }
  }

  // Delete popup ad
  async deletePopupAd(id) {
    try {
      const { error } = await supabase
        .from('popup_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting popup ad:', error);
      return { error };
    }
  }

  // Toggle active status
  async toggleActive(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('popup_ads')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error toggling popup ad status:', error);
      return { data: null, error };
    }
  }

  // Track impression
  async trackImpression(popupId) {
    try {
      const { error } = await supabase
        .rpc('increment_popup_impression', { popup_id: popupId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error tracking impression:', error);
      return { error };
    }
  }

  // Track click
  async trackClick(popupId) {
    try {
      const { error } = await supabase
        .rpc('increment_popup_click', { popup_id: popupId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error tracking click:', error);
      return { error };
    }
  }

  // Upload popup images
  async uploadPopupImages(files) {
    try {
      const uploadedUrls = [];

      for (const file of files) {
        let fileToUpload = file;
        let fileExt = file.name.split('.').pop().toLowerCase();
        
        // Convert AVIF to JPEG since Supabase doesn't support AVIF
        if (fileExt === 'avif') {
          fileToUpload = await this.convertAvifToJpeg(file);
          fileExt = 'jpg';
        }

        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `popup-ads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, fileToUpload);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      return { data: uploadedUrls, error: null };
    } catch (error) {
      console.error('Error uploading popup images:', error);
      return { data: null, error };
    }
  }

  // Convert AVIF to JPEG
  async convertAvifToJpeg(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.avif$/i, '.jpg'), {
                type: 'image/jpeg',
              });
              resolve(newFile);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export default new PopupAdService();
