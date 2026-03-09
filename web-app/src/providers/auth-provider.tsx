"use client";

import { auth } from "@/lib/firebase/config";
import { getUserById } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch complete user data from Firestore
          const userData = await getUserById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // User exists in Auth but not in Firestore
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
