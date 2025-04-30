import React from 'react';
import { Desporto } from '~/schemas/desporto';

type DesportoTableProps = {
  data: Desporto[];
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
        {data.map((desporto) => (
          <tr key={desporto.id}>
            <td className="border border-gray-300 px-4 py-2">{desporto.name}</td>
            <td className="border border-gray-300 px-4 py-2">
              {desporto.imageUrl ? <img src={desporto.imageUrl} alt={desporto.name} className="h-10" /> : 'N/A'}
            </td>
            <td className="border border-gray-300 px-4 py-2">{desporto.type}</td>
            <td className="border border-gray-300 px-4 py-2">
              <button onClick={() => onEdit(desporto.id)} className="btn btn-secondary mr-2">
                Edit
              </button>
              <button onClick={() => onDelete(desporto.id)} className="btn btn-danger">
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