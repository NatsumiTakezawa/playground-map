/**
 * S03 サインインページ
 * @package MatsueOnsenMap
 * @module app/auth/signin/page
 */
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import OAuthButtons from "@/components/OAuthButtons";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
 