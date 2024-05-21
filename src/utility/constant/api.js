const apiPath = process.env.NEXT_PUBLIC_API_PATH;

export const APIPath = {
  basePath: apiPath,

  images: "SBR/ConImages",
  saveDefects: "SBR/Image",
  audits: "SBR/AuditData",

  login: `Supplier/ValidateToken`,
};
