import "../styles/Login.css";
import React, { useState } from "react";
import { app } from "../firebaseconfig";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import GoogleButton from "react-google-button";
import axios from "axios";
import { BASE_URL } from "../common.ts";

function Login() {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const [userData, setUserData] = useState();

  const signInWithGoogle = async () => {
    console.log(
      "🚀 ~ file: login.js:27 ~ signInWithGoogle ~ signInWithGoogle:"
    );
    try {
      let result = await signInWithPopup(auth, provider);
      console.log(
        "🚀 ~ file: Login.js:18 ~ signInWithGoogle ~ result:",
        result
      );
      console.log(
        "🚀 ~ file: Login.js:21 ~ signInWithGoogle ~ result:",
        result.user.providerData[0]
      );
      const data = {
        wandererId: result.user.providerData[0].email,
        wanderer: result.user.providerData[0].displayName,
        wandererPhoto: result.user.providerData[0].photoURL,
      };

      const response = await axios.post(`${BASE_URL}/login/`, data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      window.location.reload();
    } catch (error) {
      console.error("🚀 ~ file: login.j:22 ~ signInWithGoogle ~ error:", error);
    }
  };
  return (
    <>
      <div className="mainDiv">
        <h3>Welcome...</h3>
        <GoogleButton type="light" onClick={signInWithGoogle} />
      </div>
    </>
  );
}

export default Login;
