const API = {
  SIGN_UP: `/Auth/Signup`,
  LOGIN: `/Auth/Login`,
  INITIAL_ITEM: `Item`,
  ITEM_GET_LIST: `Item/GetList`,
  ITEM_GET_LOOKUP_LIST: `Item/GetLookupList`,
  ITEM_INSERT_UPDATE: `Item/InsertUpdate`,
  ITEM_DELETE: `Item/Delete`,

  UPLOAD_ITEM_IMAGE: `Item/UpdateItemPicture`,
  GET_THUMBNIL:  `Item/Picture`,

  INVOICE_GET_LIST: `Invoice/GetList`,
  INVOICE_GET_METRICS: `Invoice/GetMetrices`,
  INVOICE_GET_TREND_12M: `Invoice/GetTrend12m`,
  INVOICE_TOP_ITEMS: `Invoice/TopItems`,
  INVOICE_INSERT_UPDATE: `Invoice/`, // `Invoice/InsertUpdate`,
  INVOICE_DELETE: `Invoice`,

  DOWNLOAD_PRINT_INVOICE: `Invoice` , // `Invoice/print`, // /invoice/printview
};
export default { ...API };
