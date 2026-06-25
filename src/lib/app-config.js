import _ from "lodash";

const DevHost = [
  "localhost",
  "https://alitinvoiceappapi.azurewebsites.net",
  "https://alitinvoiceappapi.azurewebsites.net"
];

const StagHost = [
  "https://alitinvoiceappapi.azurewebsites.net",
  "https://alitinvoiceappapi.azurewebsites.net"
];

const LiveHost = [
  "https://alitinvoiceappapi.azurewebsites.net",
  "https://alitinvoiceappapi.azurewebsites.net"
];

const hostname = window.location.hostname;

const s3_url = ""
const s3_prefix = ""

const regex =
  /(192)\.(168)(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){2}$/gm;

const live = {
  api_baseurl: "https://alitinvoiceappapi.azurewebsites.net/api",
  baseurl: "https://alitinvoiceappapi.azurewebsites.net/api",
  socketurl: "",
  s3_url: "",
  s3_prefix: "",
  environment: 'live',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "en",
  },
};

const dev = {
  baseurl: `https://alitinvoiceappapi.azurewebsites.net/api/`,
  api_baseurl: `https://alitinvoiceappapi.azurewebsites.net/api/`,
  socketurl: "",
  s3_url,
  s3_prefix,
  environment: 'dev',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "en",
    "Authorization": "Arjun"
  },
};

const stag = {
  baseurl: `https://alitinvoiceappapi.azurewebsites.net/api/`,
  api_baseurl: `https://alitinvoiceappapi.azurewebsites.net/api/`,
  socketurl: "",
  s3_url: "",
  s3_prefix: "",
  environment: 'stag',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "en",
  },
};

const AppConfig = _.includes(DevHost, hostname) || hostname.match(regex)
  ? dev
  : _.includes(LiveHost, hostname)
    ? live
    : _.includes(StagHost, hostname)
      ? stag
      : dev;

export default AppConfig;
