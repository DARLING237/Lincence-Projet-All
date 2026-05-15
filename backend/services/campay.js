/**
 * CamPay Payment Service
 * Intégration avec CamPay API pour Orange Money & MTN MoMo au Cameroun
 * Docs: https://www.campay.net
 */
const axios = require("axios");

const BASE_URL = process.env.CAMPAY_ENV === "production"
  ? "https://www.campay.net"
  : "https://demo.campay.net";

const CAMPAY_USER = process.env.CAMPAY_USERNAME || "";
const CAMPAY_PASS = process.env.CAMPAY_PASSWORD || "";

let _token = null;
let _tokenExpires = 0;

/**
 * S'authentifier et récupérer un token CamPay
 */
async function getAuth() {
  if (_token && Date.now() < _tokenExpires) return _token;

  const res = await axios.post(`${BASE_URL}/api/token/`, {
    username: CAMPAY_USER,
    password: CAMPAY_PASS,
  }, { headers: { "Content-Type": "application/json" } });

  _token = res.data.token;
  _tokenExpires = Date.now() + 55 * 60 * 1000; // 55 min
  return _token;
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${_token}`,
});

/**
 * Collect Payment (tirer l'argent du client)
 * @param {string} phone - Format: 2376XXXXXXXX
 * @param {string} amount - Montant en XAF
 * @param {string} description - Description de la transaction
 * @param {string} externalRef - Référence externe (ex: CMD-123)
 * @returns {Promise<{reference, status, operator, operator_reference, ussd_code}>}
 */
async function collectPayment({ phone, amount, description, externalRef }) {
  const token = await getAuth();
  const res = await axios.post(`${BASE_URL}/api/collect/`, {
    amount: String(amount),
    currency: "XAF",
    from: phone,
    description,
    external_reference: externalRef || "",
  }, { headers: authHeaders() });

  return res.data;
}

/**
 * Vérifier le statut d'une transaction
 * @param {string} reference - UUID de transaction CamPay
 */
async function checkTransaction(reference) {
  const token = await getAuth();
  const res = await axios.get(`${BASE_URL}/api/transaction/${reference}/`, {
    headers: authHeaders(),
  });
  return res.data;
}

/**
 * Récupérer le solde du wallet CamPay
 * @returns {Promise<{total_balance, mtn_balance, orange_balance, currency}>}
 */
async function getBalance() {
  const token = await getAuth();
  const res = await axios.get(`${BASE_URL}/api/balance/`, {
    headers: authHeaders(),
  });
  return res.data;
}

/**
 * Obtenir l'USSD à afficher pour le client selon l'opérateur
 * Le client compose le code USSD pour approuver le paiement
 */
function getUssdInstructions(operator) {
  if (operator === "ORANGE_CM") {
    return {
      code: "*150#",
      message: "Appuyez votre code PIN Orange Money après l'invite USSD ou composez *150*1*1#",
    };
  }
  if (operator === "MTN_CM") {
    return {
      code: "*126#",
      message: "Appuyez votre code PIN MTN MoMo après l'invite USSD ou composez *126*1*1#",
    };
  }
  return { code: null, message: "Suivez les instructions sur votre téléphone" };
}

module.exports = {
  collectPayment,
  checkTransaction,
  getBalance,
  getUssdInstructions,
};
