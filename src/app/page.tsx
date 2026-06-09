import Home from '@/components/Home/Home';
import Footer from '@/layout/Footer/Footer';
import Header from '@/layout/Header/Header';
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
