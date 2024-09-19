import "../styles/Login.css";
import React, { useState } from "react";
import { app } from "../firebaseconfig";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import GoogleButton from "react-google-button";
import axios from "axios";
import { BASE_URL } from "../common.ts";
import { Col, Row } from "antd";

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
      <Row
        gutter={[16, 16]}
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Col>
          <GoogleButton type="light" onClick={signInWithGoogle} />
        </Col>
      </Row>{" "}
    </>
  );
}

export default Login;
