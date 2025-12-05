'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import uploadApi from '@/services/uploadApi';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  label = 'Product Images',
  helperText = 'Upload up to 5 images. First image will be the main product image.',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max images
    if (value.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload images
      const response = await uploadApi.uploadMultipleImages(validFiles);

      // Extract URLs from response
      const newUrls = response.files.map((file) => file.url);

      // Add to existing images
      onChange([...value, ...newUrls]);
      setUploadProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload failed', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...value];
    const newIndex = direction === 'left' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newImages.length) return;

    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {helperText && (
          <p className="text-xs text-gray-500 mb-2">{helperText}</p>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
          >
            <img
              src={url}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Main Image Badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {/* Move Left */}
              {index > 0 && (
                <button
                  onClick={() => moveImage(index, 'left')}
                  className="bg-white text-gray-800 p-2 rounded hover:bg-gray-100"
                  title="Move left"
                >
                  ←
                </button>
              )}

              {/* Remove */}
              <button
                onClick={() => removeImage(index)}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Move Right */}
              {index < value.length - 1 && (
                <button
                  onClick={() => moveImage(index, 'right')}
                  className="bg-white text-gray-800 p-2 rounded hover:bg-gray-100"
                  title="Move right"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-allegro-orange hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-allegro-orange disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Upload className="h-8 w-8 animate-pulse" />
                <span className="text-xs">Uploading...{uploadProgress}%</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-allegro-orange h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
