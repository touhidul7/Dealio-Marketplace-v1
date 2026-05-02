import DashLayout from '@/components/DashLayout/DashLayout';

export const metadata = {
  title: 'Advisor Portal | Dealio Marketplace',
  description: 'Manage assigned leads and service requests.',
};

export default function AdvisorLayout({ children }) {
  return <DashLayout role="advisor">{children}</DashLayout>;
}
