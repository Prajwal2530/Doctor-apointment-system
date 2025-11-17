
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Role, Doctor } from '../types';
import { API_BASE_URL, DOCTOR_PLACEHOLDER_IMAGE } from '../constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'doctors' | 'users'>('doctors');

    // Doctor Modal State
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialDoctorState = {
        name: '', email: '', password: '', specialization: '',
        experience: '', fees: '', availability: '', languages: '',
        consultationModes: '', facility: '', location: '', image: ''
    };
    const [doctorForm, setDoctorForm] = useState(initialDoctorState);

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) throw new Error('Failed to update role');
            await fetchUsers(); 
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete user');
            await fetchUsers();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const openAddDoctorModal = () => {
        setDoctorForm(initialDoctorState);
        setIsEditing(false);
        setSelectedDoctorId(null);
        setIsDoctorModalOpen(true);
    };

    const openEditDoctorModal = (doctor: Doctor) => {
        setDoctorForm({
            name: doctor.name,
            email: doctor.email,
            password: '', // Password blank for edit
            specialization: doctor.specialization || '',
            experience: doctor.experience?.toString() || '',
            fees: doctor.fees?.toString() || '',
            availability: doctor.availability?.join(', ') || '',
            languages: doctor.languages?.join(', ') || '',
            consultationModes: doctor.consultationModes?.join(', ') || '',
            facility: doctor.facility || '',
            location: doctor.location || '',
            image: doctor.image || ''
        });
        setIsEditing(true);
        setSelectedDoctorId(doctor.id);
        setIsDoctorModalOpen(true);
    };

    const handleDoctorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
    };

    const handleSaveDoctor = async (e: FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsSubmitting(true);

        try {
            const url = isEditing 
                ? `${API_BASE_URL}/api/admin/doctors/${selectedDoctorId}`
                : `${API_BASE_URL}/api/admin/add-doctor`;
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...doctorForm,
                    experience: Number(doctorForm.experience),
                    fees: Number(doctorForm.fees)
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save doctor');
            }

            alert(isEditing ? 'Doctor updated successfully!' : 'Doctor added successfully!');
            setIsDoctorModalOpen(false);
            await fetchUsers(); 
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const doctors = users.filter((u): u is Doctor => u.role === Role.Doctor);
    const patients = users.filter(u => u.role === Role.Patient);
    const admins = users.filter(u => u.role === Role.Admin);

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200";
    
    if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;
    if (error) return <p className="text-danger text-center p-4">{error}</p>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
                <div className="flex space-x-2">
                    <Button 
                        variant={activeTab === 'doctors' ? 'primary' : 'secondary'} 
                        onClick={() => setActiveTab('doctors')}>
                        Manage Doctors
                    </Button>
                    <Button 
                        variant={activeTab === 'users' ? 'primary' : 'secondary'} 
                        onClick={() => setActiveTab('users')}>
                        All Users
                    </Button>
                </div>
            </div>

            {activeTab === 'doctors' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Registered Doctors ({doctors.length})</h2>
                        <Button onClick={openAddDoctorModal} variant="success">
                            + Add New Doctor
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <Card key={doctor.id} className="flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-4">
                                    <img 
                                        src={doctor.image || DOCTOR_PLACEHOLDER_IMAGE} 
                                        alt={doctor.name} 
                                        className="w-16 h-16 rounded-full object-cover bg-gray-200"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-dark">{doctor.name}</h3>
                                        <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                                        <p className="text-xs text-gray-500">{doctor.email}</p>
                                    </div>
                                </div>
                                <div className="text-sm space-y-1 text-gray-600 flex-grow">
                                    <p><strong>Facility:</strong> {doctor.facility || 'N/A'}</p>
                                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                                    <p><strong>Fees:</strong> ₹{doctor.fees}</p>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                    <Button variant="secondary" className="text-xs px-3 py-1" onClick={() => openEditDoctorModal(doctor)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" className="text-xs px-3 py-1" onClick={() => handleDeleteUser(doctor.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                 <Card title="All Users Management">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-600">Name</th>
                                    <th className="p-3 font-semibold text-gray-600">Email</th>
                                    <th className="p-3 font-semibold text-gray-600">Role</th>
                                    <th className="p-3 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...admins, ...patients, ...doctors].map(user => (
                                    <tr key={user.id} className="border-b">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="border border-gray-300 rounded-md p-1 text-sm"
                                            >
                                                <option value={Role.Patient}>Patient</option>
                                                <option value={Role.Doctor}>Doctor</option>
                                                <option value={Role.Admin}>Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal 
                isOpen={isDoctorModalOpen} 
                onClose={() => setIsDoctorModalOpen(false)} 
                title={isEditing ? "Edit Doctor Details" : "Add New Doctor"}
            >
                <form onSubmit={handleSaveDoctor} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input name="name" value={doctorForm.name} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" value={doctorForm.email} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                {isEditing ? 'New Password (Optional)' : 'Password'}
                            </label>
                            <input 
                                name="password" 
                                type="password" 
                                value={doctorForm.password} 
                                onChange={handleDoctorFormChange} 
                                placeholder={isEditing ? "Leave blank to keep current" : ""}
                                required={!isEditing} 
                                className={inputClass} 
                            />
                        </div>

                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                            <input name="specialization" value={doctorForm.specialization} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input name="experience" type="number" value={doctorForm.experience} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Fees (₹)</label>
                            <input name="fees" type="number" value={doctorForm.fees} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Availability (e.g. 09:00 AM, 10:00 AM)</label>
                        <input name="availability" value={doctorForm.availability} onChange={handleDoctorFormChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Languages (e.g. English, Hindi)</label>
                        <input name="languages" value={doctorForm.languages} onChange={handleDoctorFormChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Consultation Modes</label>
                        <input name="consultationModes" value={doctorForm.consultationModes} onChange={handleDoctorFormChange} placeholder="Hospital Visit, Online Consult" required className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Facility</label>
                            <input name="facility" value={doctorForm.facility} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                            <input name="location" value={doctorForm.location} onChange={handleDoctorFormChange} required className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                        <input name="image" type="url" value={doctorForm.image} onChange={handleDoctorFormChange} className={inputClass} />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsDoctorModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : (isEditing ? 'Save Changes' : 'Add Doctor')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
