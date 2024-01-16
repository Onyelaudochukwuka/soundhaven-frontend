import React, { useState } from 'react';
import { uploadTrack } from '../services/apiService';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const extractTitleFromFileName = (fileName: string) => {
        // Remove file extension and replace underscores/dashes with spaces
        return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', extractTitleFromFileName(file.name)); // Extract and append title

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
            setUploading(false); // Ensure uploading state is reset regardless of success or failure
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            await handleFileUpload(selectedFile);
        }
    };


    return (
        <div className='p-4 mt-8 bg-gray-100 rounded-lg'>
            <div style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <input type="file" onChange={handleFileSelect} disabled={uploading} style={{ width: '100%', opacity: 0, position: 'absolute', cursor: 'pointer' }} />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                    <button disabled={uploading} style={{ pointerEvents: 'none', backgroundColor: 'lightblue', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
                        Upload File
                    </button>
                </label>
            </div>
        </div>
    );       
};

export default FileUpload;