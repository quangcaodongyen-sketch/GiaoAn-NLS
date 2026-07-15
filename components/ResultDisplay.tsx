import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  UnderlineType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType
} from 'docx';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { OriginalDocxFile } from '../types';
import html2pdf from 'html2pdf.js';
import { useAuthStore } from '../store/authStore';
import { MockDB } from '../services/mockDb';

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
  originalDocx?: OriginalDocxFile | null;
}

// Interface cho các section NLS đã parse
interface NLSSection {
  marker: string;  // Ví dụ: "HOẠT_ĐỘNG_1", "MỤC_TIÊU"
  content: string;
  searchPatterns: string[]; // Các pattern để tìm trong file gốc
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading, originalDocx }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const { user } = useAuthStore();

  // Parse tất cả các section NLS từ kết quả AI (supports both Vietnamese NLS_ and English DC_ markers)
  const parseAllNLSSections = (content: string): NLSSection[] => {
    const sections: NLSSection[] = [];

    // Regex để tìm tất cả các section: ===NLS_XXX=== hoặc ===DC_XXX=== ... ===END===
    const sectionRegex = /===(NLS|DC)_([^=]+)===([\s\S]*?)===END===/g;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const prefix = match[1]; // NLS or DC
      const marker = match[2].trim();
      const sectionContent = match[3].trim();

      // Xác định search patterns dựa trên marker
      let searchPatterns: string[] = [];

      // ================== VIETNAMESE NLS MARKERS ==================
      if (prefix === 'NLS') {
        if (marker === 'MỤC_TIÊU') {
          // Chèn NLS Mục tiêu SAU phần "Năng lực chung" hoặc "3. Thái độ" trong I. MỤC TIÊU
          searchPatterns = [
            // Ưu tiên tìm "Năng lực chung" hoặc "Năng lực" trong phần mục tiêu
            'Năng lực chung', 'năng lực chung', 'NĂNG LỰC CHUNG',
            'Năng lực:', 'năng lực:', '3. Năng lực',
            // Tìm "Thái độ" hoặc "Phẩm chất" - thường ở sau phần năng lực
            '3. Thái độ', 'c) Thái độ', 'c. Thái độ',
            'Thái độ', 'thái độ', 'THÁI ĐỘ',
            'Phẩm chất', 'phẩm chất', 'PHẨM CHẤT',
            // Fallback - tìm phần mục tiêu chung
            'I. MỤC TIÊU', 'I. Mục tiêu', '1. Kiến thức', 'a) Kiến thức'
          ];
        }
        // Parse format: HOẠT_ĐỘNG_X hoặc HOẠT_ĐỘNG_X_VỊ_TRÍ
        else if (marker.startsWith('HOẠT_ĐỘNG_')) {
          const parts = marker.replace('HOẠT_ĐỘNG_', '').split('_');
          const actNum = parts[0]; // Số hoạt động
          const subPart = parts.slice(1).join('_'); // VỊ_TRÍ: NỘI_DUNG, SẢN_PHẨM, TỔ_CHỨC, BƯỚC_X...

          // Tìm Hoạt động X trước
          const actPatterns = [
            `Hoạt động ${actNum}:`, `Hoạt động ${actNum}.`, `Hoạt động ${actNum} `,
            `**Hoạt động ${actNum}`, `HOẠT ĐỘNG ${actNum}`, `HĐ ${actNum}:`,
            `Hoạt động ${actNum}`, `HĐ${actNum}`, `hoạt động ${actNum}`
          ];

          // Ánh xạ VỊ_TRÍ sang search patterns linh hoạt
          if (subPart === 'NỘI_DUNG') {
            searchPatterns = [
              ...actPatterns,
              'b) Nội dung', 'b. Nội dung', 'Nội dung:', 'b)Nội dung',
              '* Nội dung', '- Nội dung', 'NỘI DUNG'
            ];
          } else if (subPart === 'SẢN_PHẨM') {
            searchPatterns = [
              ...actPatterns,
              'c) Sản phẩm', 'c. Sản phẩm', 'Sản phẩm:', 'c)Sản phẩm',
              '* Sản phẩm', '- Sản phẩm', 'SẢN PHẨM'
            ];
          } else if (subPart === 'TỔ_CHỨC') {
            searchPatterns = [
              ...actPatterns,
              'd) Tổ chức thực hiện', 'd. Tổ chức thực hiện', 'd)Tổ chức',
              'Tổ chức thực hiện', 'd) Tổ chức', 'd. Tổ chức',
              '* Tổ chức', 'TỔ CHỨC THỰC HIỆN'
            ];
          } else if (subPart === 'MỤC_TIÊU_HĐ') {
            searchPatterns = [
              ...actPatterns,
              'a) Mục tiêu', 'a. Mục tiêu', 'Mục tiêu:', 'a)Mục tiêu',
              '* Mục tiêu', '- Mục tiêu'
            ];
          } else if (subPart === 'BƯỚC_1') {
            searchPatterns = [
              ...actPatterns,
              'Bước 1:', 'Bước 1.', 'Bước 1 ', 'bước 1',
              'Giao nhiệm vụ', 'Chuyển giao nhiệm vụ', 'Chuyển giao'
            ];
          } else if (subPart === 'BƯỚC_2') {
            searchPatterns = [
              ...actPatterns,
              'Bước 2:', 'Bước 2.', 'Bước 2 ', 'bước 2',
              'Thực hiện nhiệm vụ', 'HS thực hiện'
            ];
          } else if (subPart === 'BƯỚC_3') {
            searchPatterns = [
              ...actPatterns,
              'Bước 3:', 'Bước 3.', 'Bước 3 ', 'bước 3',
              'Báo cáo', 'Thảo luận', 'Trình bày', 'báo cáo, thảo luận'
            ];
          } else if (subPart === 'BƯỚC_4' || subPart === 'KẾT_LUẬN') {
            searchPatterns = [
              ...actPatterns,
              'Bước 4:', 'Bước 4.', 'Bước 4 ', 'bước 4',
              'Kết luận', 'Nhận định', 'Đánh giá', 'kết luận, nhận định',
              'Kết luận, nhận định'
            ];
          } else {
            // Fallback cho HOẠT_ĐỘNG_X chung (không có VỊ_TRÍ cụ thể)
            searchPatterns = actPatterns;
          }
        }
        // Backward compatibility với format cũ
        else if (marker === 'NỘI_DUNG') {
          searchPatterns = ['b) Nội dung', 'b. Nội dung', 'Nội dung:'];
        } else if (marker === 'BƯỚC_1') {
          searchPatterns = ['Bước 1:', 'Giao nhiệm vụ', 'Chuyển giao nhiệm vụ'];
        } else if (marker === 'BƯỚC_2') {
          searchPatterns = ['Bước 2:', 'Thực hiện nhiệm vụ', 'HS thực hiện'];
        } else if (marker === 'BƯỚC_3') {
          searchPatterns = ['Bước 3:', 'Báo cáo', 'Thảo luận'];
        } else if (marker === 'BƯỚC_4') {
          searchPatterns = ['Bước 4:', 'Kết luận', 'Nhận định'];
        } else if (marker === 'CỦNG_CỐ') {
          searchPatterns = ['Củng cố', 'Vận dụng'];
        }
      }
      // ================== ENGLISH DC MARKERS ==================
      else if (prefix === 'DC') {
        if (marker === 'OBJECTIVES') {
          // Insert DC Objectives AFTER "3. Attitudes" or "Competences" section in I. OBJECTIVES
          searchPatterns = [
            // Priority: find "Competences" or similar
            'Competences', 'competences', 'COMPETENCES',
            '2. Competences', 'competence',
            // Find "Attitudes" - usually after competences
            '3. Attitudes', 'Attitudes', 'attitudes', 'ATTITUDES',
            // Fallback - find general objectives section
            'I. OBJECTIVES', 'OBJECTIVES', 'I. Objectives',
            '1. Language knowledge', 'Language knowledge and skills'
          ];
        }
        // Parse WARM_UP sections
        else if (marker.startsWith('WARM_UP')) {
          const parts = marker.replace('WARM_UP_', '').split('_');
          const subPart = parts.join('_');

          const warmUpPatterns = [
            'A. Warm up', 'A.Warm up', 'Warm up:', 'WARM UP',
            'Warm up', 'warm up', 'Warm-up'
          ];

          if (subPart === 'ORGANIZATION' || subPart === '') {
            searchPatterns = [
              ...warmUpPatterns,
              'd) Organization', 'd. Organization', 'Organization:',
              "TEACHER'S ACTIVITIES", "STUDENTS' ACTIVITIES"
            ];
          } else if (subPart === 'CONTENT') {
            searchPatterns = [...warmUpPatterns, 'b) Content', 'b. Content', 'Content:'];
          } else if (subPart === 'OUTCOMES') {
            searchPatterns = [...warmUpPatterns, 'c) Outcomes', 'c. Outcomes', 'Outcomes:'];
          } else if (subPart === 'OBJECTIVE') {
            searchPatterns = [...warmUpPatterns, 'a) Objective', 'a. Objective', 'Objective:'];
          } else {
            searchPatterns = warmUpPatterns;
          }
        }
        // Parse ACTIVITY_X sections  
        else if (marker.startsWith('ACTIVITY_')) {
          const parts = marker.replace('ACTIVITY_', '').split('_');
          const actNum = parts[0]; // Activity number
          const subPart = parts.slice(1).join('_'); // POSITION: CONTENT, OUTCOMES, ORGANIZATION...

          // Search patterns for Activity X
          const actPatterns = [
            `Activity ${actNum}:`, `Activity ${actNum}.`, `Activity ${actNum} `,
            `**Activity ${actNum}`, `ACTIVITY ${actNum}`, `Activity${actNum}`,
            `Activity ${actNum}`, `activity ${actNum}`,
            // Also support "Presentation", "Practice", "Production" naming
            ...(actNum === '1' ? ['Presentation', 'presentation', 'PRESENTATION'] : []),
            ...(actNum === '2' ? ['Practice', 'practice', 'PRACTICE'] : []),
            ...(actNum === '3' ? ['Production', 'production', 'PRODUCTION'] : [])
          ];

          if (subPart === 'CONTENT') {
            searchPatterns = [
              ...actPatterns,
              'b) Content', 'b. Content', 'Content:', 'b)Content',
              '* Content', '- Content', 'CONTENT'
            ];
          } else if (subPart === 'OUTCOMES') {
            searchPatterns = [
              ...actPatterns,
              'c) Outcomes', 'c. Outcomes', 'Outcomes:', 'c)Outcomes',
              '* Outcomes', '- Outcomes', 'OUTCOMES'
            ];
          } else if (subPart === 'ORGANIZATION') {
            searchPatterns = [
              ...actPatterns,
              'd) Organization', 'd. Organization', 'd)Organization',
              'Organization:', 'd) Organization', 'd. Organization',
              '* Organization', 'ORGANIZATION',
              "TEACHER'S ACTIVITIES", "STUDENTS' ACTIVITIES"
            ];
          } else if (subPart === 'OBJECTIVE') {
            searchPatterns = [
              ...actPatterns,
              'a) Objective', 'a. Objective', 'Objective:', 'a)Objective',
              '* Objective', '- Objective'
            ];
          } else if (subPart === 'TEACHER_ACTIVITIES') {
            searchPatterns = [
              ...actPatterns,
              "TEACHER'S ACTIVITIES", "Teacher's Activities", "Teacher's activities"
            ];
          } else if (subPart === 'STUDENT_ACTIVITIES') {
            searchPatterns = [
              ...actPatterns,
              "STUDENTS' ACTIVITIES", "Students' Activities", "Students' activities"
            ];
          } else {
            // Fallback for ACTIVITY_X general (no specific POSITION)
            searchPatterns = actPatterns;
          }
        }
        // Parse CONSOLIDATION sections
        else if (marker.startsWith('CONSOLIDATION')) {
          const parts = marker.replace('CONSOLIDATION_', '').split('_');
          const subPart = parts.join('_');

          const consolidationPatterns = [
            'C. Consolidation', 'C.Consolidation', 'Consolidation:',
            'CONSOLIDATION', 'Consolidation', 'consolidation'
          ];

          if (subPart === 'ORGANIZATION' || subPart === '' || marker === 'CONSOLIDATION') {
            searchPatterns = [
              ...consolidationPatterns,
              'd) Organization', "TEACHER'S ACTIVITIES"
            ];
          } else {
            searchPatterns = consolidationPatterns;
          }
        }
        // Parse HOMEWORK sections
        else if (marker.startsWith('HOMEWORK')) {
          searchPatterns = [
            'D. Homework', 'D.Homework', 'Homework:',
            'HOMEWORK', 'Homework', 'homework'
          ];
        }
      }

      sections.push({
        marker: `${prefix}_${marker}`,
        content: sectionContent,
        searchPatterns
      });
    }

    return sections;
  };

  // Helper: Tạo Table
  const createTableFromMarkdown = (tableLines: string[]): Table | null => {
    try {
      const validLines = tableLines.filter(line => !line.match(/^\|?\s*[-:]+[-|\s:]*\|?\s*$/));
      const rows = validLines.map(line => {
        const cells = line.split('|');
        if (line.trim().startsWith('|')) cells.shift();
        if (line.trim().endsWith('|')) cells.pop();
        return new TableRow({
          children: cells.map(cellContent => new TableCell({
            children: [new Paragraph({ children: parseTextWithFormatting(cellContent.trim()) })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            width: { size: 100 / cells.length, type: WidthType.PERCENTAGE }
          }))
        });
      });
      return new Table({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } });
    } catch (e) {
      return null;
    }
  };

  // Helper: Parse text - CHỈ MÀU ĐỎ
  const parseTextWithFormatting = (text: string): TextRun[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|<red>.*?<\/red>)/g);
    return parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return new TextRun({ text: part.slice(1, -1), italics: true });
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return new TextRun({ text: part.replace(/<\/?u>/g, ''), underline: { type: UnderlineType.SINGLE } });
      }
      if (part.startsWith('<red>') && part.endsWith('</red>')) {
        return new TextRun({ text: part.replace(/<\/?red>/g, ''), color: "FF0000" });
      }
      return new TextRun({ text: part });
    });
  };

  // Escape XML
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Chuyển Markdown sang Word XML - CHỈ MÀU ĐỎ
  const convertMarkdownToWordXml = (markdown: string): string => {
    const lines = markdown.split('\n');
    let xml = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Bỏ qua các dòng thông báo/hướng dẫn
      if (trimmed.startsWith('[Chèn') || trimmed.startsWith('(Chèn') ||
        trimmed.startsWith('[chèn') || trimmed.startsWith('(chèn') ||
        trimmed.startsWith('(tiếp tục') || trimmed.startsWith('[tiếp tục') ||
        trimmed.startsWith('...') || trimmed.startsWith('===')) {
        continue;
      }

      let processedLine = trimmed;

      // Loại bỏ "* Tích hợp NLS:" hoặc "Tích hợp NLS:"
      processedLine = processedLine.replace(/^\*?\s*Tích hợp NLS:\s*/i, '- ');

      // Loại bỏ mã năng lực số dạng (1.1NC1a), (5.2.NC1a), (3.4NC1a), etc.
      processedLine = processedLine.replace(/\s*\(\d+\.\d+\.?[A-Za-z]+\d*[a-z]?\)/g, '');
      processedLine = processedLine.replace(/\s*\(\d+\.\d+[A-Za-z]+\d*[a-z]?\)/g, '');

      // Loại bỏ thẻ <u> và </u>
      processedLine = processedLine.replace(/<\/?u>/g, '');

      let isRedContent = trimmed.includes('<red>') || trimmed.includes('</red>');
      processedLine = processedLine.replace(/<\/?red>/g, '');

      const content = escapeXml(processedLine);

      if (isRedContent) {
        xml += `<w:p><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>${content}</w:t></w:r></w:p>`;
      } else {
        xml += `<w:p><w:r><w:t>${content}</w:t></w:r></w:p>`;
      }
    }

    return xml;
  };

  // Tìm và chèn nội dung SAU vị trí tìm thấy
  const findAndInsertAfter = (xml: string, searchPatterns: string[], contentToInsert: string): { result: string; inserted: boolean } => {
    for (const pattern of searchPatterns) {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Tìm paragraph chứa pattern
      const regex = new RegExp(`(<w:p[^>]*>(?:(?!<w:p[^>]*>)[\\s\\S])*?${escapedPattern}(?:(?!<w:p[^>]*>)[\\s\\S])*?</w:p>)`, 'i');

      const match = xml.match(regex);
      if (match) {
        const newXml = xml.replace(match[0], match[0] + contentToInsert);
        return { result: newXml, inserted: true };
      }
    }

    return { result: xml, inserted: false };
  };

  // XML Injection với NHIỀU vị trí chèn
  const injectContentToDocx = async (
    originalArrayBuffer: ArrayBuffer,
    aiResult: string
  ): Promise<Blob> => {
    const zip = await JSZip.loadAsync(originalArrayBuffer);

    const documentXmlFile = zip.file('word/document.xml');
    if (!documentXmlFile) {
      throw new Error('File DOCX không hợp lệ');
    }

    let documentXml = await documentXmlFile.async('string');

    // Parse tất cả các section từ kết quả AI
    const sections = parseAllNLSSections(aiResult);

    let insertedCount = 0;
    let notInsertedSections: string[] = [];

    // Chèn từng section vào vị trí tương ứng
    for (const section of sections) {
      const nlsXml = convertMarkdownToWordXml(section.content);
      const { result, inserted } = findAndInsertAfter(documentXml, section.searchPatterns, nlsXml);

      if (inserted) {
        documentXml = result;
        insertedCount++;
        console.log(`✓ Đã chèn NLS cho: ${section.marker}`);
      } else {
        notInsertedSections.push(section.marker);
        console.log(`✗ Không tìm thấy vị trí cho: ${section.marker}`);
      }
    }

    // Nếu có section không tìm được vị trí, chèn vào cuối
    if (notInsertedSections.length > 0) {
      let fallbackXml = `
        <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="12" w:space="1" w:color="FF0000"/></w:pBdr></w:pPr></w:p>
        <w:p><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>═══ NỘI DUNG NLS BỔ SUNG ═══</w:t></w:r></w:p>
      `;

      for (const section of sections) {
        if (notInsertedSections.includes(section.marker)) {
          fallbackXml += `<w:p><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>[${section.marker}]</w:t></w:r></w:p>`;
          fallbackXml += convertMarkdownToWordXml(section.content);
        }
      }

      documentXml = documentXml.replace('</w:body>', fallbackXml + '</w:body>');
    }

    console.log(`Tổng: ${insertedCount}/${sections.length} section được chèn vào đúng vị trí`);

    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  };

  // Fallback: Tạo file DOCX mới
  const createNewDocx = async (content: string): Promise<Blob> => {
    const lines = content.split('\n');
    const children: (Paragraph | Table)[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      const trimmed = line.trim();

      if (trimmed.startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable) {
        if (tableBuffer.length > 0) {
          const tableNode = createTableFromMarkdown(tableBuffer);
          if (tableNode) {
            children.push(tableNode);
            children.push(new Paragraph({ text: "" }));
          }
          tableBuffer = [];
        }
        inTable = false;
      }

      if (!trimmed || (trimmed.startsWith('===') && trimmed.endsWith('==='))) continue;

      if (trimmed.startsWith('## ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace('## ', '')),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 }
        }));
      } else if (trimmed.startsWith('### ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace('### ', '')),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 50 }
        }));
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.substring(2)),
          bullet: { level: 0 }
        }));
      } else {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed),
          spacing: { after: 100 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }

    if (tableBuffer.length > 0) {
      const tableNode = createTableFromMarkdown(tableBuffer);
      if (tableNode) children.push(tableNode);
    }

    const doc = new Document({
      sections: [{ properties: {}, children: children }],
    });

    return await Packer.toBlob(doc);
  };

  // Hàm chính xuất file DOCX
  const generateDocx = async () => {
    if (!result) return;
    setIsGeneratingDoc(true);

    try {
      let blob: Blob;
      let fileName: string;

      if (originalDocx?.arrayBuffer) {
        console.log('XML Injection: Chèn NLS vào nhiều vị trí...');
        blob = await injectContentToDocx(originalDocx.arrayBuffer, result);
        fileName = originalDocx.fileName.replace('.docx', '_NLS.docx');
      } else {
        console.log('Tạo file DOCX mới...');
        blob = await createNewDocx(result);
        fileName = 'Giao_an_NLS.docx';
      }

      FileSaver.saveAs(blob, fileName);
      if (user) MockDB.addLog(user.id, 'download_file', 'Tải file DOCX');
    } catch (error) {
      console.error("Lỗi tạo file docx:", error);
      alert("Không thể tạo file .docx. Hệ thống sẽ tải về file văn bản thô.");
      handleDownloadTxt();
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const element = document.getElementById('preview-content');
    if (!element) {
      alert("Vui lòng mở 'Xem trước nội dung' trước khi tải PDF.");
      setShowPreview(true);
      return;
    }
    const opt = {
      margin:       1,
      filename:     'Giao_an_NLS.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    if (user) MockDB.addLog(user.id, 'download_file', 'Tải file PDF');
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    FileSaver.saveAs(blob, 'Giao_an_NLS.txt');
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h3 className="text-lg font-semibold text-blue-900 animate-pulse">Đang xử lý...</h3>
        <p className="text-slate-500 mt-2 text-sm">Đang phân tích giáo án và tích hợp năng lực số...</p>
      </div>
    );
  }

  if (!result) return null;

  const components = {
    red: ({ children }: { children: React.ReactNode }) => (
      <span style={{ color: 'red' }}>{children}</span>
    ),
  };

  // Đếm số section NLS
  const sections = parseAllNLSSections(result);

  // Hiển thị nội dung preview - hỗ trợ tất cả các markers linh hoạt (Vietnamese + English)
  const getCleanResultForPreview = (content: string): string => {
    return content
      // ================== VIETNAMESE NLS MARKERS ==================
      .replace(/===NLS_MỤC_TIÊU===/g, '\n**📌 MỤC TIÊU NĂNG LỰC SỐ:**\n')
      // Markers với VỊ_TRÍ đầy đủ: HOẠT_ĐỘNG_X_VỊ_TRÍ
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_NỘI_DUNG===/g, '\n**📌 HOẠT ĐỘNG $1 - NỘI DUNG NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_SẢN_PHẨM===/g, '\n**📌 HOẠT ĐỘNG $1 - SẢN PHẨM NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_TỔ_CHỨC===/g, '\n**📌 HOẠT ĐỘNG $1 - TỔ CHỨC NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_MỤC_TIÊU_HĐ===/g, '\n**📌 HOẠT ĐỘNG $1 - MỤC TIÊU NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_BƯỚC_(\d+)===/g, '\n**📌 HOẠT ĐỘNG $1 - BƯỚC $2 NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_KẾT_LUẬN===/g, '\n**📌 HOẠT ĐỘNG $1 - KẾT LUẬN NLS:**\n')
      // Fallback cho markers đơn giản: HOẠT_ĐỘNG_X
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)===/g, '\n**📌 HOẠT ĐỘNG $1 - NLS:**\n')
      .replace(/===NLS_CỦNG_CỐ===/g, '\n**📌 CỦNG CỐ - TÍCH HỢP NLS:**\n')

      // ================== ENGLISH DC MARKERS ==================
      .replace(/===DC_OBJECTIVES===/g, '\n**📌 DIGITAL COMPETENCE OBJECTIVES:**\n')
      // WARM UP markers
      .replace(/===DC_WARM_UP_ORGANIZATION===/g, '\n**📌 WARM UP - DC ORGANIZATION:**\n')
      .replace(/===DC_WARM_UP_CONTENT===/g, '\n**📌 WARM UP - DC CONTENT:**\n')
      .replace(/===DC_WARM_UP_OUTCOMES===/g, '\n**📌 WARM UP - DC OUTCOMES:**\n')
      .replace(/===DC_WARM_UP_OBJECTIVE===/g, '\n**📌 WARM UP - DC OBJECTIVE:**\n')
      .replace(/===DC_WARM_UP===/g, '\n**📌 WARM UP - DC:**\n')
      // ACTIVITY markers với POSITION đầy đủ
      .replace(/===DC_ACTIVITY_(\d+)_CONTENT===/g, '\n**📌 ACTIVITY $1 - DC CONTENT:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_OUTCOMES===/g, '\n**📌 ACTIVITY $1 - DC OUTCOMES:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_ORGANIZATION===/g, '\n**📌 ACTIVITY $1 - DC ORGANIZATION:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_OBJECTIVE===/g, '\n**📌 ACTIVITY $1 - DC OBJECTIVE:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_TEACHER_ACTIVITIES===/g, '\n**📌 ACTIVITY $1 - TEACHER DC:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_STUDENT_ACTIVITIES===/g, '\n**📌 ACTIVITY $1 - STUDENT DC:**\n')
      // Fallback cho ACTIVITY_X đơn giản
      .replace(/===DC_ACTIVITY_(\d+)===/g, '\n**📌 ACTIVITY $1 - DC:**\n')
      // CONSOLIDATION markers
      .replace(/===DC_CONSOLIDATION_ORGANIZATION===/g, '\n**📌 CONSOLIDATION - DC:**\n')
      .replace(/===DC_CONSOLIDATION===/g, '\n**📌 CONSOLIDATION - DC:**\n')
      // HOMEWORK markers
      .replace(/===DC_HOMEWORK===/g, '\n**📌 HOMEWORK - DC:**\n')

      .replace(/===END===/g, '\n---\n');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden animate-fade-in-up">
      <div className="bg-blue-50 px-6 py-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-green-100 rounded-full">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Phân tích giáo án thành công!</h2>
          <p className="text-slate-600 mt-2 max-w-lg mx-auto">
            Đã tạo <strong>{sections.length} phần</strong> nội dung NLS để chèn vào giáo án.
            {result.includes("(Nội dung trích xuất nguyên văn từ PPCT)") && (
              <span className="block text-green-700 font-medium mt-1 text-sm bg-green-100 p-2 rounded">
                ✓ Đã áp dụng CHÍNH XÁC năng lực số từ PPCT.
              </span>
            )}
          </p>
          {originalDocx && (
            <p className="text-green-600 font-medium mt-2 text-sm bg-green-50 p-2 rounded">
              ✓ XML Injection: Chèn NLS vào <strong>nhiều vị trí</strong> trong file gốc
            </p>
          )}
          <p className="text-red-600 font-medium mt-2 text-sm bg-red-50 p-2 rounded">
            📌 Nội dung NLS: <span style={{ color: 'red' }}>màu đỏ</span> • Phân bố vào: Mục tiêu + Các Hoạt động
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
          <button
            onClick={generateDocx}
            disabled={isGeneratingDoc}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-md transform hover:-translate-y-1"
          >
            {isGeneratingDoc ? (
              <span className="animate-pulse">Đang tạo...</span>
            ) : (
              <>
                <Download size={24} />
                <span>Tải DOCX</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition-all shadow-md transform hover:-translate-y-1"
          >
            <Download size={24} />
            <span>Tải PDF</span>
          </button>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center text-blue-600 text-sm font-medium hover:underline mt-4"
        >
          {showPreview ? (
            <>Thu gọn xem trước <ChevronUp size={16} className="ml-1" /></>
          ) : (
            <>Xem trước nội dung ({sections.length} phần) <ChevronDown size={16} className="ml-1" /></>
          )}
        </button>
      </div>

      {showPreview && (
        <div id="preview-content" className="p-8 prose prose-blue max-w-none prose-p:text-slate-700 prose-headings:text-blue-900 border-t border-slate-100 bg-slate-50/50">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={components as any}
          >
            {getCleanResultForPreview(result)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;