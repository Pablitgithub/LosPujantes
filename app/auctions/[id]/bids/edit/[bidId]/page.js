"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function EditBidPage() {
  const { id, bidID } = useParams();
  const [bid, setBid] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);

    const fetchBid = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/auctions/${id}/bid/${bidID}/`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("No se pudo cargar la puja");
        const data = await res.json();
        setBid(data);
        setNewPrice(data.price);
      } catch (err) {
        console.error(err);
        alert("Error al obtener la puja.");
      }
    };

    fetchBid();
  }, [id, bidID, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/auctions/${id}/bid/${bidID}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: parseFloat(newPrice) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert("Puja actualizada con éxito");
      router.push(`/user`);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la puja: " + err.message);
    }
  };

  if (!bid) return <p className={styles.loading}>Cargando puja...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Puja</h1>
      <form className={styles.form} onSubmit={handleUpdate}>
        <label htmlFor="price" className={styles.label}>Nuevo precio:</label>
        <input
          type="number"
          id="price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>Actualizar</button>
      </form>
    </div>
  );
}
