
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BalancoMensal } from "@/types/financas";

export const generateClosingPDF = (balanco: BalancoMensal) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // ==========================================
  // CABEÇALHO
  // ==========================================
  let schoolName = "ESCOLA ELO";
  try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
          const parsed = JSON.parse(authStorage);
          if (parsed.state?.user?.school?.name) {
              schoolName = parsed.state.user.school.name;
          }
      }
  } catch (e) {
      console.warn("Could not retrieve school name from storage", e);
  }
  const reportTitle = "RELATÓRIO DE FECHAMENTO MENSAL";
  const reference = `REFERÊNCIA: ${balanco.mes.toString().padStart(2, '0')}/${balanco.ano}`;
  const emissionDate = `Emissão: ${new Date().toLocaleDateString('pt-BR')}`;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(schoolName, pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(reportTitle, pageWidth / 2, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(reference, pageWidth / 2, 34, { align: "center" });
  doc.text(emissionDate, pageWidth - 15, 20, { align: "right" });

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);

  let currentY = 50;

  // ==========================================
  // TABELA 1: RESUMO EXECUTIVO
  // ==========================================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. RESUMO EXECUTIVO", 15, currentY);
  currentY += 5;

  const totalReceitas = balanco.totalReceitas;
  const totalDespesas = balanco.totalDespesasGeral + (balanco.totalDespesasTurmas || 0); // Ajuste conforme estrutura
  const saldoLiquido = totalReceitas - totalDespesas;
  
  const summaryData = [
    ["Receita Total", `R$ ${totalReceitas.toFixed(2)}`],
    ["Despesas Gerais", `R$ ${balanco.totalDespesasGeral.toFixed(2)}`],
    ["Despesas Turmas", `R$ ${balanco.totalDespesasTurmas.toFixed(2)}`],
    ["SALDO LÍQUIDO", `R$ ${saldoLiquido.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Item", "Valor"]],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    didParseCell: (data) => {
        if (data.row.index === 3) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
        }
    }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================
  // TABELA 2: DESPESAS GERAIS
  // ==========================================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. DETALHAMENTO DE DESPESAS GERAIS", 15, currentY);
  currentY += 5;

  if (balanco.pagamentosGerais && balanco.pagamentosGerais.length > 0) {
    const geralBody = balanco.pagamentosGerais.map(p => [
      new Date(p.data).toLocaleDateString('pt-BR'),
      p.descricao,
      p.tipo.replace(/_/g, ' '),
      `R$ ${p.valor.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Data", "Descrição", "Categoria", "Valor"]],
      body: geralBody,
      theme: 'plain',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Nenhuma despesa geral lançada.", 15, currentY + 5);
    currentY += 15;
  }

  // ==========================================
  // TABELA 3: POR TURMA
  // ==========================================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. DETALHAMENTO POR TURMA", 15, currentY);
  currentY += 5;

  balanco.turmas.forEach((turma) => {
     // Check for room on page
     if (currentY > 250) {
         doc.addPage();
         currentY = 20;
     }

     doc.setFontSize(11);
     doc.setFont("helvetica", "bold");
     doc.setTextColor(50, 50, 50);
     doc.text(`Turma: ${turma.nome}`, 15, currentY);
     currentY += 5;

     // Resumo da turma
     const resumoTurma = [
        ["Rec. Mensalidades", `R$ ${turma.receita.toFixed(2)}`],
        ["Despesas Diretas", `R$ ${turma.despesaDireta.toFixed(2)}`],
        ["Rateio Custos", `R$ ${turma.rateioGeral.toFixed(2)}`],
        ["Saldo Turma", `R$ ${turma.saldo.toFixed(2)}`]
     ];

     // Use a small table for class summary or just text? 
     // Let's use a mini table for the summary
     autoTable(doc, {
        startY: currentY,
        head: [["Receitas", "Desp. Diretas", "Rateio", "Resultado"]],
        body: [[
            `R$ ${turma.receita.toFixed(2)}`,
            `R$ ${turma.despesaDireta.toFixed(2)}`,
            `R$ ${turma.rateioGeral.toFixed(2)}`,
            `R$ ${turma.saldo.toFixed(2)}`
        ]],
        theme: 'striped',
        margin: { left: 15 },
        tableWidth: 'wrap',
        headStyles: { fontSize: 8 },
        bodyStyles: { fontSize: 8 },
     });

     // @ts-ignore
     currentY = doc.lastAutoTable.finalY + 5;

     // Detailed expenses for class
     if (turma.detalhesDespesas && turma.detalhesDespesas.length > 0) {
         const despesasTurmaBody = turma.detalhesDespesas.map(d => [
             new Date(d.data).toLocaleDateString('pt-BR'),
             d.descricao,
             `R$ ${d.valor.toFixed(2)}`
         ]);

         autoTable(doc, {
            startY: currentY,
            head: [["Data", "Descrição da Despesa", "Valor"]],
            body: despesasTurmaBody,
            theme: 'grid',
            margin: { left: 20 },
            tableWidth: 150, // Slightly indented
            headStyles: { fillColor: [240, 240, 240], textColor: 50, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                2: { halign: 'right' }
            }
         });
         // @ts-ignore
         currentY = doc.lastAutoTable.finalY + 10;
     } else {
         doc.setFontSize(9);
         doc.setFont("helvetica", "italic");
         doc.text("Sem despesas diretas.", 20, currentY + 5);
         currentY += 15;
     }
  });

  // Footer / Paging
  const pageCount = doc.internal.pages.length - 1; // jspdf quirk
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: "right" });
  }

  // Save
  doc.save(`relatorio-fechamento-${balanco.mes}-${balanco.ano}.pdf`);
};
