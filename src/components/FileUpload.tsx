import React, { useState } from 'react';
import { uploadTrack } from '../services/apiService';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const extractTitleFromFileName = (fileName: string) => {
        // Remove file extension and replace underscores/dashes with spaces
        return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    };

    const handleFileUpload = async () => {
        if (!file) {
            console.log("No file selected for upload");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', extractTitleFromFileName(file.name)); // Extract and append title

            // Log formData contents for debugging
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const success = await uploadTrack(formData); // Send formData with file and title
            if (success) {
                console.log('Track uploaded successfully');
                onUploadSuccess();
            } else {
                console.error('Track upload failed with no error thrown');
            }
        } catch (error) {
            console.error('Error during file upload:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='p-4 mt-8 bg-gray-100 rounded-lg'>
            <input type="file" onChange={handleFileSelect} disabled={uploading} />
            <button onClick={handleFileUpload} disabled={uploading}>Upload</button>
            {uploading && <p>Uploading...</p>}
        </div>
    );
};

export default FileUpload;
