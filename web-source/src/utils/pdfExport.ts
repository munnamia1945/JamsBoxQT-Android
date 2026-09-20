import { jsPDF } from 'jspdf';
import { MathSolution } from '../types';
import { latexToReadableUnicode } from '../components/MathView';

/**
 * Generates and triggers download of an academic Math Solution PDF document.
 */
export function downloadMathSolutionPdf(solution: MathSolution): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Header Banner Background
  doc.setFillColor(11, 26, 64); // JamsBox Navy #0B1A40
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Header Typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('JamsBox ', margin, 14);

  // QT in Orange #F97316
  const jamsBoxWidth = doc.getTextWidth('JamsBox ');
  doc.setTextColor(249, 115, 22);
  doc.text('QT', margin + jamsBoxWidth, 14);

  // Subtitle / Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('EDUCATIONAL QUIZ PLATFORM • MATHEMATICS LABORATORY', margin, 21);

  cursorY = 36;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(11, 26, 64);
  doc.text('MATH SOLUTION DOCUMENT', margin, cursorY);
  cursorY += 6;

  // Metadata Row Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 16, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Chapter:', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(solution.chapter || 'General Mathematics', margin + 20, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Topic:', margin + 95, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(solution.topic || 'Problem Solving', margin + 107, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Source:', margin + 4, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${solution.source} Problem`, margin + 20, cursorY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date:', margin + 95, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(solution.formattedDate, margin + 107, cursorY + 12);

  cursorY += 22;

  // Problem Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 26, 64);
  doc.text('PROBLEM STATEMENT', margin, cursorY);
  cursorY += 4;

  const cleanProblemText = latexToReadableUnicode(solution.problem);
  const splitProblem = doc.splitTextToSize(cleanProblemText, contentWidth - 8);
  const problemBoxHeight = Math.max(16, splitProblem.length * 5 + 8);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, problemBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(splitProblem, margin + 4, cursorY + 6);

  cursorY += problemBoxHeight + 8;

  // Step-by-Step Solution Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 26, 64);
  doc.text('COMPLETE STEP-BY-STEP SOLUTION', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  solution.solutionSteps.forEach((step, idx) => {
    // Check if we need a new page
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }

    const stepLabel = `Step ${idx + 1}: `;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 26, 64);
    doc.text(stepLabel, margin, cursorY);

    const labelWidth = doc.getTextWidth(stepLabel);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const cleanStepText = latexToReadableUnicode(step);
    const stepTextLines = doc.splitTextToSize(cleanStepText, contentWidth - labelWidth);
    doc.text(stepTextLines, margin + labelWidth, cursorY);

    cursorY += stepTextLines.length * 5 + 4;
  });

  cursorY += 4;

  // Final Answer Box
  if (cursorY > 250) {
    doc.addPage();
    cursorY = 20;
  }

  const cleanFinalAnswerText = latexToReadableUnicode(solution.finalAnswer);
  const finalAnswerLines = doc.splitTextToSize(cleanFinalAnswerText, contentWidth - 12);
  const finalAnswerBoxHeight = Math.max(18, finalAnswerLines.length * 5 + 10);

  doc.setFillColor(255, 247, 237); // Orange-50
  doc.setDrawColor(249, 115, 22); // Orange-500
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, cursorY, contentWidth, finalAnswerBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(194, 65, 12); // Orange-700
  doc.text('FINAL ANSWER:', margin + 6, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(11, 26, 64);
  doc.text(finalAnswerLines, margin + 6, cursorY + 12);

  cursorY += finalAnswerBoxHeight + 10;

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `JamsBox QT • Educational Quiz Platform • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Sanitize filename
  const cleanTopic = (solution.topic || 'Math_Solution').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`JamsBox_Math_Solution_${cleanTopic}.pdf`);
}
