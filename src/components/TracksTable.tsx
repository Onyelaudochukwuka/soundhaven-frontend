import React from 'react';

const TracksTable = ({ tracks }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Artist</th>
          <th>Album</th>
          <th>Duration</th>
          <th>Play</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map(track => (
          <tr key={track.id}>
            <td>{track.title}</td>
            <td>{track.artist}</td>
            <td>{track.album}</td>
            <td>{track.duration}</td>
            <td>{/* Play Button */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TracksTable;
