"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("✅ Account created successfully! You can now sign in.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/ride");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setMessage("❌ Email is already in use. Try signing in.");
      } else if (error.code === "auth/user-not-found") {
        setMessage("❌ No account found. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect password. Try again.");
      } else {
        setMessage(`❌ ${error.message}`);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("❌ Enter your email to reset the password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setMessage("✅ Password reset email sent! Check your inbox.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setMessage("❌ No account found with this email.");
      } else {
        setMessage(`❌ ${error.message}`);
      }
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left Side - Background Image */}
      <div className="w-1/2 h-screen">
        <img src="/back.jpg" alt="Background" className="w-full h-full" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-10">
        <h1 className="text-4xl font-bold mb-6 text-black">{isSignUp ? "Sign Up" : "Sign In"}</h1>

        {message && (
          <p className={`mb-4 p-2 rounded ${message.startsWith("✅") ? "bg-green-300" : "bg-red-300"} text-black`}>
            {message}
          </p>
        )}

        <form onSubmit={handleAuth} className="w-80 bg-transparent p-6 rounded-lg">
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
            required
          />

          {isSignUp && (
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
              required
            />
          )}

          <button 
            type="submit"
            className="w-full bg-yellow-500 text-black p-3 rounded font-bold hover:bg-yellow-600 transition"
          >
            {isSignUp ? "Create Account" : "Login"}
          </button>
        </form>

        {!isSignUp && (
          <button 
            onClick={handleForgotPassword}
            className="mt-2 text-black underline font-semibold"
            disabled={resetSent}
          >
            Forgot Password?
          </button>
        )}

        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-black underline font-semibold">
          {isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"}
        </button>
      </div>
    </main>
  );
}
