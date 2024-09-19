import React from "react";
import CreateWander from "./CreateWander";
import { useQuery } from "@tanstack/react-query";
import { getActiveWander } from "./Services";
import ActiveWanderListing from "./ActiveWanderListing";
import { Col, Row } from "antd";
function ActiveWander() {
  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  const {
    isactivewanderLoading,
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
  return (
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
  );
}

export default ActiveWander;
