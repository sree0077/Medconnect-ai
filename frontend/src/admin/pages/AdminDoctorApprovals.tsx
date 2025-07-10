import React, { useEffect, useState } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { Check, X, Eye, Clock, UserCheck, AlertCircle } from 'lucide-react';
import api from '../../shared/services/api';
import useNotifications from '../../shared/hooks/useNotifications';
import { AdminSkeletonStatCard, SkeletonTable, SkeletonText } from '../../shared/components/skeleton';

const columns = [
	{ key: 'name', header: 'Doctor Name', sortable: true },
	{ key: 'email', header: 'Email', sortable: true },
	{ key: 'specialization', header: 'Specialization', sortable: true },
	{ key: 'experience', header: 'Experience', sortable: true },
	{ key: 'license', header: 'License', sortable: false },
	{ key: 'submittedDate', header: 'Submitted', sortable: true },
	{ key: 'status', header: 'Status', sortable: true },
];

export const AdminDoctorApprovals: React.FC = () => {
	const [doctors, setDoctors] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { refreshNotifications } = useNotifications();

	// Fetch doctors on mount
	useEffect(() => {
		const fetchDoctors = async () => {
			setIsLoading(true);
			try {
				// Check if token exists in localStorage for debugging
				const token = localStorage.getItem('token');
				console.log('Auth token available:', !!token);
				if (!token) {
					console.warn('No authentication token available - login required');
				}
				
				// Log headers for debugging
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': token ? `Bearer ${token}` : ''
				};
				console.log('Request headers:', headers);
				
				// First try the authenticated endpoint
				let res;
				try {
					// Using the main authenticated endpoint with correct path
					res = await api.get('/api/users/doctors');
					console.log('Successfully fetched doctors with authentication');
				} catch (authError: any) {
					console.error('Auth request failed:', authError.response?.status, authError.message);
					
					// If auth fails in development, try the debug endpoint
					if (import.meta.env.DEV) {
						console.warn('Authenticated request failed, trying debug endpoint');
						res = await api.get('/api/users/doctors-debug');
					} else {
						throw authError;
					}
				}
				console.log('API response doctors:', res.data);

				// Format data to match the expected structure
				const formattedDoctors = res.data.map((doctor: any) => ({
					...doctor,
					// Use createdAt as submittedDate, format it
					submittedDate: doctor.createdAt
						? new Date(doctor.createdAt).toLocaleDateString()
						: 'Unknown',
					// Add placeholder for license if it doesn't exist
					license: doctor.license || 'Not provided',
					// Ensure we have the _id field for updating
					_id: doctor._id,
				}));

				setDoctors(formattedDoctors);
			} catch (err: any) {
				console.error('Error fetching doctors:', err);
				console.error('Error details:', err.response?.data || err.message);
				
				// Handle 401 specifically to guide the user
				if (err.response?.status === 401) {
					console.warn('Authentication error - Please log in as an admin user');
				}
			} finally {
				setIsLoading(false);
			}
		};
		fetchDoctors();
	}, []);

	// Approve/Reject logic
	const handleStatusChange = async (id: string, status: string) => {
		try {
			// Log the data we're sending to help debug
			console.log(`Updating doctor ${id} with status: ${status}`);

			// Send the update to the backend
			await api.put(`/api/users/${id}`, { status });

			// Update local state so the UI reflects the change
			setDoctors((prev) => prev.map((doc) => (doc._id === id ? { ...doc, status } : doc)));

			// Refresh notifications immediately to show the status change notification
			refreshNotifications();
		} catch (err) {
			console.error('Failed to update doctor status:', err);
		}
	};

	const getStatusBadge = (status: string) => {
		const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
		switch (status) {
			case 'pending':
			case 'Pending':
				return (
					<span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
						<Clock className="h-3 w-3 mr-1" />
						Pending
					</span>
				);
			case 'under review':
			case 'Under Review':
				return (
					<span className={`${baseClasses} bg-purple-100 text-purple-800`}>
						<Eye className="h-3 w-3 mr-1" />
						Under Review
					</span>
				);
			case 'documents required':
			case 'Documents Required':
				return (
					<span className={`${baseClasses} bg-red-100 text-red-800`}>
						<AlertCircle className="h-3 w-3 mr-1" />
						Docs Required
					</span>
				);
			case 'active':
				return (
					<span className={`${baseClasses} bg-green-100 text-green-800`}>
						<UserCheck className="h-3 w-3 mr-1" />
						Approved
					</span>
				);
			case 'inactive':
				return (
					<span className={`${baseClasses} bg-gray-100 text-gray-800`}>
						<X className="h-3 w-3 mr-1" />
						Rejected
					</span>
				);
			default:
				return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
		}
	};

	const enhancedData = doctors.map((doctor) => ({
		...doctor,
		status: getStatusBadge(doctor.status),
	}));

	const actions = (row: any) => (
		<div className="flex items-center space-x-2">
			<button
				className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
				title="View Details"
				onClick={() => {
					/* Optionally show modal with details */
				}}
			>
				<Eye className="h-4 w-4" />
			</button>
			<button
				className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
				title="Approve"
				onClick={() => handleStatusChange(row._id, 'active')}
				disabled={row.status === 'active'}
			>
				<Check className="h-4 w-4" />
			</button>
			<button
				className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
				title="Reject"
				onClick={() => handleStatusChange(row._id, 'inactive')}
				disabled={row.status === 'inactive'}
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Doctor Approvals
					</h1>
					<p className="text-gray-600 mt-2">Review and approve doctor registration requests</p>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
							<Clock className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600">Pending Review</p>
							<p className="text-2xl font-bold text-gray-900">
								{doctors.filter(
									(d) => d.status === 'pending' || d.status === 'Pending'
								).length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
							<Eye className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600">Under Review</p>
							<p className="text-2xl font-bold text-gray-900">
								{doctors.filter(
									(d) => d.status === 'under review' || d.status === 'Under Review'
								).length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
							<AlertCircle className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600">Docs Required</p>
							<p className="text-2xl font-bold text-gray-900">
								{doctors.filter(
									(d) => d.status === 'documents required' || d.status === 'Documents Required'
								).length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
							<UserCheck className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600">Approved</p>
							<p className="text-2xl font-bold text-gray-900">
								{doctors.filter(d => d.status === 'active').length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
				<div className="flex flex-wrap gap-3">
					<button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
						<Check className="h-4 w-4 mr-2" />
						Bulk Approve Selected
					</button>
					<button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
						<Eye className="h-4 w-4 mr-2" />
						Review Next in Queue
					</button>
					<button className="inline-flex items-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
						Export Pending List
					</button>
				</div>
			</div>

			{/* Data Table */}
			{isLoading ? (
				<div className="space-y-6">
					{/* Header */}
					<div className="mb-8">
						<SkeletonText variant="h1" width="300px" className="mb-2" />
						<SkeletonText variant="body" width="400px" />
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{Array.from({ length: 4 }).map((_, index) => (
							<AdminSkeletonStatCard key={`stat-${index}`} />
						))}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<SkeletonText key={`action-${index}`} variant="body" width="150px" height="40px" />
						))}
					</div>

					{/* Data Table */}
					<SkeletonTable
						rows={8}
						columns={7}
						withHeader={true}
						withActions={true}
						columnWidths={['2fr', '2fr', '1.5fr', '1fr', '1fr', '1fr', '1fr', '150px']}
					/>
				</div>
			) : (
				<AdminDataTable
					columns={columns}
					data={enhancedData}
					actions={actions}
					searchable={true}
					filterable={true}
					pagination={true}
				/>
			)}
		</div>
	);
};