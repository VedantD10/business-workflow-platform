import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckSquare,
  BarChart3,
  History,
  Briefcase,
  Sliders
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create-request', label: 'Submit New Request', icon: PlusCircle },
    { to: '/requests', label: 'Request Directory', icon: FileText }
  ];

  if (['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(role)) {
    links.push({ to: '/requests?scope=pending', label: 'Pending Approvals', icon: CheckSquare });
  }

  if (['DEPARTMENT_STAFF', 'SYSTEM_ADMIN'].includes(role)) {
    links.push({ to: '/requests?scope=department', label: 'Department Work Queue', icon: Briefcase });
  }

  if (['OPERATIONS_MANAGER', 'SYSTEM_ADMIN'].includes(role)) {
    links.push({ to: '/analytics', label: 'Operational Analytics', icon: BarChart3 });
    links.push({ to: '/audit', label: 'System Audit Logs', icon: History });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shrink-0 shadow-2xs">
      <div className="mb-6 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Persona</p>
        <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name}</p>
        <p className="text-[11px] text-indigo-600 font-medium truncate">{user?.role?.replace('_', ' ')}</p>
        {user?.department && (
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{user.department.name}</p>
        )}
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
