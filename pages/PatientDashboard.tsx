import React, { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL, DOCTOR_PLACEHOLDER_IMAGE } from '../constants';
import { Doctor, Appointment, AppointmentStatus } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { getHealthSuggestion } from '../services/geminiService';
import Spinner from '../components/common/Spinner';

const filterOptions = {
  consultationModes: ['Hospital Visit', 'Online Consult'],
  experience: ['0-5', '6-10', '11-16', '16+'],
  fees: ['0-500', '501-1000', '1000+'],
  gender: ['Male', 'Female'],
  languages: ['English', 'Hindi', 'Telugu', 'Kannada'],
  facility: ['Apollo Hospital', 'Other Clinics']
};

interface PatientDashboardProps {
  onLoginRequired?: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onLoginRequired }) => {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isAssistantModalOpen, setAssistantModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Booking form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  // AI Assistant state
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<{[key: string]: string[]}>({
    consultationModes: [],
    experience: [],
    fees: [],
    gender: [],
    languages: [],
    facility: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctors (public endpoint)
        const doctorsRes = await fetch(`${API_BASE_URL}/api/doctors`);
        
        if (doctorsRes.ok) {
            const doctorsData = await doctorsRes.json();
            setDoctors(doctorsData);
        } else {
            console.error("Failed to fetch doctors");
            setDoctors([]);
        }
        
        // Only fetch appointments if logged in
        if (token) {
          const appointmentsRes = await fetch(`${API_BASE_URL}/api/appointments`, { 
              headers: { 'Authorization': `Bearer ${token}` }
           });
           if (appointmentsRes.ok) {
            const appointmentsData = await appointmentsRes.json();
            setAppointments(appointmentsData);
          } else {
            console.error("Failed to fetch appointments");
            setAppointments([]);
          }
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleFilterChange = (category: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      consultationModes: [], experience: [], fees: [], gender: [], languages: [], facility: [],
    });
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const { consultationModes, experience, fees, gender, languages, facility } = filters;
      
      if (consultationModes.length > 0 && !consultationModes.some(mode => doctor.consultationModes.includes(mode as any))) return false;
      if (gender.length > 0 && !gender.includes(doctor.gender)) return false;
      
      // Fixed logic: Use OR condition (some) instead of restrictive AND
      if (facility.length > 0) {
        const isApollo = doctor.facility === 'Apollo Hospital';
        const matches = facility.some(f => {
          if (f === 'Apollo Hospital') return isApollo;
          if (f === 'Other Clinics') return !isApollo;
          return false;
        });
        if (!matches) return false;
      }

      if (languages.length > 0 && !languages.some(lang => doctor.languages.includes(lang))) return false;
      
      if (experience.length > 0) {
        const match = experience.some(range => {
          if (range === '0-5') return doctor.experience >= 0 && doctor.experience <= 5;
          if (range === '6-10') return doctor.experience >= 6 && doctor.experience <= 10;
          if (range === '11-16') return doctor.experience >= 11 && doctor.experience <= 16;
          if (range === '16+') return doctor.experience > 16;
          return false;
        });
        if (!match) return false;
      }
      
      if (fees.length > 0) {
        const match = fees.some(range => {
          if (range === '0-500') return doctor.fees >= 0 && doctor.fees <= 500;
          if (range === '501-1000') return doctor.fees >= 501 && doctor.fees <= 1000;
          if (range === '1000+') return doctor.fees > 1000;
          return false;
        });
        if (!match) return false;
      }
      
      return true;
    });
  }, [doctors, filters]);


  const openBookingModal = (doctor: Doctor) => {
    if (!user && onLoginRequired) {
      onLoginRequired();
      return;
    }
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedDoctor(null);
    setDate('');
    setTime('');
    setReason('');
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !user || !token) return;
    
    const appointmentData = {
      patientId: user.id,
      doctorId: selectedDoctor.id,
      date,
      time,
      reason,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData),
      });
      if(response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
        closeBookingModal();
      } else {
        // Handle error
        console.error("Failed to book appointment");
      }
    } catch(error) {
      console.error("Error booking appointment", error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(response.ok) {
         setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: AppointmentStatus.Cancelled } : apt
        ));
      } else {
        console.error("Failed to cancel appointment");
      }
    } catch(error) {
      console.error("Error cancelling appointment", error);
    }
  };
  
  const handleGetSuggestion = async () => {
    if (!symptoms) return;
    setIsLoadingSuggestion(true);
    setSuggestion('');
    const result = await getHealthSuggestion(symptoms);
    setSuggestion(result);
    setIsLoadingSuggestion(false);
  };
  
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Confirmed: return 'text-success';
      case AppointmentStatus.Pending: return 'text-yellow-500';
      case AppointmentStatus.Completed: return 'text-secondary';
      case AppointmentStatus.Cancelled: return 'text-danger';
      default: return 'text-gray-500';
    }
  };

  const FilterSection: React.FC<{title: string; options: string[]; category: string}> = ({ title, options, category }) => (
    <div className="py-4 border-b">
      <h4 className="font-semibold mb-2 text-dark">{title}</h4>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-primary focus:ring-primary"
              checked={filters[category].includes(option)}
              onChange={() => handleFilterChange(category, option)}
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-dark">AI Health Assistant</h2>
            <p className="text-gray-600 mt-1">Not sure which doctor to see? Describe your symptoms to our AI assistant.</p>
          </div>
          <Button onClick={() => setAssistantModalOpen(true)}>
            Ask AI Assistant
          </Button>
        </div>
      </Card>
      
      {/* Only show appointments if user is logged in */}
      {user && (
        <Card title="My Appointments">
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600">Doctor</th>
                    <th className="p-3 font-semibold text-gray-600">Date & Time</th>
                    <th className="p-3 font-semibold text-gray-600">Status</th>
                    <th className="p-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(apt => (
                    <tr key={apt.id} className="border-b">
                      <td className="p-3">{apt.doctorName} <span className="text-sm text-gray-500">({apt.doctorSpecialization})</span></td>
                      <td className="p-3">{apt.date} at {apt.time}</td>
                      <td className={`p-3 font-semibold ${getStatusColor(apt.status)}`}>{apt.status}</td>
                      <td className="p-3">
                        {apt.status === AppointmentStatus.Pending && (
                          <Button variant="danger" onClick={() => cancelAppointment(apt.id)} className="text-xs px-2 py-1">Cancel</Button>
                        )}
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
      )}
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <Card className="!p-0">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-dark">Filters</h3>
              <button onClick={clearFilters} className="text-sm font-semibold text-primary hover:text-primary-hover">Clear All</button>
            </div>
            <div className="p-4">
              <FilterSection title="Mode of Consult" options={filterOptions.consultationModes} category="consultationModes" />
              <FilterSection title="Experience (In Years)" options={filterOptions.experience} category="experience" />
              <FilterSection title="Fees (In Rupees)" options={filterOptions.fees} category="fees" />
              <FilterSection title="Gender" options={filterOptions.gender} category="gender" />
              <FilterSection title="Language" options={filterOptions.languages} category="languages" />
              <FilterSection title="Facility" options={filterOptions.facility} category="facility" />
            </div>
          </Card>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-dark">Find Doctors</h2>
            {filteredDoctors.length > 0 ? filteredDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <img src={doctor.image || DOCTOR_PLACEHOLDER_IMAGE} alt={doctor.name} className="w-20 h-20 rounded-full object-cover bg-gray-200" />
                  <div>
                    <h4 className="text-lg font-bold text-primary">{doctor.name}</h4>
                    <p className="text-md text-gray-700">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500 mt-2">{doctor.experience} YEARS EXPERIENCE</p>
                    <p className="text-sm text-gray-500">{doctor.languages.join(', ')}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">{doctor.facility}, {doctor.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-stretch sm:items-end justify-between h-full w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0">
                  <p className="font-bold text-lg text-right">₹{doctor.fees}</p>
                  <Button onClick={() => openBookingModal(doctor)} className="mt-2 w-full">
                    Book Appointment
                  </Button>
                  <p className="text-xs text-green-600 mt-1 text-right">Available Today</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">No doctors match the selected filters.</p>
            )}
          </div>
        </main>
      </div>
      
      {/* Only render booking modal if user is logged in (double check for safety, though openBookingModal handles it) */}
      {selectedDoctor && user && (
        <Modal isOpen={isBookingModalOpen} onClose={closeBookingModal} title={`Book Appointment with ${selectedDoctor.name}`}>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select a time</option>
                {selectedDoctor.availability.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={closeBookingModal}>Cancel</Button>
              <Button type="submit">Confirm Booking</Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal isOpen={isAssistantModalOpen} onClose={() => setAssistantModalOpen(false)} title="AI Health Assistant">
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Describe your symptoms</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4} placeholder="e.g., I have a persistent cough and headache..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
             <Button onClick={handleGetSuggestion} disabled={isLoadingSuggestion || !symptoms} className="w-full flex justify-center">
                {isLoadingSuggestion ? <Spinner/> : 'Get Suggestion'}
             </Button>
             {suggestion && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-semibold text-blue-800">AI Suggestion:</h4>
                    <div className="prose prose-sm max-w-none mt-2 text-gray-700" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n/g, '<br />') }} />
                </div>
             )}
        </div>
      </Modal>

    </div>
  );
};

export default PatientDashboard;