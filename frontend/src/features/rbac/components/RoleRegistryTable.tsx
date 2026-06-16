import { useState } from 'react';

const ROLES = [
  { id: 'admin', name: 'Admin', desc: 'Full system access, policy management, audit logs.', users: 4, color: 'bg-primary' },
  { id: 'trade_officer', name: 'Trade Officer', desc: 'Issue Letters of Credit, manage client documents.', users: 18, color: 'bg-primary' },
  { id: 'compliance_analyst', name: 'Compliance Analyst', desc: 'AML checks, sanction screening, risk assessment.', users: 12, color: 'bg-tertiary' },
  { id: 'settlement_officer', name: 'Settlement Officer', desc: 'Finalize payments, coordinate bank transfers.', users: 9, color: 'bg-secondary' },
];

interface RoleRegistryTableProps {
  onSelectRole: (roleName: string) => void;
  selectedRole: string;
}

export const RoleRegistryTable = ({ onSelectRole, selectedRole }: RoleRegistryTableProps) => {
  return (
    <div className="glass-panel rounded-[24px] overflow-hidden flex flex-col h-full">
      <div className="bg-surface-container-highest p-4 flex justify-between items-center">
        <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Role Registry</span>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">filter_list</span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant/10">
            <tr>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">ROLE NAME</th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">DESCRIPTION</th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant text-center">USERS</th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.name;
              return (
                <tr 
                  key={role.id}
                  onClick={() => onSelectRole(role.name)}
                  className={`transition-colors group cursor-pointer ${
                    isSelected ? 'bg-white/5 border-l-4 border-primary' : 'hover:bg-primary/5 border-l-4 border-transparent'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${role.color} ${isSelected ? 'pulse-border' : ''}`}></div>
                      <span className="font-body-md font-bold">{role.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-body-md text-on-surface-variant">{role.desc}</td>
                  <td className="p-4 text-center font-label-md">{role.users.toString().padStart(2, '0')}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary font-bold text-body-md hover:underline decoration-2 underline-offset-4">
                      Manage Permissions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
