import ResetPassword from "@/app/resetPassword/ResetPassword/ResetPassword";
import Image from "next/image";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="reset-container flex items-center justify-center">
      <Suspense fallback={null}>
        <ResetPassword /> 
      </Suspense>
      <Image
        src="/images/Inicio-sesion.png"
        alt="Hero"
        fill
        priority
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
