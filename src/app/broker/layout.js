import DashLayout from '@/components/DashLayout/DashLayout';

export const metadata = {
  title: 'Broker Portal | Dealio Marketplace',
  description: 'Manage client listings and inquiries.',
};

export default function BrokerLayout({ children }) {
  return <DashLayout role="broker">{children}</DashLayout>;
}
