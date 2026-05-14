export const sharedRecordFieldLabels = {
  actions: "操作",
  invoiceDate: "发票日期",
  invoiceNumberString: "发票号",
  remark: "备注",
};

export const hospitalityRecordFieldLabels = {
  ...sharedRecordFieldLabels,
  receptionDate: "招待日期",
  counterparty: "招待对象",
  department: "报销部门",
  handlerName: "经手人",
  hospitalityType: "接待类型",
  location: "地点",
  invoiceAmount: " 发票金额（元）",
  totalAmount: "总接待金额（含酒水）",
  theirCount: " 来访人数",
  ourCount: "我方人数",
  totalCount: "合计人数",
  perCapitaAmount: "人均金额",
  ourHostPosition: "我方主持人员职务",
  theirHostPosition: "对方主持人员职务",
  deptHeadApprovalDate: "部门负责人审批日期",
  partySecretaryApprovalDate: " 党总支书记（分管领导）审批日期",
  itemName: "物品名称",
  itemUnitPrice: "物品单价(元)",
  itemQuantity: "物品数量",
  itemLineTotal: "物品总价(元)",
  itemSpecification: "规格",
  items: "领用物品明细",
};

export const usageRecordFieldLabels = {
  ...sharedRecordFieldLabels,
  usageDate: "领用日期",
  department: "部门",
  counterparty: "招待对象",
  recipient: "领用人",
  purchaseAllocations: "领用明细",
  hospitalityRecordId: "招待记录",
  createdAt: "创建时间",
};

export const purchaseRecordFieldLabels = {
  ...sharedRecordFieldLabels,
  purchaseCategory: "采购类别",
  supplier: "供应商",
  productName: "品名",
  specification: "规格",
  unitPrice: "单价（元）",
  purchasedQuantity: "采购数量",
  remainingQuantity: "剩余数量",
  totalAmount: "总金额（元）",
  applicationDate: "申请日期",
  purchaseDate: "采购日期",
};

const recordFieldLabels = {
  shared: sharedRecordFieldLabels,
  hospitality: hospitalityRecordFieldLabels,
  purchase: purchaseRecordFieldLabels,
  usage: usageRecordFieldLabels,
};

export default recordFieldLabels;
