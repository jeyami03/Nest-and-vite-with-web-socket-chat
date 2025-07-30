import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Box from './Box';

interface ImageViewerProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, fileName, onClose }) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      className="image-viewer-overlay"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Box className="image-viewer-container">
        {/* Header with controls */}
        <Box className="image-viewer-header">
          <Box className="image-viewer-title">
            {fileName || 'Image'}
          </Box>
          <Box className="image-viewer-controls">
            <button
              onClick={handleZoomOut}
              className="image-viewer-btn"
              title="Zoom Out"
              disabled={scale <= 0.1}
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleZoomIn}
              className="image-viewer-btn"
              title="Zoom In"
              disabled={scale >= 5}
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleRotate}
              className="image-viewer-btn"
              title="Rotate"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={handleReset}
              className="image-viewer-btn"
              title="Reset"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="image-viewer-btn image-viewer-close"
              title="Close"
            >
              <X size={20} />
            </button>
          </Box>
        </Box>

        {/* Image container */}
        <Box 
          className="image-viewer-content"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
        >
          <img
            src={imageUrl}
            alt={fileName || 'Image'}
            className="image-viewer-image"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        </Box>

        {/* Zoom indicator */}
        <Box className="image-viewer-zoom-indicator">
          {Math.round(scale * 100)}%
        </Box>
      </Box>
    </div>
  );
};

export default ImageViewer; 