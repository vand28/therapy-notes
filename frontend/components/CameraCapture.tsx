'use client';

import { useState, useRef, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

// Validate that preview URL is a safe blob URL
const isValidBlobUrl = (url: string | null): boolean => {
  if (!url) return false;
  return url.startsWith('blob:') || url.startsWith('data:image/');
};

export default function CameraCapture({ 
  onCapture, 
  onError, 
  disabled = false,
  maxSizeMB = 5 
}: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920; // Max width/height

          // Resize if too large
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File size exceeds ${maxSizeMB}MB. Please choose a smaller image.`);
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file.');
      return;
    }

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress if needed
      const compressedFile = await compressImage(file);
      onCapture(compressedFile);
    } catch (err) {
      onError?.('Failed to process image');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      onError?.('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureFromCamera = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          stopCamera();
          const previewUrl = URL.createObjectURL(file);
          setPreview(previewUrl);
          
          const compressedFile = await compressImage(file);
          onCapture(compressedFile);
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && isValidBlobUrl(preview)) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!preview && !isCapturing && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFileButtonClick}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>📁</span>
            Choose Photo
          </button>
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>📷</span>
            Take Photo
          </button>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={captureFromCamera}
              className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {preview && isValidBlobUrl(preview) && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md mx-auto rounded-lg border border-gray-300 dark:border-gray-600"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => {
              onError?.('Failed to load image preview');
              clearPreview();
            }}
          />
          <button
            type="button"
            onClick={clearPreview}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
          >
            Remove Photo
          </button>
        </div>
      )}
    </div>
  );
}

