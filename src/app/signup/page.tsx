import UserSignup from "@/app/signup/UserSignup/UserSignup";

export default function SignupPage() {
  return (
    <div className="merged-signup-container">
      {/* Left Panel */}
      <div className="merged-signup-left-panel">
        <UserSignup />
      </div>
    </div>
  );
}
