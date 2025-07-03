/**
 * Faz o download de uma imagem a partir de um elemento canvas
 * @param {HTMLCanvasElement} canvas - O elemento canvas a ser baixado
 * @param {string} imageName - Nome do arquivo (com ou sem extensão)
 * @param {number} multiplier - Multiplicador do tamanho (padrão: 1)
 */
export default function downloadCanvasImage(canvas, imageName, multiplier = 1) {
    // Validação dos parâmetros
    if (!canvas || !canvas.getContext) {
        alert('Erro: Elemento canvas inválido');
        return;
    }

    if (!imageName || typeof imageName !== 'string') {
        alert('Erro: Nome da imagem deve ser uma string válida');
        return;
    }

    // Validação do multiplicador
    if (typeof multiplier !== 'number' || multiplier <= 0) {
        alert('Erro: Multiplicador deve ser um número positivo');
        return;
    }

    // Adiciona extensão .png se não tiver extensão
    const fileName = imageName.includes('.') ? imageName : `${imageName}.png`;

    // Determina o tipo MIME baseado na extensão
    const extension = fileName.split('.').pop().toLowerCase();
    let mimeType = 'image/png';

    switch (extension) {
        case 'jpg':
        case 'jpeg':
            mimeType = 'image/jpeg';
            break;
        case 'webp':
            mimeType = 'image/webp';
            break;
        default:
            mimeType = 'image/png';
    }

    try {
        // Cria um canvas temporário com o tamanho multiplicado
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Define as dimensões do canvas temporário
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        tempCanvas.width = originalWidth * multiplier;
        tempCanvas.height = originalHeight * multiplier;

        // Desabilita suavização para manter pixels definidos
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.webkitImageSmoothingEnabled = false;
        tempCtx.mozImageSmoothingEnabled = false;
        tempCtx.msImageSmoothingEnabled = false;

        // Desenha o canvas original no temporário com escala
        tempCtx.drawImage(
            canvas,
            0, 0, originalWidth, originalHeight,  // origem
            0, 0, tempCanvas.width, tempCanvas.height  // destino
        );

        // Usa toBlob para melhor performance
        tempCanvas.toBlob(function (blob) {
            if (!blob) {
                alert('Erro: Falha ao gerar blob da imagem');
                return;
            }

            // Cria URL do blob
            const url = URL.createObjectURL(blob);

            // Cria elemento de link temporário
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            link.style.display = 'none';

            // Adiciona ao DOM, clica e remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Libera a memória
            URL.revokeObjectURL(url);

            console.log(`Imagem ${fileName} baixada com sucesso`);

        }, mimeType, 0.9); // Qualidade 0.9 para JPEG

    } catch (error) {
        alert('Erro ao baixar imagem:', error);

        // Fallback usando toDataURL
        try {
            // Cria canvas temporário para fallback também
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            tempCanvas.width = originalWidth * multiplier;
            tempCanvas.height = originalHeight * multiplier;

            tempCtx.imageSmoothingEnabled = false;
            tempCtx.webkitImageSmoothingEnabled = false;
            tempCtx.mozImageSmoothingEnabled = false;
            tempCtx.msImageSmoothingEnabled = false;

            tempCtx.drawImage(
                canvas,
                0, 0, originalWidth, originalHeight,
                0, 0, tempCanvas.width, tempCanvas.height
            );

            const dataURL = tempCanvas.toDataURL(mimeType, 0.9);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataURL;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`Imagem ${fileName} baixada com sucesso (fallback)`);

        } catch (fallbackError) {
            alert('Erro no fallback:', fallbackError);
        }
    }
}

// Exemplos de uso:
// downloadCanvasImage(meuCanvas, 'desenho'); // Tamanho original
// downloadCanvasImage(meuCanvas, 'desenho', 2); // 2x maior
// downloadCanvasImage(meuCanvas, 'imagem.jpg', 5); // 5x maior
// downloadCanvasImage(meuCanvas, 'pixel-art.png', 10); // 10x maior para pixel art