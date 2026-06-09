import AdminLayoutClient from './AdminLayoutClient';
import './layout.scss';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
