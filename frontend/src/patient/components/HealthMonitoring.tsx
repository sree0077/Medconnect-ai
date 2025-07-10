import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Scale, TrendingUp, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HealthMonitoring: React.FC = () => {
  const bmiData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'BMI',
        data: [24.5, 24.2, 23.8, 23.5, 23.2, 22.8],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const checkupProgressData = {
    labels: ['Annual Physical', 'Dental', 'Eye Exam', 'Blood Work', 'Vaccination'],
    datasets: [
      {
        label: 'Completion Status',
        data: [100, 80, 60, 100, 40],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const healthAlerts = [
    {
      icon: <Scale className="text-blue-500" />,
      title: 'BMI Status',
      message: 'Within healthy range (22.8)',
      severity: 'low',
    },
    {
      icon: <Activity className="text-yellow-500" />,
      title: 'Upcoming Check-up',
      message: 'Annual physical due in 2 weeks',
      severity: 'moderate',
    },
    {
      icon: <AlertTriangle className="text-orange-500" />,
      title: 'Medication Reminder',
      message: 'Prescription refill needed',
      severity: 'high',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Monitoring</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Body Mass Index (BMI) Trends</h3>
            <Scale className="text-blue-500" />
          </div>
          <div className="h-64">
            <Line
              data={bmiData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `BMI: ${context.parsed.y}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 18,
                    max: 30,
                    title: {
                      display: true,
                      text: 'BMI Value',
                    },
                    ticks: {
                      callback: (value) => value.toFixed(1),
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-green-50 text-green-700 p-2 rounded">
              <div className="font-medium">Healthy</div>
              <div>18.5 - 24.9</div>
            </div>
            <div className="bg-yellow-50 text-yellow-700 p-2 rounded">
              <div className="font-medium">Overweight</div>
              <div>25.0 - 29.9</div>
            </div>
            <div className="bg-red-50 text-red-700 p-2 rounded">
              <div className="font-medium">Obese</div>
              <div>30.0+</div>
            </div>
          </div>
        </div>

        {/* Check-up Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Annual Check-up Progress</h3>
            <Activity className="text-green-500" />
          </div>
          <div className="h-64">
            <Bar
              data={checkupProgressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Health Alerts */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-4">Health Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'moderate'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  {alert.icon}
                  <h4 className="ml-2 font-medium text-gray-800">{alert.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoring;
