"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InitTemplate from "@/components/InitTemplate/InitTemplate";
import styles from "./page.module.css";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    municipality: "",
    locality: ""
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const registerRes = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!registerRes.ok) {
        const errorRes = await registerRes.json();
        throw new Error(JSON.stringify(errorRes));
      }

      const loginRes = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.access) throw new Error("Error al iniciar sesión");

      localStorage.setItem("access", loginData.access);
      localStorage.setItem("username", userData.username);
      router.push("/auctions");

    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo completar el registro.");
    }
  };

  return (
    <InitTemplate>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Registro</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="text" name="username" placeholder="Nombre de usuario" value={userData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" value={userData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={userData.password} onChange={handleChange} required />
          <input type="text" name="first_name" placeholder="Nombre" value={userData.first_name} onChange={handleChange} required />
          <input type="text" name="last_name" placeholder="Apellidos" value={userData.last_name} onChange={handleChange} required />
          <input type="date" name="birth_date" value={userData.birth_date} onChange={handleChange} required />
          <input type="text" name="municipality" placeholder="Municipio (opcional)" value={userData.municipality} onChange={handleChange} />
          <input type="text" name="locality" placeholder="Localidad (opcional)" value={userData.locality} onChange={handleChange} />
          <button type="submit" className={styles.button}>Registrarse</button>
        </form>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <p className={styles.loginRedirect}>
          ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </InitTemplate>
  );
}
