import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Loader2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Ebook } from '@shared/schema';

interface EBookExporterProps {
  ebook: Ebook;
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const activityLabels = {
  texto: 'Leitura de Texto',
  exercicio: 'Exercício Prático',
  quiz: 'Quiz/Questionário',
  video: 'Vídeo',
};

export function EBookExporter({ ebook, variant = "outline", size = "sm" }: EBookExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportingFormat('PDF');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Helper function to add a new page if needed
      const checkPageSpace = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.35; // Convert pt to mm (approximate)
        
        checkPageSpace(lines.length * lineHeight);
        
        lines.forEach((line: string, index: number) => {
          pdf.text(line, x, currentY + (index * lineHeight));
        });
        
        return lines.length * lineHeight;
      };

      // Title Page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      currentY = 60;
      pdf.text(ebook.nome, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 20;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const createdDate = new Date(ebook.data).toLocaleDateString('pt-BR');
      pdf.text(`Criado em: ${createdDate}`, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 10;
      pdf.text(`${ebook.atividades.length} atividade${ebook.atividades.length !== 1 ? 's' : ''}`, pageWidth / 2, currentY, { align: 'center' });

      // Table of Contents
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text('Sumário', margin, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      ebook.atividades.forEach((activity, index) => {
        checkPageSpace(8);
        pdf.text(`${index + 1}. ${activity.titulo}`, margin + 5, currentY);
        pdf.text(`${activityLabels[activity.tipo]}`, pageWidth - margin - 40, currentY, { align: 'right' });
        currentY += 8;
      });

      // Activities
      ebook.atividades.forEach((activity, index) => {
        pdf.addPage();
        currentY = margin;

        // Activity header
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${activity.titulo}`, margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Tipo: ${activityLabels[activity.tipo]}`, margin, currentY);
        currentY += 15;

        // Activity description
        if (activity.descricao) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text('Descrição:', margin, currentY);
          currentY += 8;

          pdf.setFont("helvetica", "normal");
          const descHeight = addWrappedText(activity.descricao, margin, currentY, contentWidth);
          currentY += descHeight + 10;
        }

        // Activity content
        if (activity.conteudo) {
          checkPageSpace(20);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text('Conteúdo:', margin, currentY);
          currentY += 8;

          pdf.setFont("helvetica", "normal");
          const contentHeight = addWrappedText(activity.conteudo, margin, currentY, contentWidth);
          currentY += contentHeight + 10;
        }

        // Add some space between activities
        currentY += 10;
      });

      // Save the PDF
      const fileName = `${ebook.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Erro ao exportar para PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportToText = async () => {
    setIsExporting(true);
    setExportingFormat('TXT');
    
    try {
      let content = `${ebook.nome}\n`;
      content += `${'='.repeat(ebook.nome.length)}\n\n`;
      content += `Criado em: ${new Date(ebook.data).toLocaleDateString('pt-BR')}\n`;
      content += `Atividades: ${ebook.atividades.length}\n\n`;
      
      content += 'SUMÁRIO\n';
      content += '--------\n\n';
      ebook.atividades.forEach((activity, index) => {
        content += `${index + 1}. ${activity.titulo} (${activityLabels[activity.tipo]})\n`;
      });
      content += '\n\n';
      
      ebook.atividades.forEach((activity, index) => {
        content += `${index + 1}. ${activity.titulo}\n`;
        content += `${'-'.repeat(activity.titulo.length + 3)}\n`;
        content += `Tipo: ${activityLabels[activity.tipo]}\n\n`;
        
        if (activity.descricao) {
          content += `Descrição:\n${activity.descricao}\n\n`;
        }
        
        if (activity.conteudo) {
          content += `Conteúdo:\n${activity.conteudo}\n\n`;
        }
        
        content += '\n';
      });

      // Create and download the text file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ebook.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting to text:', error);
      alert('Erro ao exportar para texto. Tente novamente.');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isExporting}
          data-testid="button-export-ebook"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando {exportingFormat}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="export-dropdown">
        <DropdownMenuItem 
          onClick={exportToPDF}
          disabled={isExporting}
          data-testid="export-pdf"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportToText}
          disabled={isExporting}
          data-testid="export-txt"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar como Texto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}