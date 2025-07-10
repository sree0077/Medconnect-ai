import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../shared/hooks/useNotifications";
import { Calendar, Clock, User, Stethoscope, ChevronDown, Check } from 'lucide-react';
import { PatientLayout } from '../layouts/PatientLayout';
import { PatientButton } from '../components/PatientButton';
import { SkeletonForm } from '../../shared/components/skeleton';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifications();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "consultation"
  });
  
  // Time slots for visual selection
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];
  
  // Appointment types with colors
  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', color: 'bg-blue-500' },
    { value: 'follow-up', label: 'Follow-up', color: 'bg-green-500' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-500' },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/doctors`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoctors(res.data);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    setError("");
  };
  
  // Standard input handler for form elements (kept for compatibility)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
  
  // Convert 12-hour time format to 24-hour format for backend
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // If using time slots UI, convert to 24-hour format
    const submissionForm = {...form};
    if (submissionForm.time && submissionForm.time.includes('AM') || submissionForm.time.includes('PM')) {
      submissionForm.time = convertTo24Hour(submissionForm.time);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/book`,
        submissionForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Find the selected doctor's name for the notification
      const selectedDoctor = doctors.find(doc => doc._id === form.doctorId);
      const doctorName = selectedDoctor?.name || "Doctor";

      // Show success notification
      notifySuccess(
        "Appointment Booked Successfully!",
        `Your appointment with Dr. ${doctorName} has been scheduled for ${form.date} at ${form.time}.`
      );

      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to book appointment";
      setError(errorMessage);
      notifyError("Booking Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setForm({
      doctorId: "",
      date: "",
      time: "",
      type: "consultation"
    });
    setError("");
  };

  if (loading) {
    return (
      <PatientLayout>
        <SkeletonForm
          fields={6}
          withTitle={true}
          withSubtitle={true}
          layout="vertical"
          className="max-w-2xl mx-auto"
        />
      </PatientLayout>
    );
  }
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule your visit with our specialists</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="max-w-4xl mx-auto">

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
                <div className="flex items-center justify-center text-red-700">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      <User className="w-4 h-4 inline mr-2 text-purple-600" />
                      Select Doctor
                    </label>
                    <div className="relative">
                      <select
                        name="doctorId"
                        value={form.doctorId}
                        onChange={handleChange}
                        className="w-full glass-input rounded-xl px-4 py-4 text-gray-700 placeholder-gray-500 outline-none appearance-none pr-10"
                        required
                      >
                        <option value="" className="bg-white text-gray-700">Choose a doctor...</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id} className="bg-white text-gray-700">
                            {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      <Calendar className="w-4 h-4 inline mr-2 text-purple-600" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.date}
                      onChange={handleChange}
                      className="w-full glass-input rounded-xl px-4 py-4 text-gray-700 placeholder-gray-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Time Selection */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      <Clock className="w-4 h-4 inline mr-2 text-purple-600" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleInputChange('time', time)}
                          className={`p-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                            form.time === time
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'glass-input text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Type - Full Width */}
              <div className="mt-8">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Type of Appointment
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {appointmentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('type', type.value)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 flex items-center ${
                        form.type === type.value
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'glass-input text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${type.color} mr-3`}></div>
                      <span className="font-medium">{type.label}</span>
                      {form.type === type.value && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-8 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 glass-input rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}