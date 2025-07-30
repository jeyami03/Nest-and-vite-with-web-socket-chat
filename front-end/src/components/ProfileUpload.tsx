import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Image, Alert, Spinner } from 'react-bootstrap';
import { Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

interface ProfileUploadProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({ show, onHide, onSuccess }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile image updated successfully!');
      onSuccess();
      onHide();
      resetForm();
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
      toast.error('Failed to upload profile image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Profile Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="text-center mb-3">
          {user?.profileImage && (
            <div className="mb-3">
              <p className="text-muted mb-2">Current Profile Image:</p>
              <Image
                src={`http://localhost:3000${user.profileImage}`}
                roundedCircle
                width={100}
                height={100}
                className="border"
              />
            </div>
          )}
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select New Image</Form.Label>
            <div className="d-grid">
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <Camera size={20} />
                Choose Image
              </Button>
            </div>
            <Form.Text className="text-muted">
              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
            </Form.Text>
          </Form.Group>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {previewUrl && (
            <div className="text-center mb-3">
              <p className="text-muted mb-2">Preview:</p>
              <Image
                src={previewUrl}
                roundedCircle
                width={100}
                height={100}
                className="border"
              />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} className="me-2" />
              Upload
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileUpload; 