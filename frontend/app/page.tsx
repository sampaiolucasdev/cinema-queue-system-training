"use client";

import { useState } from "react";

export default function Home() {
  const [sessionId] = useState("session-123"); // ID de exemplo da sessão
  const [userId, setUserId] = useState("user-1");
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Simula 12 assentos no cinema
  const seats = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleReserve = async (seatNumber: number) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3333/tickets/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          seatNumber,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao reservar assento.");
      }

      setMessage(`Sucesso! Assento ${seatNumber} reservado.`);
      setSelectedSeat(seatNumber);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-2">
          Cinema Queue System
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Escolha o seu assento e garanta o seu ingresso
        </p>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            ID do Utilizador:
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="text-center bg-gray-700 py-1 rounded text-xs text-gray-300 mb-4 uppercase tracking-widest">
          Ecrã do Cinema
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {seats.map((seat) => (
            <button
              key={seat}
              disabled={loading}
              onClick={() => handleReserve(seat)}
              className={`py-3 rounded font-medium text-sm transition-all ${
                selectedSeat === seat
                  ? "bg-green-600 text-white ring-2 ring-green-400"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              Assento {seat}
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`p-3 rounded text-sm text-center ${message.includes("Erro") ? "bg-red-900/50 text-red-200 border border-red-700" : "bg-green-900/50 text-green-200 border border-green-700"}`}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
