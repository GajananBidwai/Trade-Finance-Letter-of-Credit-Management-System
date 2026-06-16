const USERS = [
  {
    id: 'u1',
    name: 'Sarah Mitchell',
    email: 's.mitchell@tradebank.com',
    role: 'Compliance Analyst',
    roleClass: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    status: 'Active',
    statusColor: 'bg-emerald-500',
    lastLogin: '2023-11-24 14:22',
    avatar: 'SM',
    avatarClass: 'bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary',
  },
  {
    id: 'u2',
    name: 'Julian Thorne',
    email: 'j.thorne@tradebank.com',
    role: 'Trade Officer',
    roleClass: 'bg-primary/10 text-primary border-primary/20',
    status: 'Active',
    statusColor: 'bg-emerald-500',
    lastLogin: '2023-11-23 09:45',
    avatarImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDosFtu6uDo9Y_9ytJoBay46nYWOcMoxWG37kzPJ6MLc6XklVHWET2BMvkvKeAJoH3LfherQBWrPB3x2S9PswpC4t-qbycjWorKi-bh_kaGJCxuQrsiNgFmY8Rko2nHtWsCIaUnFYNPqqpu4ME-7LIg3ped5fYIhsjBfdtQwHv7LrrL4LtxBSNiTtdO_xfvDkgccXQ9LjdfFqSv-8qmqjek3jPatltto2hcVjR-4M7BAqh3Zy-hHVVHFgRyut_6GtpzoZG97nB_fUs',
  },
  {
    id: 'u3',
    name: 'Elena Rodriguez',
    email: 'e.rod@tradebank.com',
    role: 'System Admin',
    roleClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30',
    status: 'Inactive',
    statusColor: 'bg-outline-variant',
    lastLogin: '2023-10-12 18:01',
    avatarIcon: 'person',
    avatarClass: 'bg-surface-container-highest text-on-surface-variant',
  },
  {
    id: 'u4',
    name: 'Ahmed Khan',
    email: 'a.khan@tradebank.com',
    role: 'Compliance Analyst',
    roleClass: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    status: 'Active',
    statusColor: 'bg-emerald-500',
    lastLogin: '2023-11-24 11:30',
    avatar: 'AK',
    avatarClass: 'bg-gradient-to-br from-error/20 to-primary/20 text-error',
  },
];

export const UserTable = () => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 border-b border-outline-variant/20">
              <th className="px-6 py-4 font-label-md text-xs uppercase tracking-widest text-on-surface-variant">User Profile</th>
              <th className="px-6 py-4 font-label-md text-xs uppercase tracking-widest text-on-surface-variant">Role</th>
              <th className="px-6 py-4 font-label-md text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-6 py-4 font-label-md text-xs uppercase tracking-widest text-on-surface-variant">Last Login</th>
              <th className="px-6 py-4 font-label-md text-xs uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {USERS.map((user) => (
              <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatarImg ? (
                      <img src={user.avatarImg} alt={user.name} className="w-10 h-10 rounded-full border border-outline-variant/30 object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.avatarClass}`}>
                        {user.avatarIcon ? <span className="material-symbols-outlined">{user.avatarIcon}</span> : user.avatar}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-on-surface">{user.name}</p>
                      <p className="text-on-surface-variant text-[12px]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 border rounded-full font-label-md text-[11px] ${user.roleClass}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.statusColor} ${user.status === 'Active' ? 'animate-pulse' : ''}`}></span>
                    <span className={`font-body-md ${user.status === 'Active' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-label-md text-[13px] text-on-surface-variant">{user.lastLogin}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface" title="Edit Role">
                      <span className="material-symbols-outlined text-[20px]">edit_square</span>
                    </button>
                    {user.status === 'Active' ? (
                      <button className="p-2 hover:bg-error-container/20 rounded-lg text-error" title="Deactivate">
                        <span className="material-symbols-outlined text-[20px]">person_off</span>
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400" title="Activate">
                        <span className="material-symbols-outlined text-[20px]">person_check</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-container-low/50 px-6 py-4 flex justify-between items-center border-t border-outline-variant/10">
        <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-30" disabled>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-md">Previous</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-md">1</button>
          <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-on-surface-variant font-label-md transition-colors">2</button>
          <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-on-surface-variant font-label-md transition-colors">3</button>
          <span className="text-on-surface-variant">...</span>
          <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-on-surface-variant font-label-md transition-colors">128</button>
        </div>
        <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="font-label-md">Next</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
