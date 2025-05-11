"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "@/components/Card/Card";
import StarRating from "@/components/StarRating";
import {
  getAuctionById,
  getBidsByAuctionId,
  getCommentsByAuctionId,
  createComment,
} from "../utils";

export default function AuctionDetail() {
  const { id } = useParams();
  const [subasta, setSubasta] = useState(null);
  const [bids, setBids] = useState([]);
  const [comments, setComments] = useState([]);
  const [puja, setPuja] = useState("");
  const [newComment, setNewComment] = useState({ title: "", body: "" });
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    // 1. carga subasta, pujas y comentarios
    const load = async () => {
      const [auc, bds] = await Promise.all([
        getAuctionById(id),
        getBidsByAuctionId(id),
      ]);
      setSubasta(auc);
      setBids(bds);

      const t = localStorage.getItem("access");
      setToken(t);
      // carga comentarios (con o sin token)
      const comms = await getCommentsByAuctionId(id, t);
      setComments(comms);
    };

    // 2. detectar usuario
    const u = localStorage.getItem("username");
    if (u) setUsuario(u);

    load();
  }, [id]);

  const handlePujar = async () => {
    if (!puja || Number(puja) <= 0) {
      alert("Introduce una puja válida.");
      return;
    }
    try {
      const resp = await fetch(
        `https://lospujantesbackend-l89k.onrender.com/api/auctions/${id}/bid/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ price: parseFloat(puja) }),
        }
      );
      if (!resp.ok) throw new Error(await resp.text());
      setPuja("");
      setBids(await getBidsByAuctionId(id));
    } catch (e) {
      alert("Error al pujar: " + e.message);
    }
  };

  // NUEVO: publicar comentario
  const handleCommentSubmit = async () => {
    if (!newComment.title || !newComment.body) {
      alert("Título y texto son obligatorios.");
      return;
    }
    try {
      await createComment(id, newComment.title, newComment.body, token);
      setNewComment({ title: "", body: "" });
      setComments(await getCommentsByAuctionId(id, token));
    } catch (e) {
      alert("Error creando comentario: " + e.message);
    }
  };

  if (!subasta) return <p>Cargando subasta…</p>;

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

      {/* Valoración media y componente de votación */}
      <p>
        <strong>Valoración media:</strong>{" "}
        {subasta.average_rating.toFixed(2)} ⭐
      </p>
      {usuario && <StarRating auctionId={Number(id)} />}

      {/* Pujas */}
      <h3>Pujas recientes:</h3>
      {bids.length === 0 ? (
        <p>No hay pujas todavía.</p>
      ) : (
        <ul>
          {bids.map((bid) => (
            <li key={bid.id}>
              {bid.price}€ – {bid.bidder_username || bid.bidder}
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

      {/* ────────────────────────────── */}
      {/* Comentarios */}
      <h3>Comentarios:</h3>
      {comments.length === 0 ? (
        <p>No hay comentarios todavía.</p>
      ) : (
        <ul className={styles.commentsList}>
          {comments.map((c) => (
            <li key={c.id}>
              <strong>{c.user_username}</strong>{" "}
              <span className={styles.commentDate}>[{c.created}]</span>
              <p className={styles.commentTitle}>{c.title}</p>
              <p className={styles.commentBody}>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario para nuevo comentario */}
      {usuario && (
        <div className={styles.commentForm}>
          <h4>Añadir comentario</h4>
          <input
            type="text"
            placeholder="Título"
            value={newComment.title}
            onChange={(e) =>
              setNewComment({ ...newComment, title: e.target.value })
            }
          />
          <textarea
            placeholder="Tu comentario…"
            rows={4}
            value={newComment.body}
            onChange={(e) =>
              setNewComment({ ...newComment, body: e.target.value })
            }
          />
          <button onClick={handleCommentSubmit}>Publicar comentario</button>
        </div>
      )}
    </Card>
  );
}
