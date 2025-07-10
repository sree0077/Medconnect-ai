// Base skeleton components
export { SkeletonBase } from './SkeletonBase';
export { SkeletonText } from './SkeletonText';
export { SkeletonButton } from './SkeletonButton';
export { SkeletonInput } from './SkeletonInput';
export { SkeletonCard } from './SkeletonCard';
export { SkeletonTable } from './SkeletonTable';
export { SkeletonAvatar } from './SkeletonAvatar';
export { SkeletonIcon } from './SkeletonIcon';

// Dashboard-specific skeleton components
export { DoctorSkeletonStatCard } from './DoctorSkeletonStatCard';
export { PatientSkeletonStatCard } from './PatientSkeletonStatCard';
export { AdminSkeletonStatCard } from './AdminSkeletonStatCard';

// Layout skeleton components
export { SkeletonSidebar } from './SkeletonSidebar';
export { SkeletonHeader } from './SkeletonHeader';
export { SkeletonDashboard } from './SkeletonDashboard';
export { SkeletonLayout } from './SkeletonLayout';

// Complex skeleton components
export { SkeletonForm } from './SkeletonForm';
export { SkeletonList } from './SkeletonList';
export { SkeletonNotification } from './SkeletonNotification';
export { SkeletonChart } from './SkeletonChart';
export { SkeletonChat } from './SkeletonChat';

// Import all components for default export
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';
import { SkeletonButton } from './SkeletonButton';
import { SkeletonInput } from './SkeletonInput';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonTable } from './SkeletonTable';
import { SkeletonAvatar } from './SkeletonAvatar';
import { SkeletonIcon } from './SkeletonIcon';
import { SkeletonForm } from './SkeletonForm';
import { SkeletonList } from './SkeletonList';
import { SkeletonSidebar } from './SkeletonSidebar';
import { SkeletonHeader } from './SkeletonHeader';
import { SkeletonDashboard } from './SkeletonDashboard';
import { SkeletonLayout } from './SkeletonLayout';
import { SkeletonNotification } from './SkeletonNotification';
import { SkeletonChart } from './SkeletonChart';
import { SkeletonChat } from './SkeletonChat';
import { DoctorSkeletonStatCard } from './DoctorSkeletonStatCard';
import { PatientSkeletonStatCard } from './PatientSkeletonStatCard';
import { AdminSkeletonStatCard } from './AdminSkeletonStatCard';

// Default exports for convenience
export default {
  Base: SkeletonBase,
  Text: SkeletonText,
  Button: SkeletonButton,
  Input: SkeletonInput,
  Card: SkeletonCard,
  Table: SkeletonTable,
  Avatar: SkeletonAvatar,
  Icon: SkeletonIcon,
  Form: SkeletonForm,
  List: SkeletonList,
  Sidebar: SkeletonSidebar,
  Header: SkeletonHeader,
  Dashboard: SkeletonDashboard,
  Layout: SkeletonLayout,
  Notification: SkeletonNotification,
  Chart: SkeletonChart,
  Chat: SkeletonChat,
  DoctorStatCard: DoctorSkeletonStatCard,
  PatientStatCard: PatientSkeletonStatCard,
  AdminStatCard: AdminSkeletonStatCard,
};
