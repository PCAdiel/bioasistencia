export type Role = "admin" | "docente";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Student = {
  id: string;
  dni: string;
  institutional_code: string;
  first_names: string;
  last_names: string;
  status: "active" | "inactive";
  consent_at: string | null;
  has_biometric: boolean;
  created_at: string;
};
