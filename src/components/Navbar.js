import React, { useState } from "react";
import { app } from "../firebaseconfig";

import { Link } from "react-router-dom";
// import Drawer from "./DrawerComp";
// import logo from "../assets/navlogo.jpg";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Col, Row, Button, Drawer, Divider, Tag } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const Navbar = () => {
  const auth = getAuth(app);
  let navigate = useNavigate();
  const [value, setValue] = useState();
  const [open, setOpen] = useState(false);
  let userData = JSON.parse(localStorage.getItem("user"));
  console.log(
    "🚀 ~ file: Navbar.js:18 ~ Navbar ~ userData:"
    // JSON.parse(userData)
  );

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const menu = (e) => {
    // console.log("🚀 ~ file: Navbar.js:42 ~ routeMenu ~ e:", e.target.value);
    navigate(`/${e}`);
    setOpen(false);
  };

  const logout = async () => {
    try {
      let result = await signOut(auth);
      await localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.log("🚀 ~ file: Navbar.js:28 ~ logout ~ error:", error);
    }
  };

  return (
    <>
      <Row
        gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}
      >
        <Col className="gutter-row">
          <Button size={"large"} type="primary" onClick={showDrawer}>
            <MenuOutlined />
          </Button>
        </Col>
      </Row>

      <Drawer title="Menu" onClose={onClose} open={open}>
        <Tag
          color="processing"
          style={{ width: "100%", textAlign: "center", fontWeight: 600 }}
        >
          {userData.wanderer}
        </Tag>
        <Divider />
        <Button
          value="active/wander"
          style={{ width: "100%", marginBottom: "10px" }}
          onClick={(e) => menu("active/wander")}
        >
          active
        </Button>
        <br />
        <Button
          value="completed/wander"
          style={{ width: "100%", marginBottom: "10px" }}
          onClick={(e) => menu("completed/wander")}
        >
          completed
        </Button>
        <br />
        <Button
          value="invite"
          style={{ width: "100%", marginBottom: "10px" }}
          onClick={(e) => menu("invite")}
        >
          invite
        </Button>
        <br />
        <Button
          value="reports"
          style={{ width: "100%", marginBottom: "10px" }}
          onClick={(e) => menu("reports")}
        >
          reports
        </Button>
        <br />
        <Button
          value="logout"
          style={{ width: "100%", marginBottom: "10px" }}
          onClick={logout}
        >
          logout
        </Button>
        <br />
      </Drawer>
    </>
  );
};

export default Navbar;
