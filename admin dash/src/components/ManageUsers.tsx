import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=";

interface DbUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  verification_status: string;
  current_level: string;
  province: string | null;
  town: string | null;
  profile_picture_url: string | null;
  is_disabled: boolean;
}

const ManageUsers: React.FC = () => {
  const [pending, setPending] = useState<DbUser[]>([]);
  const [practitioners, setPractitioners] = useState<DbUser[]>([]);
  const [learners, setLearners] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const all = data as DbUser[];
      setPending(all.filter(u => u.role === 'practitioner' && u.status === 'pending'));
      setPractitioners(all.filter(u => u.role === 'practitioner' && u.status !== 'pending'));
      setLearners(all.filter(u => u.role === 'learner'));
    } catch (err: any) {
      console.error('Error loading users from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAccept = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'approved', verification_status: 'verified' })
        .eq('id', id);
      if (error) throw error;
      const user = pending.find(u => u.id === id);
      setPractitioners(prev => [...prev, { ...user!, status: 'approved', verification_status: 'verified' }]);
      setPending(prev => prev.filter(u => u.id !== id));
      setModalMessage(`${user?.name}'s application has been approved.`);
      setModalType('success');
      setShowModal(true);
    } catch (err: any) {
      setModalMessage(`Error: ${err.message}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleDeny = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'disabled', is_disabled: true })
        .eq('id', id);
      if (error) throw error;
      const user = pending.find(u => u.id === id);
      setPending(prev => prev.filter(u => u.id !== id));
      setModalMessage(`${user?.name}'s application has been denied.`);
      setModalType('error');
      setShowModal(true);
    } catch (err: any) {
      setModalMessage(`Error: ${err.message}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleToggleAccount = async (id: string, currentDisabled: boolean, name: string, listType: 'practitioner' | 'learner') => {
    try {
      const newDisabled = !currentDisabled;
      const newStatus = newDisabled ? 'disabled' : (listType === 'practitioner' ? 'approved' : 'active');
      const { error } = await supabase
        .from('users')
        .update({ is_disabled: newDisabled, status: newStatus })
        .eq('id', id);
      if (error) throw error;

      const updateList = (prev: DbUser[]) =>
        prev.map(u => u.id === id ? { ...u, is_disabled: newDisabled, status: newStatus } : u);

      if (listType === 'practitioner') setPractitioners(updateList);
      else setLearners(updateList);

      setModalMessage(`${name}'s account has been ${newDisabled ? 'disabled' : 'enabled'}.`);
      setModalType(newDisabled ? 'error' : 'success');
      setShowModal(true);
    } catch (err: any) {
      setModalMessage(`Error: ${err.message}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-full mx-auto p-6">
        <div className="text-center py-16 text-gray-500">Loading users from Supabase...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 -mx-8">
      <div className="mb-4">
        <button
          onClick={() => { window.location.hash = ''; }}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to User Insights
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Users</h2>

      {/* Pending Practitioners */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Pending Practitioners
          {pending.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{pending.length}</span>
          )}
        </h3>
        {pending.length === 0 ? (
          <div className="text-gray-500 italic">No pending requests.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(u => (
              <div key={u.id} className="bg-gray-50 border rounded-lg p-4 flex gap-3 shadow-sm">
                <img
                  src={u.profile_picture_url || `${DEFAULT_AVATAR}${u.id}`}
                  alt={u.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">{u.current_level} Practitioner</div>
                  <div className="text-xs text-purple-600">{u.province} • {u.town}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600" onClick={() => handleAccept(u.id)}>Approve</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600" onClick={() => handleDeny(u.id)}>Deny</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registered Practitioners */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Registered Practitioners
          <span className="ml-2 text-sm font-normal text-gray-500">({practitioners.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practitioners.map(u => (
            <div key={u.id} className="bg-gray-50 border rounded-lg p-4 flex gap-3 shadow-sm">
              <img
                src={u.profile_picture_url || `${DEFAULT_AVATAR}${u.id}`}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
                <div className="text-xs text-blue-600 font-medium mt-1">Level: {u.current_level}</div>
                <div className="text-xs text-gray-500">Verification: {u.verification_status}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-semibold ${u.is_disabled ? 'text-red-600' : 'text-green-600'}`}>
                    {u.is_disabled ? 'Disabled' : 'Approved'}
                  </span>
                  <button
                    onClick={() => handleToggleAccount(u.id, u.is_disabled, u.name, 'practitioner')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      u.is_disabled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {u.is_disabled ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Learners */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Registered Learners
          <span className="ml-2 text-sm font-normal text-gray-500">({learners.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learners.map(u => (
            <div key={u.id} className="bg-gray-50 border rounded-lg p-4 flex gap-3 shadow-sm">
              <img
                src={u.profile_picture_url || `${DEFAULT_AVATAR}${u.id}`}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
                <div className="text-xs text-orange-600 font-medium mt-1">{u.current_level} • {u.province || '—'}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-semibold ${u.is_disabled ? 'text-red-600' : 'text-orange-600'}`}>
                    {u.is_disabled ? 'Disabled' : 'Active Learner'}
                  </span>
                  <button
                    onClick={() => handleToggleAccount(u.id, u.is_disabled, u.name, 'learner')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      u.is_disabled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {u.is_disabled ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center justify-center mb-4">
              {modalType === 'success' ? (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${modalType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {modalType === 'success' ? 'Action Successful' : 'Action Failed'}
            </h3>
            <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
                modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
