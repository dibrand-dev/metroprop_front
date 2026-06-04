import Footer from '@/layout/User/Footer/Footer';
import Header from '@/layout/User/Header/Header';
import MyProperties from './myProperties/MyProperties';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop",
  description: "Mis publicaciones | MetroProp",
};

export default function Page() {
  return <>
    <Header />
    <MyProperties />
  </>;
}
