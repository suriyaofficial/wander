import React, { useState, useEffect } from "react";
import { Button, DatePicker, Input, Select } from "antd";
import debounce from "lodash/debounce";
import CreateWander from "./CreateWander";
import { useQuery } from "@tanstack/react-query";
import { getActiveWander } from "./Services";
import ActiveWanderListing from "./ActiveWanderListing";
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
          <CreateWander />
        </>
      )}
    </>
  );
}

export default ActiveWander;
