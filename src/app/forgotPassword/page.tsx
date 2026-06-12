import ForgotPassword from "@/app/forgotPassword/ForgotPassword/ForgotPassword";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="reset-container flex items-center justify-center">
      <ForgotPassword /> 
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