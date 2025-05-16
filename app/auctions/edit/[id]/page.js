"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageTemplate from "@/components/PageTemplate/PageTemplate";
import styles from "./page.module.css";
import { getCategories } from "../../utils"; // usa getCategories correctamente

export default function EditAuctionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    brand: "",
    thumbnail: "",
    closing_date: "",
    category: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    const fetchAuction = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/auctions/${id}/`);
        if (!res.ok) throw new Error("Error al cargar la subasta");
        const data = await res.json();
        setForm({
          ...data,
          closing_date: new Date(data.closing_date).toISOString().slice(0, 16),
          category: data.category.toString(), // aseguramos string para el select
        });
      } catch (err) {
        console.error(err);
        alert("Error al cargar la subasta.");
      }
    };

    const loadCategories = async () => {
      const fetched = await getCategories();
      setCategories(fetched);
    };

    fetchAuction();
    loadCategories();
  }, [id, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/auctions/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al actualizar la subasta");

      alert("Subasta actualizada correctamente.");
      router.push("/user");
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios.");
    }
  };

  return (
    <PageTemplate>
      <div className={styles.container}>
        <h1 className={styles.heading}>Editar Subasta</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título"
            className={styles.inputField}
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className={styles.inputField}
            required
          />
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio"
            className={styles.inputField}
            required
          />
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            className={styles.inputField}
            required
          />
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Marca"
            className={styles.inputField}
            required
          />
          <input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            placeholder="URL de la imagen"
            className={styles.inputField}
            required
          />
          <input
            name="closing_date"
            type="datetime-local"
            value={form.closing_date}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={styles.inputField}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="submit" className={styles.submitButton}>
            Guardar cambios
          </button>
        </form>
      </div>
    </PageTemplate>
  );
}
