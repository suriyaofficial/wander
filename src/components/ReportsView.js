import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getWander } from "./Services";
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
} from "antd";
import { MailOutlined, AppstoreOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import Rotate from "../assets/Rotate.gif";

const { Title, Text, Paragraph } = Typography;

function ReportsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uuid = queryParams.get("uuid");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState("all");
  const [amounts, setAmounts] = useState({});
  const [consolidated, setConsolidated] = useState({});
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const portraitMessageStyle = {
    display: isPortrait ? "block" : "none",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    // background: "rgba(0, 0, 0, 0.2)",
    color: "black",
    textAlign: "center",
    zIndex: 1000,
  };
  const fetchWanderDetails = async ({ queryKey }) => {
    const [, uuid] = queryKey;
    const response = await getWander(uuid);
    const result = await response.json();

    return result?.existingwander?.expenses;
  };
  // Use react-query's useQuery to fetch data
  const {
    data: wanderdata,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["wanderDetails", uuid], // Query key now passed as an object property
    queryFn: fetchWanderDetails, // Function to fetch data
    enabled: !!uuid,
  });
  useEffect(() => {
    if (!isLoading && wanderdata && wanderdata?.length > 0) {
      const calculatedAmounts = calculateAmounts(wanderdata[0]);
      setAmounts(calculatedAmounts);
      setConsolidated(consolidateDebts(calculatedAmounts));
    }
  }, [isLoading, wanderdata]);
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
      render: (text) => {
        if (text.includes("::")) {
          return (
            <a>
              {text
                .split("::")[1]
                .replaceAll("_", " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </a>
          );
        }
        // Format text like 'trip_budget' to 'Trip Budget'
        return (
          <a>
            {text
              .replace("_", " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </a>
        );
      },
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
        title: key
          .replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
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
    const selectedRows = wanderdata?.filter((row) =>
      selectedRowKeys.includes(row.key)
    );
    const totalByUser = {};
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
    return Object.keys(totalByUser)?.map((userKey) => (
      <Card
        key={userKey}
        style={{ margin: "5px", height: "60px" }}
        size="small"
      >
        <Statistic
          titleFontSize="12px" // Smaller title font size
          valueStyle={{ fontSize: "14px", padding: "0px" }} // Smaller value font size
          title={userKey.replaceAll("_", " ")}
          value={totalByUser[userKey]}
          formatter={formatter}
        />
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
          setSelectedRowKeys(unequalRows);
        },
      },
    ],
  };

  const calculateAmounts = (dataUser) => {
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
      users.forEach((user) => {
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
    <>
      <div style={portraitMessageStyle}>
        <div style={{ textAlign: "center" }}>
          <img
            src={Rotate}
            alt="Rotating Screen"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <p>Please rotate your screen to landscape mode to view reports.</p>
      </div>
      {!isPortrait && (
        <>
          <Row>
            <Col span={22}>
              <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
              />
            </Col>
            <Col span={2}>
              <Button onClick={() => navigate(`/reports`)}>back</Button>
            </Col>
          </Row>

          {current === "all" ? (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {renderUserCards()}
              </div>
              {!isLoading && wanderdata && wanderdata?.length > 0 && (
                <Table
                  size="small"
                  rowSelection={rowSelection}
                  columns={columns()}
                  dataSource={wanderdata}
                  pagination={false}
                />
              )}
            </div>
          ) : (
            <>
              {!isLoading && consolidated && (
                <>
                  {Object.keys(consolidated)?.map((user) => (
                    <Card
                      key={user}
                      type="inner"
                      title={<Text>{user.replaceAll("_", " ")} owes</Text>}
                      size="small"
                    >
                      <List
                        grid={{ gutter: 16, column: 4 }} // Adjust the number of columns as needed
                        dataSource={Object.keys(consolidated[user])}
                        itemLayout={"vertical"}
                        renderItem={(otherUser) => (
                          <List.Item>
                            <Alert
                              message={
                                <>
                                  {otherUser.replaceAll("_", " ")} $
                                  <b>
                                    {consolidated[user][otherUser] > 0
                                      ? consolidated[user][otherUser]
                                      : "0"}
                                  </b>
                                </>
                              }
                              type="error"
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

export default ReportsView;
