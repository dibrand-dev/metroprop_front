import Home from '@/components/Home/Home';
import Footer from '@/layout/User/Footer/Footer';
import Header from '@/layout/User/Header/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop",
  description: "Metroprop application",
};

export default function Page() {
  return <>
    <Header />
    <Home />
    <Footer />
  </>;
}
