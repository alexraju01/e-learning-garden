import Footer from "@/components/Footer";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [login, setLogin] = useState(true);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full">
        {/* banner */}
        <div className="text-center">
          <h1 className="text-3xl">Welcome to Collabrium</h1>
          <p className="text-lg">Project Collaboration Space</p>
        </div>
        {/* Auth Container */}
        <div className="flex flex-col">
          {/* Login Section */}
          {login && <LoginComponent setLogin={() => setLogin(false)} />}

          {/* Register Section */}
          {!login && <RegisterComponent />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

interface RegisterForm {
  displayname: string;
  email: string;
  password: string;
}

function RegisterComponent() {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function Register() {
    console.log(`register ${username} ${email} ${password} button`);
    const detials = {
      displayname: username,
      email: email,
      password: password,
    } as RegisterForm;
    const response = await fetch("http://localhost:3001/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detials),
    });
    if (!response || response.status != 200) {
      console.log("failed");
      return;
    }
  }

  return (
    <div>
      <h2 className="text-center">Register</h2>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUserName(e.currentTarget.value)}
          placeholder="Username"
          className="w-full border border-gray"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email"
          className="w-full border border-gray"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          className="w-full border border-gray"
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={Register}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

interface LoginForm {
  email: string;
  password: string;
}

function LoginComponent({ setLogin }: { setLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function Login() {
    console.log(`login ${email} ${password} button`);
    const detials = {
      email: email,
      password: password,
    } as LoginForm;
    const response = await fetch("http://localhost:3001/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detials),
    });
    if (!response || response.status != 200) {
      console.log("failed");
      return;
    }
  }

  return (
    <div>
      <h2 className="bold">Login</h2>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email"
          className="w-full border border-gray"
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          className="w-full border border-gray"
        />
        <button className="w-full border bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </button>
      </div>

      {/* Forgot Password */}
      <div>
        <a href="#">Forgot your password?</a>
      </div>
      <button
        className="w-full border bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={setLogin}
      >
        sign up
      </button>
    </div>
  );
}
