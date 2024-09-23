import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiAcceptInvite, getActiveWander, getInvites } from "./Services";
import { Alert, Button, Card, Col, message, Row, Spin } from "antd";
import { useNavigate } from "react-router-dom";

function Invite() {
  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  console.log("🚀 ~ file: Invite.js:9 ~ Invite ~ wandererId:", wandererId);
  const [active, setActive] = useState();
  let navigate = useNavigate();
  const { isLoading, isError, data } = useQuery({
    queryKey: [`invite`, { wandererId: wandererId }],
    queryFn: async () => {
      const response = await getInvites(wandererId);
      const result = await response.json();
      return result;
    },
  });
  useEffect(() => {
    checkActiveWander();
  }, []);
  const checkActiveWander = async () => {
    const response = await getActiveWander(wandererId);
    let result = await response.json();
    console.log("🚀 ~ file: Invite.js:23 ~ queryFn: ~ response:", result);
    if (result?.activeWander?.length === 0) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  const handleAcceptInvite = async (wanderId) => {
    try {
      message.open({
        type: "loading",
        content: "Invite Accepting...",
        duration: 0,
      });
      const body = {
        wander_uuid: wanderId,
        status: "accept",
      };
      const response = await apiAcceptInvite(wandererId, body);
      message.destroy();
      message.success("Invite Request Accepted", 2); // Success message
      setTimeout(() => {
        navigate("/wander/active/wander");
      }, 1000);
      // window.location.reload();
    } catch (error) {
      message.error("Sign-in failed. Please try again.", 2); // Error message
      console.log(
        "🚀 ~ file: Invite.js:46 ~ handleAcceptInvite ~ error:",
        error
      );
    }
  };
  return (
    <Row gutter={[16, 16]}>
      {active ? (
        <>
          <Col span={24}>
            <Alert message={"you already have active wander"} type="warning" />
          </Col>
          <Col span={24}>
            <Button onClick={() => navigate("/wander/active/wander")}>
              Go to Active Wander
            </Button>
          </Col>
        </>
      ) : null}
      {data?.invite.map((invite) => (
        <Col key={invite.wander_uuid} span={24}>
          <Card title={invite.WanderName} bordered={true}>
            <Button
              disabled={active}
              value={invite.wander_uuid}
              onClick={(e) => handleAcceptInvite(invite.wander_uuid)}
            >
              Accept to join{" "}
            </Button>
          </Card>
          <br />
        </Col>
      ))}
    </Row>
  );
}

export default Invite;
