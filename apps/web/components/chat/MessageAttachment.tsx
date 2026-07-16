"use client";

import React from 'react';
import { File, Image as ImageIcon, FileText, FileArchive, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface MessageAttachmentProps {
  content: string;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({ content }) => {
  // Parse attachments from message content
  const parseAttachments = () => {
    const attachmentRegex = /\\\[Attachment: (.+?)\\]\\((.+?)\\)/g;
    const attachments = [];
    let match;

    while ((match = attachmentRegex.exec(content)) !== null) {
      attachments.push({
        name: match[1],
        url: match[2],
      });
    }

    return attachments;
  };

  const attachments = parseAttachments();

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        const isPdf = attachment.name.match(/\.pdf$/i);
        const isArchive = attachment.name.match(/\.(zip|rar|7z|tar|gz)$/i);

        return (
          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isImage ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : isPdf ? (
                  <FileText className="h-5 w-5 text-red-500" />
                ) : isArchive ? (
                  <FileArchive className="h-5 w-5 text-yellow-500" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {attachment.name}
                </span>
              </div>
              <a
                href={attachment.url}
                download={attachment.name}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
            {isImage && (
              <div className="mt-2">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-full h-auto rounded-md max-h-60 object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};