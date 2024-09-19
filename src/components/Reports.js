import React from "react";
import { Card, Button, Divider } from "antd";
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

  return (
    !isactivewanderLoading && (
      <>
        <div>
          <p>Active Wanders</p>
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

          <p>Completed Wanders</p>
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
      </>
    )
  );
}

export default Reports;
