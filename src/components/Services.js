import axios from "axios";
const BASE_URL = "http://localhost:3100";
export async function getInvites(wandererId) {
  const requestUrl = `${BASE_URL}/wander/inivitation?wandererId=${wandererId}`;
  // const requestUrla = `${API_BASE_URL}/wander/inivitation?wandererId=${wandererId}`;
  try {
    const options = {
      method: "GET",
      // body: JSON.stringify(newAccountRequest),
    };
    const response = await fetch(requestUrl, options);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function getActiveWander(wandererId) {
  const requestUrl = `${BASE_URL}/active/wander?wandererId=${wandererId}`;
  try {
    const options = {
      method: "GET",
      // body: JSON.stringify(newAccountRequest),
    };
    const response = await fetch(requestUrl, options);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function apiAcceptInvite(wandererId, body) {
  console.log("🚀 ~ file: Services.js:28 ~ apiAcceptInvite ~ body:", body);
  console.log(
    "🚀 ~ file: Services.js:28 ~ apiAcceptInvite ~ wandererId:",
    wandererId
  );
  const requestUrl = `${BASE_URL}/accept/wander/inivitation?wanderer_id=${wandererId}`;
  try {
    const options = {
      method: "PUT",
      body: JSON.stringify(body),
    };
    console.log(
      "🚀 ~ file: Services.js:36 ~ apiAcceptInvite ~ options:",
      options
    );
    const response = axios.put(requestUrl, body);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}

export async function CreateWanderApi(wandererId, body) {
  console.log("🚀 ~ file: Services.js:28 ~ apiAcceptInvite ~ body:", body);
  console.log(
    "🚀 ~ file: Services.js:28 ~ apiAcceptInvite ~ wandererId:",
    wandererId
  );
  const requestUrl = `${BASE_URL}/create_wander?wanderer_id=${wandererId}`;
  try {
    const options = {
      method: "PUT",
      body: JSON.stringify(body),
    };
    console.log(
      "🚀 ~ file: Services.js:36 ~ apiAcceptInvite ~ options:",
      options
    );
    const response = axios.post(requestUrl, body);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}

export async function getWander(wanderId) {
  console.log("🚀 ~ file: Services.js:61 ~ getWander ~ wanderId:", wanderId);
  const requestUrl = `${BASE_URL}/wander?wanderId=${wanderId}`;
  try {
    const options = {
      method: "GET",
      // body: JSON.stringify(newAccountRequest),
    };
    const response = await fetch(requestUrl, options);
    // console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}

export async function addExpenses(wanderId, payload) {
  console.log("🚀 ~ file: Services.js:87 ~ addExpenses ~ payload:", payload);
  const requestUrl = `${BASE_URL}/addExpense?wander_id=${wanderId}`;
  try {
    const options = {
      method: "POST",
      body: JSON.stringify(payload),
    };
    console.log(
      "🚀 ~ file: Services.js:36 ~ apiAcceptInvite ~ options:",
      options
    );
    const response = axios.post(requestUrl, payload);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function deleteExpenses(wanderId, expId) {
  console.log("🚀 ~ file: Services.js:87 ~  ~ expId:", expId);
  const requestUrl = `${BASE_URL}/deleteExpense?wander_id=${wanderId}&exp_id=${expId}`;
  try {
    const response = axios.delete(requestUrl);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function completeWander(wander, wanderId) {
  console.log("🚀 ~ file: Services.js:113 ~ completeWander ~ List:", wander);
  const requestUrl = `${BASE_URL}/completeWander?wander_id=${wanderId}`;
  try {
    const response = axios.post(requestUrl, wander);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function deleteWander(wander, wanderId) {
  console.log("🚀 ~ file: Services.js:122 ~ deleteWander ~ wander:", wander);
  console.log(
    "🚀 ~ file: Services.js:122 ~ deleteWander ~ wanderId:",
    wanderId
  );
  console.log("🚀 ~ file: Services.js:113 ~ completeWander ~ List:", wander);
  const requestUrl = `${BASE_URL}/deleteWander?wander_id=${wanderId}`;
  try {
    const response = axios.post(requestUrl, wander);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
export async function getALLWander(wandererId) {
  const requestUrl = `${BASE_URL}/all/wander?wandererId=${wandererId}`;
  try {
    const options = {
      method: "GET",
      // body: JSON.stringify(newAccountRequest),
    };
    const response = await fetch(requestUrl, options);
    //   console.log("🚀 ~ file: Services.js:11 ~ getInvites ~ response:", response.json())
    return response;
  } catch (err) {}
}
