import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import Login from "./login";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function MyApp({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth);

  const fetchUserName = async () => {
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),

        {
          email: user.email,
          lastSeen: serverTimestamp(),
          photoURL: user.photoURL,
        },
        { merge: true }
      );
    }
  };

  useEffect(() => {
    fetchUserName();
  }, [user]);
  if (loading) return <Loading />;
  if (!user) return <Login />;
  return <Component {...pageProps} />;
}

export default MyApp;
