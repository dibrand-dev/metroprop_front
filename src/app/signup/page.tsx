import UserSignup from "@/app/signup/UserSignup/UserSignup";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="merged-signup-container">
      {/* Left Panel */}
      <div className="merged-signup-left-panel">
        <UserSignup />
      </div>
      <div className="signup-right-panel">
        <Image
          src="/images/Inicio-sesion.png"
          alt="Hero"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
