export const sharedButtonLabels = {
  search: "查询",
  reset: "重置",
  advancedSearch: "高级搜索",
  createUsageRecord: "新建领用记录",
  exportExcel: "导出 Excel",
};

export const purchaseButtonLabels = {
  ...sharedButtonLabels,
  createPurchaseRecord: "新建采购记录",
};

export const usageButtonLabels = {
  ...sharedButtonLabels,
};

export const hospitalityButtonLabels = {
  ...sharedButtonLabels,
  createRecord: "新建记录",
};

export const masterDataButtonLabels = {
  ...sharedButtonLabels,
  create: "新建",
  importExcel: "导入Excel",
};

const buttonLabels = {
  shared: sharedButtonLabels,
  purchase: purchaseButtonLabels,
  usage: usageButtonLabels,
  hospitality: hospitalityButtonLabels,
  masterData: masterDataButtonLabels,
};

export default buttonLabels;
