"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InitTemplate from "@/components/InitTemplate/InitTemplate";
import styles from "./page.module.css";

export default function CreateAuctionPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    closing_date: "",
    thumbnail: "",
    price: "",
    stock: "",
    rating: "",
    category: "",
    brand: ""
  });

  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      router.push("/login");
    } else {
      setToken(access);
    }

    // Obtener categorías
    fetch("http://127.0.0.1:8000/api/auctions/categories/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.results)) {
          setCategories(data.results);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else {
          throw new Error("Formato inesperado de categorías");
        }
      })
      .catch((err) => console.error("Error cargando categorías", err));

    // Obtener ID del usuario autenticado
    fetch("http://127.0.0.1:8000/api/users/profile/", {
      headers: {
        Authorization: `Bearer ${access}`
      }
    })
      .then((res) => res.json())
      .then((data) => setUserId(data.id))
      .catch((err) => console.error("Error obteniendo perfil de usuario:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalForm = {
      ...form,
      auctioneer: userId, // ← añadir subastador
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      rating: parseFloat(form.rating),
      category: parseInt(form.category),
      closing_date: form.closing_date.includes("Z")
        ? form.closing_date
        : `${form.closing_date}:00Z`
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auctions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(finalForm)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Error detallado del backend:", err);
        alert("Error al crear subasta: " + JSON.stringify(err));
        return;
      }

      alert("Subasta creada con éxito!");
      router.push("/auctions");
    } catch (err) {
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <InitTemplate>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Crear Nueva Subasta</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {[
            { label: "Título", name: "title" },
            { label: "Descripción", name: "description" },
            { label: "Imagen (URL)", name: "thumbnail" },
            { label: "Precio", name: "price", type: "number" },
            { label: "Stock", name: "stock", type: "number" },
            { label: "Valoración (1-5)", name: "rating", type: "number" },
            { label: "Marca", name: "brand" },
            { label: "Fecha de cierre", name: "closing_date", type: "datetime-local" }
          ].map(({ label, name, type = "text" }) => (
            <div key={name} className={styles.formGroup}>
              <label>{label}</label>
              <input
                className={styles.inputField}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className={styles.formGroup}>
            <label>Categoría</label>
            <select
              className={styles.inputField}
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Crear Subasta
          </button>
        </form>
      </div>
    </InitTemplate>
  );
}
