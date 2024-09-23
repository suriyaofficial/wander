import React from "react";
import CreateWander from "./CreateWander";
import { useQuery } from "@tanstack/react-query";
import { getActiveWander } from "./Services";
import ActiveWanderListing from "./ActiveWanderListing";
import { Col, Row, Spin } from "antd";
function ActiveWander() {
  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  const {
    isLoading: isactivewanderLoading,
    isactivewanderError,
    data: activewanderdata,
  } = useQuery({
    queryKey: [`activeWander`, { wandererId: wandererId }],
    queryFn: async () => {
      const response = await getActiveWander(wandererId);
      const result = await response.json();
      return result.activeWander;
    },
  });
  const contentStyle = {
    padding: 50,
    // background: "rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
  };
  const content = <div style={contentStyle} />;
  return (
    <>
      {!isactivewanderLoading ? (
        <>
          {activewanderdata?.length > 0 ? (
            <>
              <ActiveWanderListing activewanderdata={activewanderdata} />
            </>
          ) : (
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
                  <CreateWander />
                </Col>
              </Row>
            </>
          )}
        </>
      ) : (
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
              <Spin tip="Loading" size="large">
                {content}
              </Spin>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default ActiveWander;
