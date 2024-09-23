import React from "react";
import { Card, Button, Divider, Col, Spin, Row, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getActiveWander, getALLWander, getWander } from "./Services";
import { useNavigate } from "react-router-dom";

function Reports() {
  const navigate = useNavigate();

  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  const {
    isactivewanderLoading,
    isactivewanderError,
    data: activewanderdata,
  } = useQuery({
    queryKey: [`activeWander`, { wandererId: wandererId }],
    queryFn: async () => {
      const response = await getALLWander(wandererId);
      const result = await response.json();
      console.log("🚀 ~ file: Reports.js:34 ~ queryFn: ~ result:", result);
      return result;
    },
  });

  const handleViewReports = (uuid) => {
    navigate(`/wander/reports/view?uuid=${uuid}`);
  };
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
          {activewanderdata?.activeWander?.length === 0 &&
          activewanderdata?.completedWander?.length === 0 ? (
            <>
              <Col span={24}>
                <Alert
                  message={"you dont have any  wander to see reportsS"}
                  type="warning"
                />
              </Col>
              <Col span={24}>
                <Button onClick={() => navigate("/wander/active/wander")}>
                  Go to Active Wander
                </Button>
              </Col>
            </>
          ) : (
            <div>
              {activewanderdata?.activeWander?.length > 0 && (
                <p>Active Wanders</p>
              )}
              {activewanderdata?.activeWander?.map((wander) => (
                <Card
                  size="small"
                  key={wander.wander_uuid}
                  title={wander.WanderName}
                >
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleViewReports(wander.wander_uuid)}
                  >
                    View Reports
                  </Button>
                </Card>
              ))}

              <Divider />
              {activewanderdata?.completedWander?.length > 0 && (
                <p>Completed Wanders</p>
              )}

              {activewanderdata?.completedWander?.map((wander) => (
                <Card
                  size="small"
                  key={wander.wander_uuid}
                  title={wander.WanderName}
                >
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleViewReports(wander.wander_uuid)}
                  >
                    View Reports
                  </Button>
                </Card>
              ))}
            </div>
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

export default Reports;
