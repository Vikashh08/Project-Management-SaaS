import React from 'react';
import { Users, Mail, Phone, MoreVertical, Plus } from 'lucide-react';

const mockTeam = [
  { id: 1, name: 'Alex Johnson', role: 'Product Manager', email: 'alex@taskflow.ai', status: 'Online' },
  { id: 2, name: 'Sarah Chen', role: 'Lead Developer', email: 'sarah@taskflow.ai', status: 'In a meeting' },
  { id: 3, name: 'Mike Ross', role: 'UI/UX Designer', email: 'mike@taskflow.ai', status: 'Offline' },
  { id: 4, name: 'Emma Wilson', role: 'QA Engineer', email: 'emma@taskflow.ai', status: 'Online' },
];

const Teams = () => {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Team Directory</h1>
          <p className="text-text-muted text-sm mt-1">Manage your organization's members</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTeam.map((member, i) => (
          <div key={member.id} className="bg-surface-color p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center relative group">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="relative inline-block mb-4">
              <img src={`https://i.pravatar.cc/150?img=${i + 40}`} alt={member.name} className="w-20 h-20 rounded-full border-4 border-surface-color shadow-sm mx-auto" />
              <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-color ${member.status === 'Online' ? 'bg-green-500' : member.status === 'Offline' ? 'bg-gray-400' : 'bg-yellow-500'}`}></div>
            </div>
            <h3 className="text-lg font-bold text-text-color">{member.name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{member.role}</p>
            
            <div className="flex justify-center space-x-2">
              <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
