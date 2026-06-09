import Home from '@/components/Home/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop",
  description: "Metroprop application",
};

export default function Page() {
    return <Home />;
}
