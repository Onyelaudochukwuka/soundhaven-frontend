import React, { useState } from 'react';
import { Track } from '../../types/types';

interface EditTrackFormProps {
  track: Track;
  onSave: (updatedTrack: Track) => void;
}

const EditTrackForm: React.FC<EditTrackFormProps> = ({ track, onSave }) => {
    const [updatedTrack, setUpdatedTrack] = useState({ ...track });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedTrack({ ...updatedTrack, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(updatedTrack);
  };

  return (
    <form onSubmit={(e) => {
        e.preventDefault();
        onSave(updatedTrack);
      }}>      
      <label>
        Title:
        <input name="name" value={updatedTrack.name} onChange={handleChange} />
      </label>
      {/* Add more fields for artist, album, etc., similar to the above */}
      <button type="submit">Save</button>
    </form>
  );
};

export default EditTrackForm;
