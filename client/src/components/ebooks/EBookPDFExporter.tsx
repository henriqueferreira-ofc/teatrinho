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

  // Load image as base64 using proxy fallback for CORS issues
  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Loading image directly:', url);
      
      const img = new Image();
      
      // Try without crossOrigin first (more permissive)
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg', 0.9);
          console.log('Successfully loaded image directly:', url);
          resolve(dataURL);
        } catch (canvasError) {
          console.log('Canvas tainted, trying proxy method:', canvasError);
          
          // Use proxy when canvas is tainted
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const proxyImg = new Image();
          
          proxyImg.onload = () => {
            try {
              const proxyCanvas = document.createElement('canvas');
              const proxyCtx = proxyCanvas.getContext('2d');
              
              if (!proxyCtx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }
              
              proxyCanvas.width = proxyImg.naturalWidth || proxyImg.width;
              proxyCanvas.height = proxyImg.naturalHeight || proxyImg.height;
              
              proxyCtx.drawImage(proxyImg, 0, 0);
              const proxyDataURL = proxyCanvas.toDataURL('image/jpeg', 0.9);
              console.log('Successfully loaded image via proxy:', url);
              resolve(proxyDataURL);
            } catch (proxyError) {
              reject(proxyError);
            }
          };
          
          proxyImg.onerror = () => reject(new Error('Failed to load image via proxy'));
          proxyImg.src = proxyUrl;
        }
      };
      
      img.onerror = () => {
        console.log('Direct load failed, trying via proxy:', url);
        
        // Fallback: Use backend proxy
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        const proxyImg = new Image();
        
        proxyImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            
            canvas.width = proxyImg.naturalWidth || proxyImg.width;
            canvas.height = proxyImg.naturalHeight || proxyImg.height;
            
            ctx.drawImage(proxyImg, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            console.log('Successfully loaded image via proxy fallback:', url);
            resolve(dataURL);
          } catch (error) {
            reject(error);
          }
        };
        
        proxyImg.onerror = () => reject(new Error('All methods failed to load image'));
        proxyImg.src = proxyUrl;
      };
      
      img.src = url;
    });
  };

  // Generate PDF with activity images
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      if (ebookActivities.length === 0) {
        alert('Este eBook não possui atividades para exportar.');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - (2 * margin);
      const imageHeight = pageHeight - (2 * margin);

      // Title page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(ebook.nome, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const createdDate = new Date(ebook.data).toLocaleDateString('pt-BR');
      pdf.text(`Criado em: ${createdDate}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
      pdf.text(`${ebookActivities.length} atividade${ebookActivities.length !== 1 ? 's' : ''}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

      // Process each activity image
      for (let i = 0; i < ebookActivities.length; i++) {
        const activity = ebookActivities[i];
        
        // Add new page for each activity
        pdf.addPage();
        
        try {
          console.log(`Loading image ${i + 1}/${ebookActivities.length}:`, activity.imagemUrl);
          
          // Load and add image
          const imageBase64 = await loadImageAsBase64(activity.imagemUrl);
          
          // Validate that we got valid base64 data
          if (!imageBase64 || !imageBase64.startsWith('data:image')) {
            throw new Error('Invalid image data received');
          }
          
          // Create temporary image element to get dimensions
          const tempImg = new Image();
          
          await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = reject;
            tempImg.src = imageBase64;
          });
          
          const imgAspectRatio = tempImg.width / tempImg.height;
          const pageAspectRatio = imageWidth / imageHeight;
          
          let finalWidth = imageWidth;
          let finalHeight = imageHeight;
          let offsetX = margin;
          let offsetY = margin;
          
          if (imgAspectRatio > pageAspectRatio) {
            // Image is wider than page ratio
            finalHeight = imageWidth / imgAspectRatio;
            offsetY = margin + (imageHeight - finalHeight) / 2;
          } else {
            // Image is taller than page ratio
            finalWidth = imageHeight * imgAspectRatio;
            offsetX = margin + (imageWidth - finalWidth) / 2;
          }
          
          pdf.addImage(imageBase64, 'JPEG', offsetX, offsetY, finalWidth, finalHeight);
          console.log(`Successfully added image ${i + 1}`);
          
        } catch (imageError) {
          console.error('Error processing activity image:', activity.imagemUrl, imageError);
          
          // Add informative error page with activity details
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
      }

      // Generate filename
      const fileName = `${ebook.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Handle mobile vs desktop download
      if (isMobile()) {
        // Mobile: create blob and use native sharing
        const pdfBlob = pdf.output('blob');
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
          try {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            await navigator.share({
              title: ebook.nome,
              text: `eBook: ${ebook.nome}`,
              files: [file],
            });
          } catch (shareError) {
            // Fallback to download if sharing fails
            pdf.save(fileName);
          }
        } else {
          // Fallback to download
          pdf.save(fileName);
        }
      } else {
        // Desktop: direct download
        pdf.save(fileName);
      }
      
    } catch (error) {
      console.error('Error exporting eBook to PDF:', error);
      alert('Não foi possível gerar o eBook. Tente novamente mais tarde.');
    } finally {
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
            Exportando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Exportar para PDF
          </>
        )}
      </Button>

      {/* Loading Modal */}
      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" aria-describedby="export-description">
          <VisuallyHidden>
            <DialogTitle>Exportando eBook</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gerando seu eBook...</h3>
            <p id="export-description" className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Isso pode levar alguns segundos dependendo do número de atividades.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}