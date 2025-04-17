"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function UserBidsPage() {
  const [bids, setBids] = useState([]);
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      fetchUserBids(storedToken);
    }
  }, []);

  const fetchUserBids = async (token) => {
    try {
      const res = await fetch("https://lospujantesbackend-l89k.onrender.com/api/auctions/misPujas/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudieron obtener las pujas");

      const data = await res.json();
      setBids(data);
    } catch (error) {
      console.error("Error al cargar pujas del usuario:", error);
    }
  };

  const handleEdit = (bidId, auctionId) => {
    router.push(`/auctions/${auctionId}/bids/edit/${bidId}`);
  };

  const handleDelete = async (bidId, auctionId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta puja?")) return;

    try {
      const res = await fetch(`https://lospujantesbackend-l89k.onrender.com/api/auctions/${auctionId}/bid/${bidId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 204) {
        setBids((prev) => prev.filter((bid) => bid.id !== bidId));
      } else {
        alert("Error al eliminar la puja");
      }
    } catch (error) {
      alert("Error al eliminar la puja: " + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mis Pujas</h1>
      {bids.length === 0 ? (
        <p>No has realizado ninguna puja.</p>
      ) : (
        <ul className={styles.bidList}>
          {bids.map((bid) => (
            <li key={bid.id} className={styles.bidItem}>
              <p><strong>{bid.price} €</strong> en subasta #{bid.auction}</p>
              <p>Fecha: {new Date(bid.creation_date).toLocaleString()}</p>
              <div className={styles.buttons}>
                <button onClick={() => handleEdit(bid.id, bid.auction)}>Editar</button>
                <button onClick={() => handleDelete(bid.id, bid.auction)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
