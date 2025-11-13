import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Appointment, AppointmentStatus } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { API_BASE_URL } from '../constants';

const DoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return
      };
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/appointments/doctor/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(response.ok) {
          const data = await response.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [user, token]);

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setAppointments(prev =>
          prev.map(apt => (apt.id === appointmentId ? { ...apt, status } : apt))
        );
      } else {
        console.error("Failed to update appointment status");
        // Optionally, show an error to the user
      }
    } catch (error) {
      console.error("Error updating appointment status", error);
    }
  };
  
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Confirmed: return 'bg-green-100 text-green-800';
      case AppointmentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.Completed: return 'bg-gray-100 text-gray-800';
      case AppointmentStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card title="Your Appointments">
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Patient</th>
                  <th className="p-3 font-semibold text-gray-600">Date & Time</th>
                  <th className="p-3 font-semibold text-gray-600">Reason</th>
                  <th className="p-3 font-semibold text-gray-600 text-center">Status</th>
                  <th className="p-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(apt => (
                  <tr key={apt.id} className="border-b">
                    <td className="p-3">{apt.patientName}</td>
                    <td className="p-3">{apt.date} at {apt.time}</td>
                    <td className="p-3 max-w-xs truncate">{apt.reason}</td>
                    <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                            {apt.status}
                        </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        {apt.status === AppointmentStatus.Pending && (
                          <Button 
                            variant="success" 
                            onClick={() => updateAppointmentStatus(apt.id, AppointmentStatus.Confirmed)}
                            className="text-xs px-2 py-1">
                            Confirm
                          </Button>
                        )}
                        {apt.status === AppointmentStatus.Confirmed && (
                           <Button 
                            variant="primary" 
                            onClick={() => updateAppointmentStatus(apt.id, AppointmentStatus.Completed)}
                            className="text-xs px-2 py-1">
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">You have no upcoming appointments.</p>
        )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;
