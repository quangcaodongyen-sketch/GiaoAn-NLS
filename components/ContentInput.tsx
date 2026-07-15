import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, CheckCircle, FileText, FileUp, AlertCircle } from 'lucide-react';
import { OriginalDocxFile } from '../types';

interface ContentInputProps {
  lessonContent: string;
  setLessonContent: (val: string) => void;
  distributionContent: string;
  setDistributionContent: (val: string) => void;
  // Callback để lưu file DOCX gốc cho XML Injection
  onOriginalDocxLoaded?: (file: OriginalDocxFile | null) => void;
}

// Khai báo thư viện ngoại
declare const mammoth: any;
declare const pdfjsLib: any;

const ContentInput: React.FC<ContentInputProps> = ({
  lessonContent,
  setLessonContent,
  distributionContent,
  setDistributionContent,
  onOriginalDocxLoaded
}) => {
  const lessonInputRef = useRef<HTMLInputElement>(null);
  const distInputRef = useRef<HTMLInputElement>(null);

  const [processingLesson, setProcessingLesson] = useState(false);
  const [processingDist, setProcessingDist] = useState(false);

  const [lessonFileName, setLessonFileName] = useState<string | null>(null);
  const [distFileName, setDistFileName] = useState<string | null>(null);

  const processFile = async (file: File, isLesson: boolean) => {
    const setProcessing = isLesson ? setProcessingLesson : setProcessingDist;
    const setContent = isLesson ? setLessonContent : setDistributionContent;
    const setFileName = isLesson ? setLessonFileName : setDistFileName;

    setProcessing(true);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let text = "";

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(arrayBuffer);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        text = await extractTextFromDOCX(arrayBuffer);
        // Lưu file DOCX gốc cho XML Injection (chỉ với file giáo án)
        if (isLesson) {
          onOriginalDocxLoaded?.({ arrayBuffer, fileName: file.name });
        }
      } else {
        alert("Định dạng file không được hỗ trợ. Vui lòng chọn PDF hoặc DOCX.");
        setFileName(null);
        setProcessing(false);
        return;
      }

      if (!text.trim()) {
        alert("Không thể đọc được nội dung văn bản từ file này. Có thể file chứa ảnh scan?");
        setFileName(null);
      } else {
        setContent(text);
      }

    } catch (error) {
      console.error("Error processing file:", error);
      alert("Có lỗi xảy ra khi đọc file.");
      setFileName(null);
    } finally {
      setProcessing(false);
    }
  };

  const extractTextFromDOCX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    if (typeof mammoth === 'undefined') return "";
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    if (typeof pdfjsLib === 'undefined') return "";
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    return fullText;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isLesson: boolean) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, isLesson);
    e.target.value = '';
  };

  // Component hiển thị ô upload
  const UploadBox = ({
    title,
    subTitle,
    inputRef,
    fileName,
    isProcessing,
    isLesson,
    hasContent
  }: {
    title: string,
    subTitle: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
    fileName: string | null,
    isProcessing: boolean,
    isLesson: boolean,
    hasContent: boolean
  }) => (
    <div
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative
        ${hasContent ? 'border-green-300 bg-green-50' : 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleFileChange(e, isLesson)}
        accept=".pdf,.docx"
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex flex-col items-center animate-pulse py-2">
          <Loader2 className="text-blue-600 animate-spin mb-2" size={32} />
          <p className="text-sm font-medium text-blue-900">Đang đọc file...</p>
        </div>
      ) : hasContent ? (
        <div className="flex flex-col items-center py-2">
          <div className="p-3 bg-white rounded-full shadow-sm mb-2">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <p className="text-sm font-bold text-green-800 break-all px-4">{fileName}</p>
          <p className="text-xs text-green-600 mt-1">Đã tải lên thành công. Nhấn để thay đổi.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center py-2">
          <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            {isLesson ? <FileText className="text-blue-500" size={28} /> : <FileUp className="text-indigo-500" size={28} />}
          </div>
          <p className="text-base font-semibold text-slate-800">{title}</p>
          <p className="text-sm text-slate-500 mt-1">{subTitle}</p>
          <p className="text-xs text-blue-400 mt-3 bg-white px-2 py-1 rounded border border-blue-100">Hỗ trợ .docx, .pdf</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
      <div className="flex items-center mb-6">
        <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
        <h2 className="text-lg font-semibold text-blue-900">Tài liệu đầu vào</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ô Upload Giáo án */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 flex items-center">
            <span className="text-red-500 mr-1">*</span> File Giáo án
          </label>
          <UploadBox
            title="Tải lên Giáo án"
            subTitle="Giáo án bài dạy cần tích hợp"
            inputRef={lessonInputRef}
            fileName={lessonFileName}
            isProcessing={processingLesson}
            isLesson={true}
            hasContent={!!lessonContent}
          />
          {!lessonContent && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertCircle size={12} className="mr-1" /> Bắt buộc
            </p>
          )}
        </div>

        {/* Ô Upload PPCT */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            File Phân phối chương trình
          </label>
          <UploadBox
            title="Tải lên PPCT"
            subTitle="Tài liệu tham khảo năng lực (nếu có)"
            inputRef={distInputRef}
            fileName={distFileName}
            isProcessing={processingDist}
            isLesson={false}
            hasContent={!!distributionContent}
          />
          <p className="text-xs text-slate-500 mt-1">Tùy chọn. Giúp AI xác định năng lực chính xác hơn.</p>
        </div>
      </div>
    </div>
  );
};

export default ContentInput;