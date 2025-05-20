import React from 'react';
import { sport } from '~/schemas/sport-schema';

type DesportoTableProps = {
  data: sport[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const DesportoTable: React.FC<DesportoTableProps> = ({ data, onEdit, onDelete }) => {
  return (
    <table className="table-auto w-full border-collapse border border-gray-200">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Name</th>
          <th className="border border-gray-300 px-4 py-2">Image</th>
          <th className="border border-gray-300 px-4 py-2">Type</th>
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((sport) => (
          <tr key={sport.id}>
            <td className="border border-gray-300 px-4 py-2">{sport.name}</td>
            <td className="border border-gray-300 px-4 py-2">
              {sport.imageUrl ? <img src={sport.imageUrl} alt={sport.name} className="h-10" /> : 'N/A'}
            </td>
            <td className="border border-gray-300 px-4 py-2">{sport.type}</td>
            <td className="border border-gray-300 px-4 py-2">
              <button onClick={() => onEdit(sport.id)} className="btn btn-secondary mr-2">
                Edit
              </button>
              <button onClick={() => onDelete(sport.id)} className="btn btn-danger">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DesportoTable;