import React, { useState, useRef, useCallback } from 'react';
import { Form, Button, Spinner, Image } from 'react-bootstrap';
import { Send, Paperclip, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { chatAPI } from '../services/api';

interface MessageInputProps {
  selectedUserId: string;
  currentUserId: string;
  onMessageSent: (message: any) => void;
  socket: any;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  selectedUserId,
  currentUserId,
  onMessageSent,
  socket,
  uploading,
  setUploading
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimized message sending with useCallback
  const sendMessage = useCallback(async () => {
    if (!selectedUserId || !socket) return;

    // If there's a selected file, upload it first
    if (selectedFile) {
      await sendFile();
      return;
    }

    // Send text message only if there's content
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      // Send API request - this will handle message creation and notifications
      const response = await chatAPI.sendMessage({
        content: messageContent,
        receiverId: selectedUserId,
        type: 'TEXT',
        senderId: currentUserId
      });

      // Callback to parent
      onMessageSent(response.data);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setInputMessage(messageContent); // Restore message on error
    }
  }, [inputMessage, selectedUserId, socket, currentUserId, onMessageSent, selectedFile]);

  // Send file function
  const sendFile = useCallback(async () => {
    if (!selectedFile || !selectedUserId || !socket) return;

    const isImage = selectedFile.type.startsWith('image/');
    const messageContent = inputMessage ? inputMessage.trim() : (isImage ? '📷 Image' : `📎 ${selectedFile.name}`);
    
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('receiverId', selectedUserId);
      formData.append('type', isImage ? 'IMAGE' : 'FILE');
      formData.append('content', messageContent);
      formData.append('senderId', currentUserId);

      const response = await chatAPI.uploadFile(formData);

      onMessageSent(response.data);
      
      // Clear the selected file and preview
      setSelectedFile(null);
      setFilePreview(null);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, selectedUserId, socket, onMessageSent, setUploading, currentUserId, inputMessage]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Clear the file input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  // Remove selected file
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="chat-input">
      {/* File Preview */}
      {selectedFile && (
        <div className="file-preview-container mb-2">
          <div className="file-preview">
            {filePreview ? (
              <div className="image-preview">
                <Image
                  src={filePreview}
                  fluid
                  rounded
                  style={{ maxHeight: '150px', maxWidth: '200px' }}
                />
                <button
                  onClick={removeSelectedFile}
                  className="remove-file-btn"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="file-info">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                <button
                  onClick={removeSelectedFile}
                  className="remove-file-btn"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="d-flex gap-2 align-items-end">
        <Form.Control
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow-1 message-input-field"
        />
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="attachment-btn"
          title="Attach file"
        >
          {uploading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Paperclip size={16} />
          )}
        </Button>
        <Button
          variant="primary"
          onClick={sendMessage}
          disabled={!inputMessage.trim() && !selectedFile}
          className="send-btn"
          title="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default MessageInput; 