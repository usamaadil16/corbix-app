export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  visible: boolean;
  has_page: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

export type Lead = {
  id: string;
  client_name: string;
  company_name: string;
  phone: string;
  email: string;
  service_requested: string;
  source_page: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
};

export type Client = {
  id: string;
  lead_id: string | null;
  client_name: string;
  company_name: string;
  phone: string;
  email: string;
  created_at: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type DocumentType = "quotation" | "proposal" | "invoice";
export type DocumentStatus = "draft" | "sent" | "accepted" | "paid";

export type Document = {
  id: string;
  client_id: string;
  type: DocumentType;
  status: DocumentStatus;
  line_items: LineItem[];
  terms: string;
  notes: string;
  valid_until: string | null;
  parent_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgramType = "Citizenship" | "Residence";

export type Program = {
  id: string;
  country: string;
  region: string;
  type: ProgramType;
  service_type: string;
  minimum_capital: string;
  key_benefit: string;
  sort_order: number;
  visible: boolean;
};

export type PageContent = {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
  updated_at?: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  description: string;
  link: string | null;
  visible: boolean;
  sort_order: number;
};

export type Career = {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  visible: boolean;
  sort_order: number;
};

export type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  alt_text: string;
  category: string;
  created_at: string;
};
