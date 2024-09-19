// import { Button } from "antd";
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
  Divider,
} from "antd";
import { MailOutlined, AppstoreOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import Rotate from "../assets/rotateScreen.gif";
import Lottie from "react-lottie";

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
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Rotate,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const portraitMessageStyle = {
    display: isPortrait ? "block" : "none",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
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
    console.log(
      "🚀 ~ file: Reports.js:905 ~ getTotalForSelectedRows ~ selectedRowKeys:",
      selectedRowKeys
    );
    const selectedRows = wanderdata?.filter((row) =>
      selectedRowKeys.includes(row.key)
    );
    console.log(
      "🚀 ~ file: ReportsView.js:137 ~ getTotalForSelectedRows ~ selectedRows:",
      selectedRows
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
    <>
      <div style={portraitMessageStyle}>
        {/* <svg
          style={rotateIconStyle}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1v4m0 14v4m-7-7H1m22 0h-4m-6 7c-4.41 0-8-3.59-8-8s3.59-8 8-8v3l4-4 4 4v-3c4.41 0 8 3.59 8 8s-3.59 8-8 8z" />
        </svg> */}
        {/* <div style={{ width: "100px", height: "100px", marginBottom: "10px" }}>
          <Lottie options={defaultOptions} height={100} width={100} />
        </div> */}
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
                      // style={{ marginBottom: "16px", marginRight: "16px" }}
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
                              // showIcon
                            />
                            {/* <Card title={otherUser} size="small"></Card> */}
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
