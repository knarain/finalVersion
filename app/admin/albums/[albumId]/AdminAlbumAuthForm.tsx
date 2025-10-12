"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Props {
  albumId: number;
}

export function AdminAlbumAuthForm({ albumId }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAddCredential = async () => {
    try {
      const res = await axios.post("https://stg.rashmiphotography.com/backend/admin/album-credentials", {
        album_id: albumId,
        email,
        password,
      });

      if (res.data.success) {
        setMessage("Credentials added successfully!");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to add credentials.");
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg space-y-4 w-full max-w-md">
      <h3 className="text-amber-400 font-light text-lg">Add Album Credentials</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="p-2 rounded border w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="p-2 rounded border w-full"
      />
      <Button onClick={handleAddCredential} className="bg-amber-400 text-black w-full">
        Add Credentials
      </Button>
      {message && <p className="text-gray-300">{message}</p>}
    </div>
  );
}
