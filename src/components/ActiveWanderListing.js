import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  completeWander,
  deleteExpenses,
  deleteWander,
  getWander,
} from "./Services";
import {
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Statistic,
  Drawer,
  Form,
  List,
  Button,
  Modal,
  message,
  Popover,
  Avatar,
  FloatButton,
  Tooltip,
  Spin,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DeleteTwoTone,
  EyeInvisibleTwoTone,
  EyeTwoTone,
  PushpinTwoTone,
  SaveTwoTone,
  SearchOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import AddExpenses from "./AddExpenses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
function ActiveWanderListing(activewanderdata) {
  console.log(
    "🚀 ~ file: ActiveWanderListing.js:43 ~ ActiveWanderListing ~ activewanderdata:",
    activewanderdata
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExpUuid, setSelectedExpUuid] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const queryClient = useQueryClient();
  const [isWanderModalVisible, setIsWanderModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [actionType, setActionType] = useState("");
  const [wanderId, setWanderId] = useState("");
  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  const baseUrl =
    "https://firebasestorage.googleapis.com/v0/b/travel-spend-tracker.appspot.com/o/";

  const categoryIcons = {
    transport: "vehicles.png",
    food: "burger.png",
    accommodation: "villa.png",
    groceries: "shopping-bag.png",
    shopping: "shopping-cart.png",
    activities: "mountain.png",
    entertainment: "cinema.png",
    drinks: "drink.png",
    flights: "flight.png",
    sightseeing: "binocular.png",
    "exchange fees": "business.png",
    health: "cardiogram.png",
    miscellaneous: "box.png",
    sim: "sim-card.png",
  };
  // Function to handle button clicks
  const onActionClick = (value) => {
    const [tripId, action] = value.split("::");
    setWanderId(tripId);
    setActionType(action);
    if (action === "save") {
      setModalContent("Are you sure you want to complete the wander?");
    } else if (action === "delete") {
      setModalContent("Are you sure you want to delete the wander?");
    }
    setIsWanderModalVisible(true);
  };
  const {
    iswanderLoading,
    iswanderError,
    data: wanderdata,
  } = useQuery({
    queryKey: [
      `Wander`,
      { wanderId: activewanderdata.activewanderdata[0]?.wander_uuid },
    ],
    queryFn: async () => {
      const response = await getWander(
        activewanderdata.activewanderdata[0]?.wander_uuid
      );
      const result = await response.json();
      console.log(
        "🚀 ~ file: ActiveWanderListing.js:76 ~ queryFn: ~ result:",
        result
      );
      console.log(
        "🚀 ~ file: ActiveWanderListing.js:58 ~ queryFn: ~ result:",
        result
      );
      return result;
    },
  });
  const mutation = useMutation({
    mutationFn: async (expId) => {
      if (expId) {
        return await deleteExpenses(
          wanderdata?.existingwander?.wander_uuid,
          expId
        );
      }
    },
    onSuccess: () => {
      setIsModalVisible(false);
      message.success("Expense deleted successfully!");
      queryClient.invalidateQueries([
        "Wander",
        { wanderId: activewanderdata.activewanderdata[0] },
      ]);
    },
  });
  const completeWanderMutation = useMutation({
    mutationFn: async (wanderId) => {
      if (wanderId) {
        return await completeWander(wanderdata?.existingwander, wanderId);
      }
    },
    onSuccess: () => {
      setIsModalVisible(false);
      message.success("wander saved successfully!");
      queryClient.invalidateQueries([
        "Wander",
        { wanderId: activewanderdata.activewanderdata[0] },
      ]);
    },
  });
  const deleteWanderMutation = useMutation({
    mutationFn: async (expId) => {
      if (expId) {
        return await deleteWander(wanderdata?.existingwander, expId);
      }
    },
    onSuccess: () => {
      setIsModalVisible(false);
      message.success("Wander deleted successfully!");
      queryClient.invalidateQueries([
        "Wander",
        { wanderId: activewanderdata.activewanderdata[0] },
      ]);
    },
  });
  const getCategoryIcon = (category) => {
    const lowerCaseCategory = category.toLowerCase();
    const iconName = categoryIcons[lowerCaseCategory] || "box.png"; // Default icon if category not found
    return (
      <Avatar
        size={"large"}
        src={`${baseUrl}${iconName}?alt=media`}
        style={{ padding: "2px" }}
      />
    );
  };
  const handleOk = () => {
    if (actionType === "save") {
      completeWanderMutation.mutateAsync(wanderId);
    } else if (actionType === "delete") {
      deleteWanderMutation.mutateAsync(wanderId);
    }
    setIsModalVisible(false); // Close the modal
  };

  // Function to handle modal cancellation
  const handleCancel = () => {
    setIsWanderModalVisible(false); // Close the modal
  };
  // Function to handle Popover visibility for specific items
  const handlePopoverVisibleChange = (expUuid, visible) => {
    setPopoverVisible((prev) => ({
      ...prev,
      [expUuid]: visible,
    }));
  };

  const actions = [
    <Button
      disabled={wanderdata?.existingwander?.expenses?.length > 0 ? false : true}
      color="green"
      icon={<SaveTwoTone twoToneColor="green" />}
      onClick={() =>
        onActionClick(`${wanderdata?.existingwander?.wander_uuid}::save`)
      }
    >
      Complete the wander
    </Button>,
    <Button
      disabled={
        wanderdata?.existingwander?.WanderAdmin === wandererId ? false : true
      }
      danger
      icon={<DeleteTwoTone twoToneColor="red" />}
      onClick={() =>
        onActionClick(`${wanderdata?.existingwander?.wander_uuid}::delete`)
      }
    >
      Delete the wander
    </Button>,
  ];

  const formatter = (value) => <CountUp end={value} separator="," />;

  const formatExpenseContent = (expense) => {
    const orderedKeys = [
      "expenseDate", // Date
      "expenseDescription", // Description
      "expenseCategory", // Category
      "expenseAmount", // Amount
      "spendFrom", // Spend By
      "splitBy", // Split By
    ];

    // Get keys of the expense object except 'exp_uuid'
    const expenseKeys = Object.keys(expense).filter(
      (key) => key !== "exp_uuid" && key !== "key"
    );

    // Sort keys according to the order defined; other keys will follow in their original order
    const sortedKeys = [
      ...orderedKeys,
      ...expenseKeys.filter((key) => !orderedKeys.includes(key)),
    ];

    // Generate Popover content based on sorted keys
    return (
      <div>
        {sortedKeys.map((key) => (
          <p key={key}>
            <strong>
              {
                key
                  .replace(/_/g, " ") // Replace underscores with spaces
                  .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase()) // Capitalize the first letter of each word
              }
              :
            </strong>{" "}
            {expense[key].toString().includes("::")
              ? expense[key]
                  .split("::")[1]
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())
              : expense[key]
                  .toString()
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
          </p>
        ))}
        <Button type="primary" onClick={() => setPopoverVisible(false)}>
          Close
        </Button>
      </div>
    );
  };
  const onClose = () => {
    form.resetFields();
    setDrawerOpen(false);
    queryClient.invalidateQueries([
      "Wander",
      { wanderId: activewanderdata.activewanderdata[0] },
    ]);
  };

  const handleFinish = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(
          "🚀 ~ file: AddExpenses.js:18 ~ handleFinish ~ values:",
          values
        );
      })
      .catch((errorInfo) => {
        console.log("Validation Failed:", errorInfo);
      });
  };

  const handleDelete = (expUuid) => {
    console.log("Deleting expense with UUID:", expUuid);
    mutation.mutateAsync(expUuid);
  };

  const showDeleteConfirm = (expUuid) => {
    setSelectedExpUuid(expUuid);
    setIsModalVisible(true);
  };

  const sortedExpenses = wanderdata?.existingwander?.expenses.sort(
    (a, b) =>
      new Date(a.expenseDate.split("-").reverse().join("-")) -
      new Date(b.expenseDate.split("-").reverse().join("-"))
  );

  return (
    <>
      {!iswanderLoading ? (
        <>
          <Card
            actions={actions}
            size="small"
            title={wanderdata?.existingwander?.WanderName}
            bordered={true}
          >
            <PushpinTwoTone twoToneColor="red" />{" "}
            {wanderdata?.existingwander?.WanderDestination}
          </Card>
          <Row gutter={16}>
            <Col span={12}>
              <Card bordered={false} size="small">
                <Statistic
                  size="small"
                  title={
                    <div style={{ fontSize: "10px" }}>
                      <b>Wander Budget</b>
                    </div>
                  }
                  value={wanderdata?.existingwander?.WanderBudget}
                  valueStyle={{ fontSize: "16px", color: "#3f8600" }}
                  formatter={formatter}
                  prefix={<ArrowUpOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} size="small">
                <Statistic
                  size="small"
                  title={
                    <div style={{ fontSize: "10px" }}>
                      <b>Wander Utilized</b>
                    </div>
                  }
                  value={wanderdata?.existingwander?.WanderUtilized}
                  valueStyle={{ fontSize: "16px", color: "#cf1322" }}
                  formatter={formatter}
                  prefix={<ArrowDownOutlined />}
                />
              </Card>
            </Col>
          </Row>
          {wanderdata?.existingwander?.inviteWanderer?.some(
            (invite) => invite.status === "pending"
          ) ? (
            <Row gutter={16}>
              <Alert
                style={{ width: "100%" }}
                message={"Once all the wanderers accept the invitation."}
                type="warning"
              />
              {wanderdata?.existingwander?.inviteWanderer.map((invite) => (
                <Col key={invite.wander_uuid} span={24}>
                  <Badge.Ribbon
                    text={<>{invite.status}</>}
                    color={invite.status === "pending" ? "red" : "green"}
                  >
                    <Card
                      size="small"
                      title={invite.wanderer_name}
                      bordered={false}
                    ></Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={16}>
              <Col span={24}>
                <FloatButton onClick={() => setDrawerOpen(true)} size="large">
                  Add Expense
                </FloatButton>
              </Col>
              <Col span={24}>
                <List
                  style={{}}
                  itemLayout="horizontal"
                  dataSource={sortedExpenses}
                  renderItem={(expense, index) => {
                    const showDateHeader =
                      index === 0 ||
                      sortedExpenses[index - 1].expenseDate !==
                        expense.expenseDate;

                    return (
                      <>
                        {showDateHeader && (
                          <Alert
                            style={{
                              textAlign: "center",
                              height: "10px",
                              // fontSize: "10px",
                              textDecoration: "bold",
                              opacity: ".7",
                            }}
                            message={expense.expenseDate}
                            type="info"
                          />
                        )}
                        <List.Item
                          size="small"
                          actions={[
                            <Popover
                              content={formatExpenseContent(expense)}
                              title="Expense Details"
                              trigger="click"
                              visible={
                                popoverVisible[expense.exp_uuid] || false
                              }
                              onVisibleChange={(visible) =>
                                handlePopoverVisibleChange(
                                  expense.exp_uuid,
                                  visible
                                )
                              }
                            >
                              <Button
                                size="large"
                                type="link"
                                icon={
                                  popoverVisible[expense.exp_uuid] ? (
                                    <EyeInvisibleTwoTone />
                                  ) : (
                                    <EyeTwoTone />
                                  )
                                }
                              />
                            </Popover>,
                            <Button
                              size="large"
                              icon={<DeleteTwoTone twoToneColor={"red"} />}
                              style={{ border: "none" }}
                              onClick={() =>
                                showDeleteConfirm(expense.exp_uuid)
                              }
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            size="small"
                            avatar={getCategoryIcon(expense.expenseCategory)}
                            title={
                              <Tooltip title={expense.expenseDescription}>
                                <div
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "200px",
                                  }}
                                >
                                  {`${expense.expenseDescription}`}
                                </div>
                              </Tooltip>
                            }
                            description={` ${expense.expenseAmount}`}
                          />
                        </List.Item>
                      </>
                    );
                  }}
                />
                ;
              </Col>
            </Row>
          )}
        </>
      ) : (
        <>
          <Spin />
        </>
      )}
      {/* Drawer Component */}
      <AddExpenses
        isVisible={drawerOpen}
        onClose={onClose}
        wandererList={wanderdata?.existingwander?.wandererList}
        wanderId={wanderdata?.existingwander?.wander_uuid}
      />

      {/* Modal for Delete Confirmation */}
      <Modal
        title="Confirm Deletion"
        visible={isModalVisible}
        onOk={() => handleDelete(selectedExpUuid)}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ type: "primary", danger: true }}
      >
        <p>Are you sure you want to delete this expense?</p>
      </Modal>
      <Modal
        title="Confirm Action"
        visible={isWanderModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          type: "primary",
          danger: actionType === "delete", // Red button for delete
          style: {
            backgroundColor: actionType === "save" ? "green" : undefined,
          }, // Green button for save
        }}
        okText={actionType === "save" ? "Yes, Complete" : "Yes, Delete"} // Dynamic button text
      >
        <p>{modalContent}</p>
      </Modal>
    </>
  );
}

export default ActiveWanderListing;
const loadingDotsStyle = {
  display: "inline-block",
  marginLeft: "8px",
  "& .dot": {
    display: "inline-block",
    width: "4px",
    height: "4px",
    margin: "0 2px",
    backgroundColor: "black", // Customize color as needed
    borderRadius: "50%",
    animation: "dot-flashing 1s infinite linear alternate",
  },
  "@keyframes dot-flashing": {
    "0%": { opacity: 0.2 },
    "50%, 100%": { opacity: 1 },
  },
};
