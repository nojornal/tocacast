// VARIÁVEIS GLOBAIS
const shareModal = document.getElementById('share-modal');

// Função principal chamada pelo botão "Compartilhe"
function sharePodcast() {
    const podcastTitle = document.getElementById('banner-title').textContent;
    const podcastDescription = document.getElementById('banner-description').textContent;
    const currentUrl = window.location.href;
    
    // Obter a imagem/gradiente do banner atual
    const podcastImage = document.getElementById('podcast-image');
    let imageUrl = '';
    
    if (podcastImage) {
        const currentGradient = Array.from(podcastImage.classList).find(cls => 
            cls.startsWith('gradient-')
        );
        if (currentGradient) {
            imageUrl = getGradientImageUrl(currentGradient);
        }
    }
    
    // Chama a função para MOSTRAR o modal e configurar eventos
    showShareModal(podcastTitle, currentUrl, imageUrl, podcastDescription);
}

// Mostrar modal e configurar eventos
function showShareModal(title, url, imageUrl, description) { 
    if (!shareModal) return;

    // Remover a classe hidden
    shareModal.classList.remove('hidden');
    
    // Forçar reflow e ativar animação de entrada
    setTimeout(() => {
        const modalContent = document.getElementById('share-modal-content');
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Configurar eventos
    let currentHandleEsc;
    
    const setupEscListener = () => {
        document.removeEventListener('keydown', currentHandleEsc); 
        currentHandleEsc = (e) => {
            if (e.key === 'Escape') {
                hideShareModal();
                document.removeEventListener('keydown', currentHandleEsc);
            }
        };
        document.addEventListener('keydown', currentHandleEsc);
    };

    setupEscListener();
    
    // Configurar eventos de fechar
    const closeModalElements = shareModal.querySelectorAll('.close-share-modal, #close-modal-x');
    
    closeModalElements.forEach(button => {
        button.addEventListener('click', hideShareModal);
    });
    
    // Fechar modal ao clicar no overlay
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            hideShareModal();
        }
    });

    // Configurar opções de compartilhamento
    const shareOptions = shareModal.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.onclick = () => { 
            document.removeEventListener('keydown', currentHandleEsc); 
            const platform = option.dataset.platform;
            
            switch(platform) {
                case 'whatsapp':
                    shareToWhatsAppStatus(title, url, imageUrl, description); 
                    break;
                case 'instagram':
                    shareToInstagramStories(title, url, imageUrl, description); 
                    break;
                case 'copy':
                    copyToClipboard(url);
                    break;
            }
            hideShareModal();
        };
    });
}

function hideShareModal() {
    if (!shareModal) return;
    
    const modalContent = document.getElementById('share-modal-content');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Esconder completamente após a animação
    setTimeout(() => {
        shareModal.classList.add('hidden');
    }, 300);
}

// Compartilhar no WhatsApp Status
function shareToWhatsAppStatus(title, url, imageUrl, description) { 
    createShareImage(title, url, imageUrl, 'whatsapp-status', description) 
        .then(imageDataUrl => {
            const statusUrl = `whatsapp://send?text=${encodeURIComponent(`Confira: ${title}\n${description}\n${url}`)}`;
            window.location.href = statusUrl;
            
            setTimeout(() => {
                if (!document.hidden) { 
                    showShareNotification('Não foi possível abrir o WhatsApp diretamente. Imagem gerada, mas você precisará salvar e postar no Status manualmente.');
                }
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao criar imagem:', error);
            showShareNotification('Erro ao preparar compartilhamento');
        });
}

// Compartilhar no Instagram Stories
function shareToInstagramStories(title, url, imageUrl, description) {
    createShareImage(title, url, imageUrl, 'instagram-stories', description) 
        .then(imageDataUrl => {
            const instagramUrl = `instagram://story?backgroundImage=${encodeURIComponent(imageDataUrl)}`;
            window.location.href = instagramUrl;
            
            setTimeout(() => {
                if (!document.hidden) { 
                    showShareNotification('Não foi possível abrir o Instagram diretamente. Salve a imagem gerada para compartilhar.');
                }
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao criar imagem:', error);
            showShareNotification('Erro ao preparar compartilhamento');
        });
}

// --- FUNÇÕES DE CANVAS (GERAÇÃO DE IMAGEM) ---

// Criar imagem para compartilhamento
function createShareImage(title, url, imageUrl, type, description) { 
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Dimensões para Stories/Status (1080x1920)
        canvas.width = 1080;
        canvas.height = 1920;
        
        // Fundo gradiente
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#3B82F6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Adicionar conteúdo
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // 1. Título
        ctx.font = 'bold 60px Arial';
        const titleLines = wrapText(ctx, title, canvas.width * 0.8, 60);
        let yPosition = canvas.height * 0.25; 
        
        titleLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, yPosition);
            yPosition += 70;
        });
        
        // 2. Descrição
        ctx.font = '35px Arial'; 
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        
        const descriptionLines = wrapText(ctx, description, canvas.width * 0.8, 35);
        yPosition += 50; 
        
        descriptionLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, yPosition);
            yPosition += 45;
        });
        
        // 3. URL/Link
        ctx.font = '30px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        yPosition += 50; 
        ctx.fillText('Ouça agora:', canvas.width / 2, yPosition);
        
        ctx.font = '25px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        const urlLines = wrapText(ctx, url, canvas.width * 0.9, 25);
        yPosition += 50; 
        
        urlLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, yPosition);
            yPosition += 35;
        });
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}

// Função para quebrar texto em múltiplas linhas
function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// --- FUNÇÕES AUXILIARES ---

function getGradientImageUrl(gradientClass) {
    const gradientMap = {
        'gradient-1': ['#8B5CF6', '#3B82F6'],
        'gradient-2': ['#EC4899', '#8B5CF6'],
        'gradient-3': ['#10B981', '#3B82F6'],
        'gradient-4': ['#F59E0B', '#EF4444'],
        'gradient-5': ['#6366F1', '#8B5CF6']
    };
    
    const colors = gradientMap[gradientClass] || gradientMap['gradient-1'];
    return createGradientImageUrl(colors[0], colors[1]);
}

function createGradientImageUrl(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const grd = ctx.createLinearGradient(0, 0, 400, 400);
    grd.addColorStop(0, color1);
    grd.addColorStop(1, color2);
    
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 400, 400);
    
    return canvas.toDataURL('image/jpeg', 0.8);
}

// Copiar Link para o clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showShareNotification('Link copiado!');
            })
            .catch(() => {
                copyToClipboardFallback(text);
            });
    } else {
        copyToClipboardFallback(text);
    }
}

function copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareNotification('Link copiado!');
    } catch (err) {
        console.error('Falha ao copiar:', err);
        showShareNotification('Erro ao copiar link');
    }
    
    document.body.removeChild(textArea);
}

function showShareNotification(message) {
    const existingNotification = document.querySelector('.share-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'share-notification fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 font-medium text-sm';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Adicionar evento ao botão de compartilhar
document.addEventListener('DOMContentLoaded', function() {
    // Configura os listeners iniciais para o botão "Compartilhe"
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', sharePodcast);
    });
});