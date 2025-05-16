"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "@/components/Card/Card";
import Link from "next/link";

export default function UserPage() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [subastas, setSubastas] = useState([]);
  const [pujas, setPujas] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedToken = localStorage.getItem("access");

    if (storedUser && storedToken) {
      setUsername(storedUser);
      setToken(storedToken);
      fetchUserAuctions(storedToken);
      fetchUserBids(storedToken);
    }
  }, []);

  const fetchUserAuctions = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auctions/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("No se pudieron cargar tus subastas");

      const data = await res.json();
      setSubastas(data.results || data);
    } catch (error) {
      console.error("Error al obtener subastas del usuario:", error);
    }
  };

  const fetchUserBids = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auctions/misPujas/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("No se pudieron cargar tus pujas");

      const data = await res.json();
      setPujas(data.results || data);
    } catch (error) {
      console.error("Error al obtener pujas del usuario:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("access");
    window.location.href = "/login";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>👤 Bienvenido, {username}</h1>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Cerrar sesión
      </button>

      <h2 className={styles.subtitle}>Tus Subastas</h2>

      {subastas.length === 0 ? (
        <p>Aún no has creado ninguna subasta.</p>
      ) : (
        <div className={styles.grid}>
          {subastas.map((subasta) => (
            <Card key={subasta.id}>
              <img
                src={subasta.thumbnail}
                alt={subasta.title}
                className={styles.image}
              />
              <h3>{subasta.title}</h3>
              <p>{subasta.description}</p>
              <p><strong>Precio:</strong> {subasta.price}€</p>
              <p><strong>Stock:</strong> {subasta.stock}</p>

              <div className={styles.actions}>
                <Link href={`/auctions/${subasta.id}`}>
                  <button className={styles.button}>Ver detalles</button>
                </Link>
                <Link href={`/auctions/edit/${subasta.id}`}>
                  <button className={styles.editButton}>Editar</button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className={styles.subtitle}>Tus Pujas</h2>

      {pujas.length === 0 ? (
        <p>El usuario no ha realizado pujas todavía.</p>
      ) : (
        <div className={styles.grid}>
          {pujas.map((puja) => (
            <Card key={puja.id}>
              <p><strong>Subasta ID:</strong> {puja.auction}</p>
              <p><strong>Precio:</strong> {puja.price}€</p>
              <p><strong>Fecha:</strong> {new Date(puja.creation_date).toLocaleString()}</p>

              <Link href={`/auctions/${puja.auction}/bids/edit/${puja.id}`}>
                <button className={styles.editButton}>Editar puja</button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/auctions/create">
          <button className={styles.createButton}>Crear nueva subasta</button>
        </Link>
        <Link href="/user/edit">
          <button className={styles.createButton}>Consultar datos personales</button>
        </Link>
      </div>
    </div>
  );
}
