import Header from '@/layout/Header/Header';
import Alerts from "./Alerts/Alerts";
import { Suspense } from "react";

export default function AlertsPage() {
  return <>
      <Suspense fallback={null}>
        <Alerts />
      </Suspense>
    </>;
}
