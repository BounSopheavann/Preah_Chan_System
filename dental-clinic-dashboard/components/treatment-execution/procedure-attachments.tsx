'use client';

import { Paperclip, Image as ImageIcon, X, Eye, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProcedureAttachment } from './treatment-execution-data';

interface ProcedureAttachmentsProps {
  attachments: ProcedureAttachment[];
  onChange: (attachments: ProcedureAttachment[]) => void;
}

export function ProcedureAttachments({ attachments, onChange }: ProcedureAttachmentsProps) {
  const addAttachment = (type: 'Clinical Image' | 'X-ray') => {
    const newAttachment: ProcedureAttachment = {
      id: `att-${Date.now()}`,
      type,
      fileName: `${type === 'Clinical Image' ? 'image' : 'xray'}-${attachments.length + 1}.jpg`,
      fileUrl: '#',
      uploadedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      uploadedBy: 'Dr. Maya',
    };
    onChange([...attachments, newAttachment]);
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Attachments</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{attachments.length}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addAttachment('Clinical Image')}>
            <ImageIcon className="size-3.5" />
            Add Image
          </Button>
          <Button variant="outline" size="sm" onClick={() => addAttachment('X-ray')}>
            <FileUp className="size-3.5" />
            Add X-ray
          </Button>
        </div>
      </div>

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">No attachments for this procedure. Click "Add Image" or "Add X-ray" to attach files.</p>
      )}

      {attachments.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 dark:bg-background/20">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                attachment.type === 'X-ray' ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400' : 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400'
              }`}>
                {attachment.type === 'X-ray' ? <FileUp className="size-4" /> : <ImageIcon className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{attachment.fileName}</p>
                <p className="text-[10px] text-muted-foreground">{attachment.type} · {attachment.uploadedAt}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                  title="Preview"
                >
                  <Eye className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600"
                  title="Remove"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}