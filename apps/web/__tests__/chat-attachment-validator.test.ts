import { validateChatAttachment } from '../lib/chat-attachment-validator';

describe('Chat Attachment Virus Scanner & PDF Validator (Task 83)', () => {
  it('approves clean PDF attachments within 10MB limit', () => {
    const res = validateChatAttachment('invoice.pdf', 'application/pdf', 1024 * 1024);
    expect(res.isValid).toBe(true);
    expect(res.virusScanStatus).toBe('clean');
  });

  it('quarantines files exceeding 10MB limit', () => {
    const res = validateChatAttachment('large.pdf', 'application/pdf', 15 * 1024 * 1024);
    expect(res.isValid).toBe(false);
    expect(res.virusScanStatus).toBe('quarantined');
  });

  it('rejects unapproved file types', () => {
    const res = validateChatAttachment('malware.exe', 'application/x-msdownload', 500);
    expect(res.isValid).toBe(false);
  });
});
