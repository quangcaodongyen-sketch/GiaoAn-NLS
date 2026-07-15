

export enum Subject {
  TOAN = "Toán",
  VAN = "Ngữ Văn",
  LY = "Vật Lí",
  HOA = "Hóa Học",
  SINH = "Sinh Học",
  ANH = "Tiếng Anh",
  SU = "Lịch Sử",
  DIA = "Địa Lí",
  GDCD = "GDCD",
  CONG_NGHE = "Công Nghệ",
  TIN = "Tin Học",
  THE_DUC = "Thể Dục",
  NQTN = "Nghệ thuật",
  HDKH = "Hoạt động trải nghiệm",
  GDQPAN = "Giáo dục Quốc phòng - An ninh",
  GDDP = "Giáo dục Địa phương"
}

export interface LessonInfo {
  subject: Subject;
  grade: number;
  content: string;
  distributionContent?: string; // Nội dung phân phối chương trình
}

// Interface lưu trữ file DOCX gốc cho XML Injection
export interface OriginalDocxFile {
  arrayBuffer: ArrayBuffer;
  fileName: string;
}

export interface ProcessingOptions {
  analyzeOnly: boolean;
  detailedReport: boolean;
  comparisonExport: boolean;
  apiKey?: string;
}

export interface GeminiResponse {
  rawText: string;
}
