import React, { useState } from 'react';
import { uploadTrack } from '../services/apiService';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null); // State for the selected file
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
      if (!file) return;

      // Validate file type and size here (if needed)

      setUploading(true);
      try {
          const success = await uploadTrack(file);
          if (success) {
              console.log('Track uploaded successfully');
              onUploadSuccess();
          } else {
              console.error('Track upload failed');
          }
      } catch (error: any) { // Type assertion for error
          console.error('Upload error:', error.message);
      } finally {
          setUploading(false);
      }
  };

    return (
      <div>
        <input type="file" onChange={handleFileSelect} disabled={uploading} />
        <button onClick={handleFileUpload} disabled={uploading}>Upload</button>
        {uploading && <p>Uploading...</p>}
        {/* Optionally, add drag-and-drop functionality */}
      </div>
    );
};

export default FileUpload;
