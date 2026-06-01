import Header from '@/layout/User/Header/Header';
import Alerts from "./Alerts/Alerts";
import { Suspense } from "react";

export default function AlertsPage() {
  return <>
      <Header />
      <Suspense fallback={null}>
        <Alerts />
      </Suspense>
    </>;
}
