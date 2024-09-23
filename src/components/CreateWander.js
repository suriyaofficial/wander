import React, { useState } from "react";
import axios from "axios";
import { PlusCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Tabs,
} from "antd";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import { CreateWanderApi } from "./Services";
import { BASE_URL } from "../common.ts";

function CreateWander() {
  const [form] = Form.useForm();
  const { Option } = Select;
  const [open, setOpen] = useState(false);
  const [wanderType, setWanderType] = useState("GroupWander");
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const wandererId = JSON.parse(localStorage.getItem("user")).wandererId;
  const wandererName = JSON.parse(localStorage.getItem("user")).wanderer;
  const wandererPhoto = JSON.parse(localStorage.getItem("user")).wandererPhoto;

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleTabChange = (key) => {
    setWanderType(key);
  };

  function transformInviteWanderer(inviteWanderer) {
    return inviteWanderer.map(({ label, value }) => ({
      wanderer_name: label,
      wanderer_id: value.split("::")[0],
      wandererPhoto: value.split("::")[1],
      status: "pending",
    }));
  }
  function wandererList(inviteMember) {
    let wandererListMap = inviteMember.map(({ label, value }) => ({
      wanderer_name: label.replaceAll(" ", "_"),
      wanderer_id: value.split("::")[0],
      wanderer_photo: value.split("::")[1],
    }));
    wandererListMap.push({
      wanderer_name: wandererName.replaceAll(" ", "_"),
      wanderer_id: wandererId,
      wanderer_photo: wandererPhoto,
    });
    return wandererListMap;
  }

  const handleFinish = () => {
    form
      .validateFields()
      .then((values) => {
        onFinish(values);
      })
      .catch((errorInfo) => {
        console.log("Validation Failed:", errorInfo);
      });
  };

  const onFinish = async (values) => {
    message.open({
      type: "loading",
      content: "Wander creating ...",
      duration: 0,
    });
    const loadingMessage = message.loading("Wander creating ...", 0); // Persistent loading message
    try {
      const body = {
        wanderType,
        WanderName: values.GroupWanderName,
        WanderDestination: values.GroupWanderDestination,
        WanderBudget: values.GroupWanderBudget,
        inviteWanderer: transformInviteWanderer(values.inviteWanderer),
        wandererList: wandererList(values.inviteWanderer),
      };
      console.log("🚀 ~ file: CreateWander.js:60 ~ onFinish ~ body:", body);
      const response = await CreateWanderApi(wandererId, body);
      message.destroy();
      message.success("Wander Created successful!", 2); // Success message
      form.resetFields();
      onClose();
      setTimeout(() => {
        window.location.reload(); // Reload after success
      }, 2000);
      console.log("Form submitted successfully:", response);
    } catch (error) {
      message.error("Wander Creating failed. Please try again.", 2); // Error message
      console.log("Error submitting form:", error);
    }
  };

  const fetchOptions = debounce(async (value) => {
    if (emailRegex.test(value)) {
      setFetching(true);
      const response = await axios.get(
        `${BASE_URL}/wanderer?wandererId=${value}`
      );

      setOptions([
        {
          label: response.data.wanderer,
          value: `${response.data.wandererId}::${response.data.wandererPhoto}`,
        },
      ]);
      setFetching(false);
    }
  }, 800);

  const handleSearch = (value) => {
    let Value = value.toLowerCase();
    if (Value && !Value.includes("@")) {
      Value += "@gmail.com";
    }
    if (Value && Value.includes("@gmail.com")) {
      fetchOptions(Value);
    }
    if (!Value) {
      setOptions([]);
    }
  };

  return (
    <div>
      <Button
        style={{ fontSize: "30px", padding: "20px", height: "60px" }}
        size="large"
        onClick={showDrawer}
        icon={<PlusCircleTwoTone style={{ fontSize: "30px" }} />}
      >
        Create Wander
      </Button>
      <Drawer
        title="Create Wander"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Space
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginBottom: "100px",
            }}
          >
            <Button size="large" onClick={() => form.resetFields()}>
              Clear
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              onClick={handleFinish}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Tabs
          type="card"
          defaultActiveKey="GroupWander"
          onChange={handleTabChange}
        >
          <Tabs.TabPane disabled tab="SoloWander" key="Solo Wander">
            <Form form={form} layout="vertical">
              <Form.Item
                name="soloTripName"
                label="Trip Name"
                rules={[
                  { required: true, message: "Please enter the trip name" },
                ]}
              >
                <Input placeholder="Enter solo trip name" />
              </Form.Item>

              <Form.Item
                name="soloDestination"
                label="Destination"
                rules={[
                  { required: true, message: "Please enter the destination" },
                ]}
              >
                <Input placeholder="Enter destination" />
              </Form.Item>

              <Form.Item
                name="soloStartDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select the start date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Group Wander" key="GroupWander">
            <Form form={form} layout="vertical">
              <Form.Item
                name="GroupWanderName"
                label="Wander Group Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter the group trip name",
                  },
                ]}
              >
                <Input placeholder="Enter group trip name" />
              </Form.Item>

              <Form.Item
                name="GroupWanderDestination"
                label="Wander Destination"
                rules={[
                  { required: true, message: "Please enter the destination" },
                ]}
              >
                <Input placeholder="Enter destination" />
              </Form.Item>

              <Form.Item
                name="GroupWanderBudget"
                label="Wander Budget"
                rules={[{ required: true, message: "Please enter the budget" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter budget"
                  inputMode="numeric"
                />
              </Form.Item>

              <Form.Item
                name="inviteWanderer"
                label="Invite Wanderer"
                rules={[
                  { required: true, message: "Please enter the group members" },
                ]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  labelInValue
                  placeholder="Search and select email"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={true}
                  onSearch={handleSearch}
                  style={{ width: "100%" }}
                  options={options.length > 0 ? options : []}
                />
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
}

export default CreateWander;
