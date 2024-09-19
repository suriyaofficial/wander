import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Statistic,
  Table,
  Typography,
  Row,
  Col,
  Menu,
  Alert,
  Button,
  Divider,
} from "antd";
import CountUp from "react-countup";
import { MailOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getActiveWander, getALLWander, getWander } from "./Services";
import { useNavigate } from "react-router-dom";
const { Title, Text, Paragraph } = Typography;

function Reports() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [consolidated, setConsolidated] = useState({});
  const [current, setCurrent] = useState("all");
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
    // Navigate to /reports/view and pass the uuid
    navigate(`/reports/view?uuid=${uuid}`);
  };
  // const {
  //   iswanderLoading,
  //   iswanderError,
  //   data: wanderdata,
  // } = useQuery({
  //   queryKey: [`Wander`, { wanderId: activewanderdata }],
  //   queryFn: async () => {
  //     console.log(
  //       "🚀 ~ file: Reports.js:773 ~ queryFn: ~ activewanderdata:",
  //       activewanderdata
  //     );
  //     const response = await getWander(activewanderdata);
  //     const result = await response.json();
  //     console.log(
  //       "🚀 ~ file: Reports.js:776 ~ queryFn: ~ result?.existingwander?.expenses;:",
  //       result?.existingwander?.expenses
  //     );
  //     return result?.existingwander?.expenses;
  //   },
  //   onSuccess: () => {
  //     const calculatedAmounts = calculateAmounts(wanderdata?.[0]);
  //     setAmounts(calculatedAmounts);
  //     setConsolidated(consolidateDebts(calculatedAmounts));
  //   },
  // });

  const getUniqueValues = (wanderdata, key) => {
    return [...new Set(wanderdata?.map((item) => item[key]))]?.map((value) => ({
      text: value,
      value,
    }));
  };

  const columns = () => [
    {
      title: "Date",
      dataIndex: "expenseDate",
      key: "expenseDate",
      filters: getUniqueValues(wanderdata, "expenseDate"),
      onFilter: (value, record) => record.expenseDate.indexOf(value) === 0,
      sorter: (a, b) => new Date(a.expenseDate) - new Date(b.expenseDate),
      defaultSortOrder: "ascend",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "expenseDescription",
      key: "expenseDescription",
      filters: getUniqueValues(wanderdata, "expenseDescription"),
      onFilter: (value, record) =>
        record.expenseDescription.indexOf(value) === 0,
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Spend From",
      dataIndex: "spendFrom",
      key: "spendFrom",
      filters: getUniqueValues(wanderdata, "spendFrom"),
      onFilter: (value, record) => record.spendFrom.indexOf(value) === 0,
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Split by",
      dataIndex: "splitBy",
      key: "splitBy",
      filters: getUniqueValues(wanderdata, "splitBy"),
      onFilter: (value, record) => record.splitBy.indexOf(value) === 0,
      sorter: (a, b) => a.splitBy.localeCompare(b.splitBy),
      defaultSortOrder: "ascend",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Total",
      dataIndex: "expenseAmount",
      key: "expenseAmount",
      render: (text) => <a>{text}</a>,
    },
    ...Object.keys(wanderdata?.[0])
      ?.filter((key) => key?.startsWith("_"))
      ?.map((key) => ({
        title: key,
        dataIndex: key,
        key,
        render: (text) => <a>{text}</a>,
      })),
  ];

  const onClick = (e) => {
    console.log("🚀 ~ file: Reports.js:853 ~ onClick ~ e:", e);
    setCurrent(e.key);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    console.log(
      "🚀 ~ file: Reports.js:862 ~ onSelectChange ~ newSelectedRowKeys:",
      newSelectedRowKeys
    );
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const getTotalForSelectedRows = () => {
    console.log(
      "🚀 ~ file: Reports.js:905 ~ getTotalForSelectedRows ~ selectedRowKeys:",
      selectedRowKeys
    );
    const selectedRows = wanderdata?.filter((row) =>
      selectedRowKeys.includes(row.key)
    );
    const totalByUser = {};
    console.log(
      "🚀 ~ file: Reports.js:869 ~ getTotalForSelectedRows ~ selectedRows:",
      selectedRows
    );

    selectedRows?.forEach((row) => {
      Object.keys(row)
        ?.filter((key) => key.startsWith("_"))
        ?.forEach((userKey) => {
          if (!totalByUser[userKey]) {
            totalByUser[userKey] = 0;
          }
          totalByUser[userKey] += row[userKey];
        });
    });

    return totalByUser;
  };
  const formatter = (value) => (
    <CountUp end={value} separator="," suffix="rs" duration={0.2} />
  );
  const renderUserCards = () => {
    const totalByUser = getTotalForSelectedRows();
    console.log(
      "🚀 ~ file: Reports.js:900 ~ renderUserCards ~ totalByUser:",
      totalByUser
    );

    return Object.keys(totalByUser)?.map((userKey) => (
      <Card key={userKey} style={{ margin: "10px" }} size={"small"}>
        {/* <p>{userKey}</p> */}
        <Statistic
          titleFontSize="40"
          title={userKey}
          value={totalByUser[userKey]}
          formatter={formatter}
        />
        {/* <p>Total: {totalByUser[userKey]}</p> */}
      </Card>
    ));
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "equally",
        text: "Select Equal Split",
        onSelect: (changeableRowKeys) => {
          const equalRows = wanderdata
            ?.filter((row) => row.splitBy === "equally")
            ?.map((row) => row.key);
          console.log(
            "🚀 ~ file: Reports.js:922 ~ Reports ~ equalRows:",
            equalRows
          );
          setSelectedRowKeys(equalRows);
        },
      },
      {
        key: "unequally",
        text: "Select Unequal Split",
        onSelect: (changeableRowKeys) => {
          const unequalRows = wanderdata
            ?.filter((row) => row.splitBy === "unequally")
            ?.map((row) => row.key);
          console.log(
            "🚀 ~ file: Reports.js:950 ~ Reports ~ unequalRows:",
            unequalRows
          );
          setSelectedRowKeys(unequalRows);
        },
      },
    ],
  };

  const calculateAmounts = (dataUser) => {
    console.log(
      "🚀 ~ file: Reports.js:975 ~ calculateAmounts ~ dataUser:",
      dataUser
    );
    const users = [];

    // Iterate through the keys of the object
    Object.keys(dataUser).forEach((key) => {
      // Check if the key starts with an underscore
      if (key.startsWith("_")) {
        // Push the key to the userList array
        users.push(key);
      }
    });
    const result = {};

    users.forEach((user) => {
      result[user] = {};
      users.forEach((otherUser) => {
        if (user !== otherUser) {
          result[user][otherUser] = 0;
        }
      });
    });

    wanderdata.forEach((expense) => {
      console.log(
        "🚀🚀 ~ file: Reports.js:979 ~ wanderdata.forEach ~ expense:",
        expense
      );
      users.forEach((user) => {
        console.log(
          "🚀🚀 ~ file: Reports.js:981 ~ users.forEach ~ user:",
          user
        );
        const spendFromParts = expense?.spendFrom?.split("::");
        const extractedUser = "_" + spendFromParts[1]; // Adding underscore prefix to the extracted part
        if (extractedUser === user) {
          users.forEach((otherUser) => {
            if (user !== otherUser) {
              result[user][otherUser] += expense[otherUser];
            }
          });
        }
      });
    });
    console.log("🚀 ~ file: Reports.js:984 ~ users.forEach ~ result:", result);

    return result;
  };

  const consolidateDebts = (amounts) => {
    const users = [];

    // Iterate through the keys of the object
    Object.keys(wanderdata?.[0]).forEach((key) => {
      // Check if the key starts with an underscore
      if (key.startsWith("_")) {
        // Push the key to the userList array
        users.push(key);
      }
    });
    const consolidated = {};

    users.forEach((user) => {
      consolidated[user] = {};
      users.forEach((otherUser) => {
        if (user !== otherUser) {
          if (amounts[user] && amounts[otherUser]) {
            const debt = amounts[user][otherUser] - amounts[otherUser][user];
            console.log("debt--", user, debt);
            consolidated[user][otherUser] = debt > 0 ? debt : 0;

            // Ensure otherUser is initialized
            if (!consolidated[otherUser]) {
              consolidated[otherUser] = {};
            }

            consolidated[otherUser][user] = debt < 0 ? -debt : 0;
          } else {
            console.log(`Missing debts for ${user} or ${otherUser}`);
          }
        }
      });
    });
    console.log(
      "🚀 ~ file: Reports.js:1016 ~ consolidateDebts ~ consolidated:",
      consolidated
    );

    return consolidated;
  };
  const items = [
    {
      label: "TAB1",
      key: "all",
      icon: <MailOutlined />,
    },
    {
      label: "TAB2",
      key: "owes",
      icon: <AppstoreOutlined />,
      // disabled: true,
    },
  ];
  return (
    // <>
    //   <Menu
    //     onClick={onClick}
    //     selectedKeys={[current]}
    //     mode="horizontal"
    //     items={items}
    //   />
    //   ;
    //   {current === "all" ? (
    //     <div>
    //       <div style={{ display: "flex", flexWrap: "wrap" }}>
    //         {renderUserCards()}
    //       </div>
    //       <Table
    //         size="small"
    //         scroll={{
    //           y: 200,
    //         }}
    //         rowSelection={rowSelection}
    //         columns={columns()}
    //         dataSource={wanderdata}
    //         pagination={false}
    //       />
    //     </div>
    //   ) : (
    //     <>
    //       {Object.keys(consolidated)?.map((user) => (
    //         <Card
    //           key={user}
    //           type="inner"
    //           title={<Text>{user.replaceAll("_", " ")} owes</Text>}
    //           size="small"
    //           // style={{ marginBottom: "16px", marginRight: "16px" }}
    //         >
    //           <List
    //             grid={{ gutter: 16, column: 4 }} // Adjust the number of columns as needed
    //             dataSource={Object.keys(consolidated[user])}
    //             itemLayout={"vertical"}
    //             renderItem={(otherUser) => (
    //               <List.Item>
    //                 <Alert
    //                   message={
    //                     <>
    //                       {otherUser.replaceAll("_", " ")} $
    //                       <b>
    //                         {consolidated[user][otherUser] > 0
    //                           ? consolidated[user][otherUser]
    //                           : "0"}
    //                       </b>
    //                     </>
    //                   }
    //                   type="error"
    //                   // showIcon
    //                 />
    //                 {/* <Card title={otherUser} size="small"></Card> */}
    //               </List.Item>
    //             )}
    //           />
    //         </Card>
    //       ))}
    //     </>
    //   )}
    // </>
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
