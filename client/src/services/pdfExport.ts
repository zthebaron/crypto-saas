import type { AgentReport, Signal, PortfolioSummary } from '@crypto-saas/shared';

async function loadJsPdf() {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  return { jsPDF, autoTable };
}

export async function exportReportPdf(report: AgentReport) {
  const { jsPDF } = await loadJsPdf();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text('BlockView Agent Report', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(`Agent: ${report.agentRole.replace(/_/g, ' ').toUpperCase()}`, 14, 30);
  doc.text(`Run ID: ${report.runId.slice(0, 8)}`, 14, 37);
  doc.text(`Generated: ${new Date(report.createdAt).toLocaleString()}`, 14, 44);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(report.content, 180);
  doc.text(lines, 14, 55);

  doc.save(`blockview-report-${report.agentRole}-${report.runId.slice(0, 8)}.pdf`);
}

export async function exportSignalSummaryPdf(signals: Signal[]) {
  const { jsPDF, autoTable } = await loadJsPdf();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text('BlockView Signal Summary', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()} · ${signals.length} signals`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Coin', 'Type', 'Confidence', 'Agent', 'Timeframe', 'Reasoning']],
    body: signals.map(s => [
      s.coinSymbol,
      s.type.toUpperCase(),
      `${s.confidence}%`,
      s.agentRole.replace(/_/g, ' '),
      s.timeframe,
      s.reasoning.slice(0, 60) + '...',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save(`blockview-signals-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportPortfolioPdf(summary: PortfolioSummary) {
  const { jsPDF, autoTable } = await loadJsPdf();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text('BlockView Portfolio Snapshot', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Total Value: $${summary.totalValue.toLocaleString()} · P&L: $${summary.totalPnl.toFixed(2)} (${summary.totalPnlPercent.toFixed(2)}%)`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Coin', 'Entry', 'Current', 'Qty', 'P&L', 'P&L %']],
    body: summary.positions.map(p => [
      p.coinSymbol,
      `$${p.entryPrice.toFixed(2)}`,
      `$${p.currentPrice.toFixed(2)}`,
      p.quantity.toString(),
      `$${p.pnl.toFixed(2)}`,
      `${p.pnlPercent.toFixed(2)}%`,
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save(`blockview-portfolio-${new Date().toISOString().slice(0, 10)}.pdf`);
}
