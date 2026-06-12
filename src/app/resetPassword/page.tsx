import ResetPassword from "@/app/resetPassword/ResetPassword/ResetPassword";
import Image from "next/image";

export default function ResetPasswordPage() {
  return (
    <div className="reset-container flex items-center justify-center">
      <ResetPassword /> 
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
