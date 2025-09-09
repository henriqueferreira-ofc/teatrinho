import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Ebook, Atividade } from '@shared/schema';
import atividadesData from '@/data/atividades.json';

interface EBookPDFExporterProps {
  ebook: Ebook;
  className?: string;
}

export function EBookPDFExporter({ ebook, className }: EBookPDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Load activity details from catalog and custom activities based on IDs
  const ebookActivities = useMemo(() => {
    const catalogActivities = atividadesData as Atividade[];
    const customActivities = JSON.parse(localStorage.getItem('customActivities') || '{}');
    
    return ebook.atividades
      .map(activityId => {
        // First check catalog activities
        const catalogActivity = catalogActivities.find(activity => activity.id === activityId);
        if (catalogActivity) return catalogActivity;
        
        // Then check custom activities
        const customActivity = customActivities[activityId];
        if (customActivity) return customActivity;
        
        return null;
      })
      .filter((activity): activity is Atividade => activity !== null);
  }, [ebook.atividades]);

  // Detect if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Carregar imagem via proxy para evitar erros CORS
  const loadImageAsBase64 = async (url: string): Promise<string> => {
    console.log('Carregando imagem via proxy:', url);
    
    // Função auxiliar para converter blob em base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(blob);
      });
    };
    
    // Usar sempre o proxy para evitar erros CORS
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Erro no proxy: ${response.status}`);
      }
      
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      
      console.log('Imagem carregada com sucesso via proxy');
      return base64;
      
    } catch (error) {
      console.error('Erro ao carregar imagem via proxy:', error);
      throw new Error('Não foi possível carregar a imagem');
    }
  };

  // Gerar PDF com imagens das atividades - versão sem conflitos DOM
  const exportToPDF = async () => {
    // Previne múltiplas exportações simultâneas
    if (isExporting) {
      console.log('Geração de PDF já em progresso, pulando...');
      return;
    }
    
    setIsExporting(true);
    
    try {
      if (ebookActivities.length === 0) {
        alert('Este eBook não possui atividades para exportar.');
        return;
      }

      console.log('Iniciando geração do PDF...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - (2 * margin);
      const imageHeight = pageHeight - (2 * margin);

      // Página de título
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(ebook.nome, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const createdDate = new Date(ebook.data).toLocaleDateString('pt-BR');
      pdf.text(`Criado em: ${createdDate}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
      pdf.text(`${ebookActivities.length} atividade${ebookActivities.length !== 1 ? 's' : ''}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

      // Processar cada imagem de atividade
      for (let i = 0; i < ebookActivities.length; i++) {
        const activity = ebookActivities[i];
        console.log(`Processando atividade ${i + 1}/${ebookActivities.length}`);
        
        // Adicionar nova página para cada atividade
        pdf.addPage();
        
        try {
          // Carregar imagem usando método seguro sem CORS
          let imageBase64: string;
          
          try {
            imageBase64 = await loadImageAsBase64(activity.imagemUrl);
          } catch (loadError) {
            console.error(`Erro ao carregar imagem ${i + 1}:`, loadError);
            throw new Error('Falha ao carregar imagem');
          }
          
          // Validar dados base64
          if (!imageBase64 || !imageBase64.startsWith('data:image')) {
            throw new Error('Dados de imagem inválidos');
          }
          
          // Obter dimensões reais da imagem de forma segura
          const imgDimensions = await new Promise<{width: number, height: number}>((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve({
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height
              });
              // Limpeza
              img.src = '';
            };
            img.onerror = () => {
              // Fallback para dimensões padrão
              resolve({ width: 800, height: 600 });
            };
            // Carregar imagem base64 para obter dimensões
            img.src = imageBase64;
          });
          
          const imgAspectRatio = imgDimensions.width / imgDimensions.height;
          const pageAspectRatio = imageWidth / imageHeight;
          
          let finalWidth = imageWidth;
          let finalHeight = imageHeight;
          let offsetX = margin;
          let offsetY = margin;
          
          if (imgAspectRatio > pageAspectRatio) {
            // Imagem mais larga que proporção da página
            finalHeight = imageWidth / imgAspectRatio;
            offsetY = margin + (imageHeight - finalHeight) / 2;
          } else {
            // Imagem mais alta que proporção da página
            finalWidth = imageHeight * imgAspectRatio;
            offsetX = margin + (imageWidth - finalWidth) / 2;
          }
          
          // Adicionar imagem ao PDF
          try {
            pdf.addImage(imageBase64, 'JPEG', offsetX, offsetY, finalWidth, finalHeight);
            console.log(`Imagem ${i + 1} adicionada com sucesso`);
          } catch (pdfError) {
            console.error(`Erro ao adicionar imagem ${i + 1} ao PDF:`, pdfError);
            throw new Error('Falha ao adicionar imagem ao PDF');
          }
          
        } catch (imageError) {
          console.error('Erro ao processar imagem da atividade:', activity.imagemUrl, imageError);
          
          // Adicionar página de erro informativa
          pdf.setFontSize(18);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Atividade ${i + 1}`, pageWidth / 2, 60, { align: 'center' });
          
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text('Imagem não pôde ser carregada', pageWidth / 2, 90, { align: 'center' });
          pdf.text(`Categoria: ${activity.categoria}`, pageWidth / 2, 110, { align: 'center' });
          pdf.text(`Arquivo: ${activity.arquivo}`, pageWidth / 2, 130, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.text('Verifique sua conexão com a internet', pageWidth / 2, 160, { align: 'center' });
          pdf.text('ou tente novamente mais tarde', pageWidth / 2, 175, { align: 'center' });
        }
        
        // Pausa entre cada imagem para estabilidade
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Gerar nome do arquivo
      const fileName = `${ebook.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      console.log('Finalizando PDF e iniciando download...');
      
      // Processar download para mobile vs desktop
      if (isMobile()) {
        // Mobile: criar blob e usar compartilhamento nativo
        const pdfBlob = pdf.output('blob');
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
          try {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            await navigator.share({
              title: ebook.nome,
              text: `eBook: ${ebook.nome}`,
              files: [file],
            });
            console.log('PDF compartilhado com sucesso');
          } catch (shareError) {
            // Fallback para download se compartilhamento falhar
            pdf.save(fileName);
            console.log('Fallback: PDF baixado com sucesso');
          }
        } else {
          // Fallback para download
          pdf.save(fileName);
          console.log('PDF baixado com sucesso (mobile fallback)');
        }
      } else {
        // Desktop: download direto
        pdf.save(fileName);
        console.log('PDF baixado com sucesso (desktop)');
      }
      
      
    } catch (error) {
      console.error('Erro ao exportar eBook para PDF:', error);
      alert('Não foi possível gerar o eBook. Verifique sua conexão e tente novamente.');
    } finally {
      // Resetar estado de exportação
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={exportToPDF}
        disabled={isExporting}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        data-testid="button-export-ebook-pdf"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Gerando PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Gerar PDF
          </>
        )}
      </Button>

      {/* Modal de Carregamento */}
      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" aria-describedby="export-description">
          <VisuallyHidden>
            <DialogTitle>Gerando PDF do eBook</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gerando seu PDF...</h3>
            <p id="export-description" className="text-sm text-gray-600 text-center">
              Processando as imagens das atividades. Isso pode levar alguns segundos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}