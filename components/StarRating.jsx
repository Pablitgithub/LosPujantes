"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserRatingByAuctionId,
  submitRating,
  deleteRating,
} from "@/app/auctions/utils";

export default function StarRating({ auctionId }) {
  const router = useRouter();
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(0);

  // 1. Carga el rating existente al montar
  useEffect(() => {
    getUserRatingByAuctionId(auctionId).then(setRating);
  }, [auctionId]);

  // 2. Enviar o actualizar voto
  const handleClick = async (value) => {
    try {
      const saved = await submitRating(auctionId, value, rating);
      setRating(saved);
      router.refresh(); // recarga la página para actualizar average_rating
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Quitar voto
  const handleRemove = async () => {
    if (!rating) return;
    try {
      await deleteRating(rating.id);
      setRating(null);
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`cursor-pointer text-3xl ${
            (hover || rating?.value || 0) >= n
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(n)}
        >
          ★
        </span>
      ))}

      {rating && (
        <button
          onClick={handleRemove}
          className="ml-4 px-2 py-1 border rounded text-red-600"
        >
          Quitar voto
        </button>
      )}
    </div>
  );
}
