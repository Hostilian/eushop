"use client";

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Alert } from '../ui/Alert';
import { apiClient } from '../../lib/api-client';
import { Paperclip, X, File, Image as ImageIcon, FileText, FileArchive } from 'lucide-react';

interface FileAttachmentProps {
  conversationId: string;
  onFileUpload?: (fileUrl: string, fileName: string) => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  conversationId,
  onFileUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }

      const response = await apiClient.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data.url) {
        if (onFileUpload) {
          onFileUpload(response.data.data.url, file.name);
        }
      } else {
        setError('File upload failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <FileArchive className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <Tooltip content="Attach file" open={showTooltip} onOpenChange={setShowTooltip}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      </Tooltip>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <Alert.Heading>Upload Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
    </div>
  );
};