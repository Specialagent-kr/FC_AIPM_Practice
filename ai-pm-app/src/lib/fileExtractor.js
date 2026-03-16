/**
 * 파일에서 텍스트를 추출하는 유틸리티
 * 지원 형식: PDF, DOCX, TXT, MD
 */

// PDF 텍스트 추출
async function extractPdf(file) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  // Vite 번들 환경에서 워커를 CDN에서 로드
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  const texts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    texts.push(`[${i}페이지] ${pageText}`);
  }

  return texts.join('\n');
}

// DOCX 텍스트 추출
async function extractDocx(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// TXT / MD 텍스트 추출
async function extractText(file) {
  return await file.text();
}

/**
 * 파일 종류에 따라 텍스트를 추출한다.
 * @param {File} file
 * @returns {Promise<string>} 추출된 텍스트
 */
export async function extractFileText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') return extractPdf(file);
  if (ext === 'docx') return extractDocx(file);
  if (ext === 'txt' || ext === 'md') return extractText(file);

  // PPTX 등 미지원 형식
  throw new Error(`지원하지 않는 파일 형식입니다: .${ext}\nPDF, DOCX, TXT, MD 파일을 사용해주세요.`);
}

export const SUPPORTED_EXTENSIONS = '.pdf,.docx,.txt,.md';
export const MAX_FILE_SIZE_MB = 10;
