import DashLayout from '@/components/DashLayout/DashLayout';

export default function AdminLayout({ children }) {
  return <DashLayout role="admin">{children}</DashLayout>;
}
