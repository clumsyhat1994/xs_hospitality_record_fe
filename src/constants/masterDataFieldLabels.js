export const activeStatusLabels = {
  enabled: "启用",
  disabled: "停用",
  clickToEnable: "点击启用",
  clickToDisable: "点击停用",
};

export const sharedMasterDataFieldLabels = {
  active: "状态",
};

export const departmentFieldLabels = {
  ...sharedMasterDataFieldLabels,
  name: "部门名称",
  code: "编码",
  sortOrder: "显示顺序",
};

export const counterpartyFieldLabels = {
  ...sharedMasterDataFieldLabels,
  name: "公司名称",
  roles: "角色",
  types: "归属地",
};

export const userFieldLabels = {
  ...sharedMasterDataFieldLabels,
  username: "用户名",
  password: "密码",
  newPassword: "新密码",
  department: "部门",
  roles: "角色",
};

export const perCapitaLimitFieldLabels = {
  ...sharedMasterDataFieldLabels,
  typeName: "招待类型",
  gradeName: "职级",
  maxPerCapita: "人均标准（元）",
};

const masterDataFieldLabels = {
  shared: sharedMasterDataFieldLabels,
  activeStatus: activeStatusLabels,
  department: departmentFieldLabels,
  counterparty: counterpartyFieldLabels,
  user: userFieldLabels,
  perCapitaLimit: perCapitaLimitFieldLabels,
};

export default masterDataFieldLabels;
