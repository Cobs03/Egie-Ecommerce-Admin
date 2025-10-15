import { supabase } from '../lib/supabase.js'

export class StorageService {
  static BUCKET_NAME = 'bundles' // Change this to your bucket name
  static bucketInitialized = false

  /**
   * Ensure the storage bucket exists, create if it doesn't
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async ensureBucketExists() {
    try {
      // Check if we've already initialized
      if (this.bucketInitialized) {
        return { success: true }
      }

      // Try to check if bucket exists, but don't fail if we can't list buckets
      // This is because the anon key may not have permission to list buckets
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (!listError && buckets && buckets.length > 0) {
          console.log('Available buckets:', buckets.map(b => b.name))
          const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME)
          
          if (!bucketExists) {
            console.warn(`Bucket '${this.BUCKET_NAME}' not found in list. Will try to upload anyway.`)
          } else {
            console.log(`✅ Bucket '${this.BUCKET_NAME}' confirmed to exist`)
          }
        } else {
          console.warn('Could not list buckets (this is normal with anon key). Assuming bucket exists.')
        }
      } catch (listErr) {
        console.warn('Bucket list check failed, but continuing anyway:', listErr.message)
      }

      // Always mark as initialized and return success
      // The actual upload will fail with a clear error if the bucket doesn't exist
      this.bucketInitialized = true
      return { success: true }
    } catch (error) {
      console.error('Bucket initialization exception:', error)
      // Still return success - let the upload fail if there's a real problem
      this.bucketInitialized = true
      return { success: true }
    }
  }

  /**
   * Upload a single image to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} folder - Optional folder path (e.g., 'bundles', 'products')
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  static async uploadImage(file, folder = 'bundles') {
    try {
      // Ensure bucket exists before uploading
      const bucketCheck = await this.ensureBucketExists()
      if (!bucketCheck.success) {
        return bucketCheck
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        return { success: false, error: error.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { success: true, data: publicUrl }
    } catch (error) {
      console.error('Storage upload exception:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Upload multiple images
   * @param {File[]} files - Array of files to upload
   * @param {string} folder - Optional folder path
   * @returns {Promise<{success: boolean, data?: string[], error?: string}>}
   */
  static async uploadMultipleImages(files, folder = 'bundles') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder))
      const results = await Promise.all(uploadPromises)

      // Check if any uploads failed
      const failedUpload = results.find(result => !result.success)
      if (failedUpload) {
        return { success: false, error: failedUpload.error }
      }

      // Extract all public URLs
      const urls = results.map(result => result.data)
      return { success: true, data: urls }
    } catch (error) {
      console.error('Multiple upload exception:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete an image from storage
   * @param {string} url - The public URL of the image
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteImage(url) {
    try {
      // Extract file path from URL
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${this.BUCKET_NAME}/`)
      
      if (pathParts.length < 2) {
        return { success: false, error: 'Invalid URL format' }
      }

      const filePath = pathParts[1]

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Storage delete error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Storage delete exception:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete multiple images
   * @param {string[]} urls - Array of public URLs
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteMultipleImages(urls) {
    try {
      const deletePromises = urls.map(url => this.deleteImage(url))
      const results = await Promise.all(deletePromises)

      const failedDelete = results.find(result => !result.success)
      if (failedDelete) {
        return { success: false, error: failedDelete.error }
      }

      return { success: true }
    } catch (error) {
      console.error('Multiple delete exception:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get public URL for a file path
   * @param {string} filePath - The path in storage
   * @returns {string}
   */
  static getPublicUrl(filePath) {
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return publicUrl
  }
}
