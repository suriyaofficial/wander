import {
  Col,
  Row,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Button,
  DatePicker,
  Radio,
  Checkbox,
  message,
} from "antd";
import React, { useState } from "react";
import { addExpenses } from "./Services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddExpenses({ isVisible, onClose, wandererList, wanderId }) {
  const [form] = Form.useForm();
  const [spendFrom, setSpendFrom] = useState(null);
  const [splitBy, setSplitBy] = useState(null);
  const [selectedWanderers, setSelectedWanderers] = useState(
    wandererList?.map((wanderer) => wanderer.wanderer_id)
  );
  const [amounts, setAmounts] = useState({});
  const [expenseAmount, setExpenseAmount] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(expenseAmount || 0);
  const [addExpensesLoading, setAddExpensesLoading] = useState(false);
  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (payload) {
        return await addExpenses(wanderId, payload);
      }
    },
    onSuccess: () => {
      setAddExpensesLoading(false)
      form.resetFields();
      clear();
      onClose();
      message.success("Expense deleted successfully!");
    },
  });
  const handleAmountChange = (id, value) => {
    setAmounts((prevAmounts) => {
      const updatedAmounts = { ...prevAmounts, [id]: value };
      const total = Object.values(updatedAmounts).reduce(
        (sum, amt) => sum + amt,
        0
      );
      setRemainingAmount(expenseAmount - total);
      return updatedAmounts;
    });
  };
  const prepareExpenseData = async (formData) => {
    // Extracting the common fields from form data
    const {
      expenseAmount,
      expenseCategory,
      expenseDate,
      expenseDescription,
      spendFrom,
      source,
      splitBy,
    } = formData;

    // Formatting the date to DD-MM-YYYY
    const UTC = new Date(expenseDate);
    const day = String(UTC.getDate()).padStart(2, "0"); // Ensures two digits
    const month = String(UTC.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = UTC.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Initializing the expense object with common fields
    let expenseData = {
      expenseAmount,
      expenseCategory,
      expenseDate: formattedDate,
      expenseDescription,
      spendFrom,
      source,
      splitBy,
    };

    // Handle "equally" split scenario
    if (splitBy === "equally") {
      const totalWanderers = wandererList?.length; // Using wandererList to count total wanderers
      const splitAmount = (expenseAmount / totalWanderers).toFixed(2); // Calculating the equal split amount
      wandererList?.forEach((wanderer) => {
        expenseData["_" + wanderer.wanderer_name] = parseFloat(splitAmount); // Directly add split details to the main object
      });
    }

    // Handle "unequally" split scenario
    if (splitBy === "unequally") {
      wandererList?.forEach((wanderer) => {
        const wandererName = wanderer.wanderer_name;
        if (formData[wandererName] !== undefined) {
          expenseData["_" + wandererName] = formData[wandererName];
        } else {
          expenseData["_" + wandererName] = 0; // Set 0 if not present in the form data
        }
      });
    }

    console.log(expenseData);

    mutation.mutateAsync(expenseData);
  };

  // Update the handleFinish function to check expenseAmount
  const handleFinish = async () => {
    setAddExpensesLoading(true)
    form
      .validateFields()
      .then((values) => {
        const total = Object.values(amounts).reduce((sum, amt) => sum + amt, 0);
        if (
          splitBy === "unequally" &&
          expenseAmount &&
          total !== expenseAmount
        ) {
          return Promise.reject(
            new Error("Total split amount must match the expense amount")
          );
        }
        prepareExpenseData(values);
      })
      .catch((errorInfo) => {
        console.log("Validation Failed:", errorInfo);
      });
  };

  const handleSplitByChange = (e) => {
    const value = e.target.value;
    setSplitBy(value);

    if (value === "equally") {
      setSelectedWanderers([]);
      setAmounts({});
      setRemainingAmount(expenseAmount || 0);
    } else {
      // When switching to unequally, reset amounts and set remaining amount
      setAmounts({}); // This will reset all InputNumber values to 0
      setRemainingAmount(expenseAmount || 0);
    }
  };

  const handleCheckboxChange = (checkedValues) => {
    setSelectedWanderers(checkedValues);
  };

  // Function to render expense categories
  const renderExpenseCategories = () => {
    const categories = [
      "Transport",
      "Food",
      "Accommodation",
      "Groceries",
      "Shopping",
      "Activities",
      "Entertainment",
      "Drinks",
      "Flights",
      "Sightseeing",
      "Exchange Fees",
      "Health",
      "Miscellaneous",
      "Sim",
    ];

    return categories?.map((category) => (
      <Select.Option
        key={category.toLowerCase()}
        value={category.toLowerCase()}
      >
        {category}
      </Select.Option>
    ));
  };

  // Function to render Spend From options
  const renderSpendByOptions = () => {
    return (
      <>
        <Select.Option value="trip_budget">Trip Budget</Select.Option>
        {wandererList?.map((wanderer, index) => (
          <Select.Option
            key={wanderer.wanderer_id}
            value={`W${index + 1}::${wanderer.wanderer_name}`}
          >
            {wanderer.wanderer_name}
          </Select.Option>
        ))}
      </>
    );
  };

  // Function to render spend from options
  const renderSpendFromOptions = () => {
    let name = spendFrom?.split("::")[1];
    return (
      <>
        {spendFrom && spendFrom !== "trip_budget" && (
          <>
            <Select.Option value={`${spendFrom}_cash`}>
              {`${name} Cash`}
            </Select.Option>
            <Select.Option value={`${spendFrom}_card`}>
              {`${name} Card`}
            </Select.Option>
            <Select.Option value={`${spendFrom}_upi`}>
              {`${name} UPI`}
            </Select.Option>
          </>
        )}
      </>
    );
  };
  const clear = () => {
    form.resetFields();
    setSelectedWanderers([]);
    setSpendFrom(null);
    setSplitBy(null); // Add this line to reset splitBy state
    setExpenseAmount(null); // Reset expenseAmount
    setAmounts({}); // Reset amounts
    setRemainingAmount(0);
  };

  return (
    <>
      <Drawer
        title="Add Expenses"
        width={720}
        onClose={() => {
          clear();
          onClose();
        }}
        open={isVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Space
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "end",
            }}
          >
            <Button onClick={clear}>Clear</Button>
            <Button loading={addExpensesLoading} type="primary" htmlType="submit" onClick={handleFinish}>
              Apply
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" disabled={addExpensesLoading}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              {/* Expense Date */}
              <Form.Item
                name="expenseDate"
                label="Date"
                rules={[{ required: true, message: "Please select the date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* Expense Description */}
              <Form.Item
                name="expenseDescription"
                label="Expense Description"
                rules={[
                  {
                    required: true,
                    message: "Please enter the expense description",
                  },
                ]}
              >
                <Input placeholder="Enter expense description" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="expenseAmount"
                label="Expense Amount"
                rules={[
                  {
                    required: true,
                    message: "Please enter the expense amount",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Amount must be at least 1",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter Amount "
                  style={{ width: "100%" }}
                  onChange={(value) => setExpenseAmount(value)}
                />
              </Form.Item>
            </Col>
            {/* Expense Category */}
            <Col span={12}>
              <Form.Item
                name="expenseCategory"
                label="Expense Category"
                rules={[
                  { required: true, message: "Please select the category" },
                ]}
              >
                <Select placeholder="Select expense category">
                  {renderExpenseCategories()}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            {/* Spend From */}
            <Col span={12}>
              <Form.Item
                name="spendFrom"
                label="Spend From"
                rules={[{ required: true, message: "Please select who spent" }]}
              >
                <Select
                  placeholder="Select spender"
                  onChange={(value) => setSpendFrom(value)}
                >
                  {renderSpendByOptions()}
                </Select>
              </Form.Item>
            </Col>

            {/* Spend From */}
            <Col span={12}>
              <Form.Item
                name="source"
                label="Source"
                rules={[
                  {
                    required: spendFrom !== "trip_budget" ? true : false,
                    message: "Please select the payment source",
                  },
                ]}
              >
                <Select
                  disabled={spendFrom !== "trip_budget" ? false : true}
                  placeholder="Select payment source"
                >
                  {renderSpendFromOptions()}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {/* Split By */}
          <Col span={12}>
            <Form.Item
              name="splitBy"
              label="Split By"
              rules={[
                { required: true, message: "Please select split method" },
              ]}
            >
              <Radio.Group
                onChange={handleSplitByChange}
                value={splitBy}
                disabled={expenseAmount ? false : true}
              >
                <Radio.Button value="equally">Equally</Radio.Button>
                <Radio.Button value="unequally">Unequally</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>

          {/* Wanderer List with Checkboxes */}
          {splitBy === "unequally" && (
            <>
              <Form.Item
                name="selectedWanderers"
                label="Select Wanderers to Split"
                rules={[
                  {
                    validator: (_, value) =>
                      value && value.length > 0
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Please select at least one wanderer")
                          ),
                  },
                ]}
              >
                <Checkbox.Group
                  value={selectedWanderers}
                  onChange={handleCheckboxChange}
                >
                  <Row gutter={[16, 16]}>
                    {wandererList?.map((wanderer) => (
                      <Col key={wanderer.wanderer_id}>
                        <Checkbox value={wanderer.wanderer_id}>
                          {wanderer.wanderer_name}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              {selectedWanderers?.length > 0 && (
                <Form.Item
                  label="Enter Amounts for Each Wanderer"
                  rules={[
                    {
                      validator: async (_, value) => {
                        const total = Object.values(amounts).reduce(
                          (sum, amt) => sum + amt,
                          0
                        );
                        if (expenseAmount == null) {
                          return Promise.reject(
                            new Error("Expense amount is required")
                          );
                        }
                        if (total !== expenseAmount) {
                          return Promise.reject(
                            new Error(
                              "Total split amount must match the expense amount"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div>
                    {selectedWanderers.map((wandererId) => {
                      const wanderer = wandererList.find(
                        (w) => w.wanderer_id === wandererId
                      );
                      return (
                        <Form.Item
                          key={wanderer.wanderer_name}
                          label={wanderer ? wanderer.wanderer_name : ""}
                          name={wanderer.wanderer_name}
                          rules={[
                            {
                              required: true,
                              message: `Please enter amount for ${
                                wanderer ? wanderer.wanderer_name : ""
                              }`,
                            },
                          ]}
                        >
                          <InputNumber
                            key={"input"}
                            defaultValue={0}
                            value={amounts[wanderer.wanderer_name] || 0}
                            onChange={(value) =>
                              handleAmountChange(wanderer.wanderer_name, value)
                            }
                          />
                        </Form.Item>
                      );
                    })}
                    <div style={{ marginTop: 16 }}>
                      <strong>Remaining Amount to be Split: </strong>
                      <div
                        style={{
                          color: remainingAmount >= 0 ? "green" : "red",
                        }}
                      >
                        {remainingAmount}
                      </div>
                    </div>
                  </div>
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Drawer>
    </>
  );
}

export default AddExpenses;
