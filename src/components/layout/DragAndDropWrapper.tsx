import React, { FC, useRef, useState } from "react"
import { FaUpload } from "react-icons/fa";
import { extractTitleFromFileName } from "../FileUpload";
import { useTracks } from "@/hooks/UseTracks";
interface IProps {

}
const DragAndDropWrapper: FC<IProps> = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false)
    const { uploadTrack, fetchTracks } = useTracks();
    const onDragEnter = () => setShowModal(true)
    const onDragLeave = () => setShowModal(false)
    const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setShowModal(false)
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            if (fileInputRef.current) {
                fileInputRef.current.files = files
                setUploading(true);
                for (let i = 0; i < files.length; i++) {
                    const file: File = files[i]
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('name', extractTitleFromFileName(file.name));
                    try {
                        const success = await uploadTrack(formData); // Use the uploadTrack function from the hook
                        if (success) {
                            console.log('Track uploaded successfully');
                            await fetchTracks();
                            // Optionally, refetch tracks to update the list
                        } else {
                            console.error('Track upload failed with no error thrown');
                        }

                    } catch (error) {
                        console.error('Error during file upload:', error);
                    }
                }
                setUploading(false);
            }
        }
    };

    const handlePreventDefault = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()
    return (
        <React.Fragment key="drag-and-drop">
            <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onDragOver={handlePreventDefault}
                ref={wrapperRef}
                className={`grid place-content-center fixed inset-0 w-full h-full ${showModal || uploading ? "bg-black/20" : ''}`}
            >
                <input
                    ref={fileInputRef}
                    className="inset-0 absolute opacity-0 w-full h-full hidden"
                    type="file"
                    accept="image/*"
                />
            </div>
            {(showModal || uploading) && (
                <div
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    className="border-2 border-dotted p-8 flex m-auto -z-10 flex-col space-y-4 items-center fixed inset-0 w-fit h-fit">
                    <FaUpload />
                    <span>{uploading ? "File uploading" : "Drop file To upload"}</span>
                </div>
            )}
        </React.Fragment>

    )
}
export default DragAndDropWrapper