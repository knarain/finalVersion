"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface Props {
  albumId: number;
}

interface FormData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export function AdminAlbumAuthForm({ albumId }: Props) {
  const [message, setMessage] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/album-credentials`,
        {
          album_id: albumId,
          email: data.email,
          password: data.password,
        }
      );

      if (res.data.success) {
        setMessage("Credentials added successfully!");
        reset();
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to add credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-900 p-4 pt-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 w-full max-w-md bg-gray-800 rounded-lg p-6"
        noValidate
      >
        <h3 className="text-amber-400 font-light text-lg text-center">
          Add Album Credentials
        </h3>

        <div>
          <input
            type="email"
            placeholder="Email"
            className={`p-2 rounded w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className={`p-2 rounded w-full ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-amber-400 text-black w-full"
        >
          Add Credentials
        </Button>

        {message && (
          <p className="text-gray-300 text-center text-sm mt-1">{message}</p>
        )}
      </form>
    </div>
  );
}
