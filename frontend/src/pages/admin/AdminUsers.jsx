import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, blockUnblockUser } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { Shield, ArrowLeft, UserX, UserCheck, AlertCircle, Lock } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        setUsers(res.data.users || res.data);
      })
      .catch((err) => console.error("Fetch Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBlockAction = async (userId, userName) => {
    const confirmAction = window.confirm(`Are you sure you want to change the access status for ${userName}?`);
    
    if (confirmAction) {
      try {
        const res = await blockUnblockUser(userId);
        setUsers((prev) =>
          prev.map((u) => 
            u._id === userId ? { ...u, isBlocked: res.data.user.isBlocked } : u
          )
        );
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update user status');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex flex-col items-center px-4 md:px-6 pb-20">
        
        {/* HEADER SECTION - Responsive Text Sizes */}
        <div className="w-full max-w-5xl py-12 md:py-20 text-center"> 
          <Link 
            to="/admin" 
            className="inline-flex items-center text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-[0.3em] mb-4 md:mb-6 hover:translate-x-[-4px] transition-all"
          >
            <ArrowLeft size={14} className="mr-2" /> Dashboard
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">
            Access Control
          </h1>
          <p className="mt-3 md:mt-4 text-slate-400 text-sm md:text-base font-medium">
            {currentUser?.role === 'superadmin' 
              ? "Manage user permissions and security status" 
              : "Viewing user permissions (Read-Only Mode)"}
          </p>
        </div>

        {/* TABLE CONTAINER */}
        <div className="w-full max-w-5xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white rounded-[20px] overflow-hidden">
          {loading ? (
            <div className="py-24 text-center text-slate-400 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px] md:text-xs">
              Synchronizing Database...
            </div>
          ) : (
            /* Responsive Table Wrapper */
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {['Member', 'Role', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-6 md:px-10 py-6 md:py-8 text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                      
                      {/* MEMBER INFO */}
                      <td className="px-6 md:px-10 py-6 md:py-10">
                        <div className="flex flex-col">
                          <p className="text-sm md:text-base font-bold text-slate-900">{u.name}</p>
                          <p className="text-[12px] md:text-sm text-slate-400 truncate max-w-[150px] md:max-w-none">{u.email}</p>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="px-6 md:px-10 py-6 md:py-10">
                        <span className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${
                          u.role === 'admin' || u.role === 'superadmin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {(u.role === 'admin' || u.role === 'superadmin') && <Shield size={12} />}
                          {u.role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 md:px-10 py-6 md:py-10">
                        <div className={`flex items-center gap-2 text-[12px] md:text-sm font-bold ${u.isBlocked ? 'text-red-500' : 'text-emerald-500'}`}>
                          <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 md:px-10 py-6 md:py-10">
                        <div className="flex justify-start">
                          {/* Yahan aapka "View Only" logic hai */}
                          {currentUser?.role === 'superadmin' ? (
                            u.role !== 'superadmin' ? (
                              <button
                                onClick={() => handleBlockAction(u._id, u.name)}
                                className={`px-4 md:px-6 h-[36px] md:h-[40px] rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                                  u.isBlocked 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                  : 'bg-slate-900 text-white hover:bg-black'
                                }`}
                              >
                                {u.isBlocked ? (
                                  <><UserCheck size={16} /> Unblock</>
                                ) : (
                                  <><UserX size={16} /> Block</>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-300 italic text-[10px] font-bold uppercase tracking-widest">
                                <AlertCircle size={14} /> System Root
                              </div>
                            )
                          ) : (
                            /* Non-Superadmin Admins will see this */
                            <div className="flex items-center gap-2 text-slate-400/60 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                              <Lock size={12} /> View Only
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;