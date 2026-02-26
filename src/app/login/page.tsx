import UserSignin from "@/app/login/Login/UserSignin";

export const metadata = {
  title: 'Iniciar sesión - Metroprop',
  description: 'Inicia sesión en tu cuenta de Metroprop',
};

export default function SigninPage() {
  return (
    <div className="signin-container">
      {/* Left Panel */}
      <div className="signin-left-panel">
        <UserSignin /> 
      </div>
    </div>
  );
}
