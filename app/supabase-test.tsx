
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTest() {
  const [status, setStatus] = useState("در حال بررسی اتصال...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase
        .from("connection_test")
        .select("*")
        .limit(1);

      if (error) {
        setStatus(`پاسخ Supabase: ${error.message}`);
      } else {
        setStatus("اتصال موفق است.");
      }
    }

    testConnection();
  }, []);

  return <p dir="rtl">{status}</p>;
}
