"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "@/components/Card/Card";
import {
  getAuctionById,
  getBidsByAuctionId,
} from "../utils";
import StarRating from "@/components/StarRating";

export default function AuctionDetail() {
  const { id } = useParams();
  const [subasta, setSubasta] = useState(null);
  const [bids, setBids] = useState([]);
  const [puja, setPuja] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadAuction = async () => {
      const data = await getAuctionById(id);
      setSubasta(data);
    };
    const loadBids = async () => {
      const data = await getBidsByAuctionId(id);
      setBids(data);
    };

    const storedUser = localStorage.getItem("username");
    const storedToken = localStorage.getItem("access");

    if (storedUser && storedToken) {
      setUsuario(storedUser);
      setToken(storedToken);
    }

    loadAuction();
    loadBids();
  }, [id]);

  const handlePujar = async () => {
    if (!puja || Number(puja) <= 0) {
      alert("Introduce una puja válida.");
      return;
    }

    try {
      const response = await fetch(
        `https://lospujantesbackend-l89k.onrender.com/api/auctions/${id}/bid/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: parseFloat(puja),
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          throw new Error(JSON.stringify(err));
        } else {
          const text = await response.text();
          throw new Error(`Respuesta no JSON: ${text}`);
        }
      }

      setPuja("");
      const updated = await getBidsByAuctionId(id);
      setBids(updated);
    } catch (err) {
      alert("Error al pujar: " + err.message);
    }
  };

  if (!subasta) return <p>Cargando subasta...</p>;

  return (
    <Card>
      <h2>{subasta.title}</h2>
      <img
        src={subasta.thumbnail}
        alt={subasta.title}
        className={styles.image}
      />

      <p>
        <strong>Descripción:</strong> {subasta.description}
      </p>
      <p>
        <strong>Precio inicial:</strong> {subasta.price} €
      </p>

      {/* Valoración media */}
      <p>
        <strong>Valoración media:</strong>{" "}
        {subasta.average_rating.toFixed(2)} ⭐
      </p>

      {/* Componente de votación */}
      {usuario && <StarRating auctionId={Number(id)} />}

      <h3>Pujas recientes:</h3>
      {bids.length === 0 ? (
        <p>No hay pujas todavía.</p>
      ) : (
        <ul>
          {bids.map((bid) => (
            <li key={bid.id}>
              {bid.price}€ - {bid.bidder}
            </li>
          ))}
        </ul>
      )}

      {usuario && (
        <>
          <input
            type="number"
            value={puja}
            placeholder="Introduce tu puja"
            onChange={(e) => setPuja(e.target.value)}
            className={styles.input}
          />
          <button onClick={handlePujar} className={styles.button}>
            Pujar
          </button>
        </>
      )}
    </Card>
  );
}
