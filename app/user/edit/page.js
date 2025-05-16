"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/components/PageTemplate/PageTemplate";
import styles from "./page.module.css";

export default function EditUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    birth_date: "",
    locality: "",
    municipality: "",
  });

  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: "",
    old_password: "",
  });

  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    fetch("http://127.0.0.1:8000/api/users/profile/", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          username: data.username,
          email: data.email,
          birth_date: data.birth_date,
          locality: data.locality,
          municipality: data.municipality,
        });
      })
      .catch((err) => console.error("Error al obtener perfil:", err));
  }, [router]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Datos actualizados correctamente.");
      } else {
        alert("Error al actualizar los datos.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        }),
      });

      if (res.ok) {
        alert("Contraseña actualizada correctamente.");
        setPasswords({ new_password: "", confirm_password: "", old_password: "" });
      } else {
        alert("Error al actualizar la contraseña.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <PageTemplate>
      <div className={styles.container}>
        <h1 className={styles.title}>Editar perfil</h1>
        <form onSubmit={handleSave} className={styles.form}>
          <input name="username" value={form.username} onChange={handleFormChange} placeholder="Nombre de usuario" required className={styles.input} />
          <input name="email" value={form.email} onChange={handleFormChange} placeholder="Email" type="email" required className={styles.input} />
          <input name="birth_date" value={form.birth_date} onChange={handleFormChange} placeholder="Fecha de nacimiento" type="date" required className={styles.input} />
          <input name="locality" value={form.locality} onChange={handleFormChange} placeholder="Localidad" className={styles.input} />
          <input name="municipality" value={form.municipality} onChange={handleFormChange} placeholder="Municipio" className={styles.input} />
          <button type="submit" className={styles.button}>Guardar datos</button>
        </form>

        <h2 className={styles.subtitle}>Cambiar contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <input name="old_password" value={passwords.old_password} onChange={handlePasswordChange} type="password" placeholder="Contraseña actual" required className={styles.input} />
          <input name="new_password" value={passwords.new_password} onChange={handlePasswordChange} type="password" placeholder="Nueva contraseña" required className={styles.input} />
          <input name="confirm_password" value={passwords.confirm_password} onChange={handlePasswordChange} type="password" placeholder="Confirmar nueva contraseña" required className={styles.input} />
          <button type="submit" className={styles.button}>Actualizar contraseña</button>
        </form>
      </div>
    </PageTemplate>
  );
}
