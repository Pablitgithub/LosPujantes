// app/auctions/utils.js

// app/auctions/utils.js

export const getAuctions = async () => {
  try {
    let allAuctions = [];
    let nextUrl = "https://lospujantesbackend-l89k.onrender.com/api/auctions/";

    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();
      allAuctions = [...allAuctions, ...(data.results || [])];
      nextUrl = data.next;
    }

    return allAuctions;
  } catch (error) {
    console.error("Error al obtener subastas:", error);
    return [];
  }
};


export const getCategories = async () => {
  try {
    const response = await fetch("https://lospujantesbackend-l89k.onrender.com/api/auctions/categories/");
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }

    if (Array.isArray(data)) {
      return data;
    }

    throw new Error("Categorías no tienen el formato esperado");
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
};


export const getAuctionById = async (id) => {
  try {
    const response = await fetch(`https://lospujantesbackend-l89k.onrender.com/api/auctions/${id}/`);
    if (!response.ok) throw new Error("No se pudo cargar la subasta");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener subasta:", error);
    return null;
  }
};

export const getBidsByAuctionId = async (auctionId) => {
  try {
    const token = localStorage.getItem("access");

    const response = await fetch(`https://lospujantesbackend-l89k.onrender.com/api/auctions/${auctionId}/bid/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("No se pudieron cargar las pujas");

    const data = await response.json();

    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error("Error al obtener pujas:", error);
    return [];
  }
};


export const createBid = async (auctionId, price, token) => {
  try {
    const response = await fetch(`https://lospujantesbackend-l89k.onrender.com/api/auctions/${auctionId}/bid/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ price }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Error al crear la puja");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al crear puja:", error);
    throw error;
  }
};

// Devuelve el rating (si existe) del usuario sobre esta subasta
export const getUserRatingByAuctionId = async (auctionId) => {
  const token = localStorage.getItem("access");
  if (!token) return null;
  const res = await fetch(
    `https://lospujantesbackend-l89k.onrender.com/api/auctions/ratings/?auction=${auctionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
};

// Crea o actualiza rating según exista ya
export const submitRating = async (auctionId, value, existing) => {
  const token = localStorage.getItem("access");
  const isNew = !existing;
  const url = isNew
    ? `https://lospujantesbackend-l89k.onrender.com/api/auctions/ratings/`
    : `https://lospujantesbackend-l89k.onrender.com/api/auctions/ratings/${existing.id}/`;
  const method = isNew ? "POST" : "PUT";
  const body = isNew
    ? JSON.stringify({ auction: auctionId, value })
    : JSON.stringify({ value });

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok) throw new Error("Error al enviar su valoración");
  return res.json();
};

// Elimina un rating
export const deleteRating = async (ratingId) => {
  const token = localStorage.getItem("access");
  const res = await fetch(
    `https://lospujantesbackend-l89k.onrender.com/api/auctions/ratings/${ratingId}/`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Error al eliminar su valoración");
  return true;
};

export const getCommentsByAuctionId = async auctionId => {
  try {
    const resp = await fetch(
      `https://lospujantesbackend-l89k.onrender.com/api/auctions/${auctionId}/comments/`
    );
    if (!resp.ok) throw new Error("Error cargando comentarios");
    return await resp.json();
  } catch {
    return [];
  }
};

export const createComment = async (auctionId, title, body) => {
  const token = localStorage.getItem("access");
  const resp = await fetch(
    `https://lospujantesbackend-l89k.onrender.com/api/auctions/${auctionId}/comments/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, body })
    }
  );
  if (!resp.ok) {
    const { detail } = await resp.json();
    throw new Error(detail || "Error creando comentario");
  }
  return await resp.json();
};
