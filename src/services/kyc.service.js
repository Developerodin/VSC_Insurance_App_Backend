import axios from 'axios';

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/verification';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-client-id': CASHFREE_CLIENT_ID,
    'x-client-secret': CASHFREE_CLIENT_SECRET,
  };
}

export async function initiateAadhaarOtp(aadhaarNumber) {
  const url = `${CASHFREE_BASE_URL}/offline-aadhaar/otp`;
  const response = await axios.post(
    url,
    { aadhaar_number: aadhaarNumber },
    { headers: getHeaders() }
  );
  return response.data;
}

export async function verifyAadhaarOtp(refId, otp) {
  const url = `${CASHFREE_BASE_URL}/offline-aadhaar/verify`;
  const response = await axios.post(
    url,
    { ref_id: refId, otp },
    { headers: getHeaders() }
  );
  return response.data;
}

export async function verifyPan(pan, name) {
  const url = `${CASHFREE_BASE_URL}/pan`;
  const response = await axios.post(
    url,
    { pan, name },
    { headers: getHeaders() }
  );
  return response.data;
} 