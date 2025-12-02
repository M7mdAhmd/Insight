import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const messages = ["Research", "Connect", "Lead"];

const TypingAnimation = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;

    const currentMessage = messages[messageIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        if (charIndex + 1 === currentMessage.length) setPause(true);
        else setCharIndex(charIndex + 1);
      } else {
        setDisplayedText(currentMessage.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setDeleting(false);
          setMessageIndex((messageIndex + 1) % messages.length);
        } else setCharIndex(charIndex - 1);
      }
    }, deleting ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, messageIndex, pause]);

  useEffect(() => {
    if (pause) {
      const timeout = setTimeout(() => {
        setDeleting(true);
        setPause(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [pause]);

  return (
    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
      {displayedText}
      <span className="animate-pulse">|</span>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: "bg-green-50 border-green-500",
      icon: <CheckCircle className="text-green-500" size={24} />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: <XCircle className="text-red-500" size={24} />,
      text: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: <AlertCircle className="text-yellow-500" size={24} />,
      text: "text-yellow-800",
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${style.bg} border-l-4 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1">
          <p className={`${style.text} font-medium text-sm`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(false);
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupAffiliation, setSignupAffiliation] = useState("");
  const [signupSpecialization, setSignupSpecialization] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  // عند تحميل الصفحة، نفحص إذا في بيانات محفوظة مسبقًا
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      setLoginEmail(rememberedEmail);
      setLoginPassword(rememberedPassword);
      setLoginRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      showToast("Please enter both email and password", "error");
      return;
    }

    if (!loginEmail.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // حفظ البريد وكلمة المرور إذا تم تفعيل Remember Me
      if (loginRemember) {
        localStorage.setItem("rememberedEmail", loginEmail);
        localStorage.setItem("rememberedPassword", loginPassword);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      showToast("Login successful! Redirecting...", "success");

      navigate("/");
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPassword || !signupAffiliation || !signupSpecialization) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!signupEmail.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (signupPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          affiliation: signupAffiliation,
          specialization: signupSpecialization
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showToast("Account created successfully! Redirecting...", "success");

      setTimeout(() => {
        setIsLogin(true);
      }, 1500);
    } catch (err) {
      showToast(err.message || "Signup failed", "error");
    }
  };
  
  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side */}
        <div
          className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-cover bg-center relative min-h-[300px] lg:min-h-screen"
          style={{ backgroundImage: "url('/loginBack.png')" }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center"><TypingAnimation /></div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {isLogin ? (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Welcome Back</h2>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={loginShowPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-12 p-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    >
                      {loginShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginRemember}
                    onChange={(e) => setLoginRemember(e.target.checked)}
                    className="mr-2 w-4 h-4 accent-indigo-600"
                    id="remember"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md hover:shadow-lg active:scale-95"
                >
                  Login
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-indigo-600 hover:underline font-medium transition-all"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Sign Up</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full h-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full h-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="Email"
                  />
                </div>

                <div className="relative">
                  <input
                    type={signupShowPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full h-12 p-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setSignupShowPassword(!signupShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  >
                    {signupShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={signupAffiliation}
                    onChange={(e) => setSignupAffiliation(e.target.value)}
                    className="w-full h-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="Affiliation"
                  />
                  <input
                    type="text"
                    value={signupSpecialization}
                    onChange={(e) => setSignupSpecialization(e.target.value)}
                    className="w-full h-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="Specialization"
                  />
                </div>

                <button
                  onClick={handleSignup}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md hover:shadow-lg active:scale-95"
                >
                  Sign Up
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-indigo-600 hover:underline font-medium transition-all"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
