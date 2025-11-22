$(document).ready(function() {
    function startMarquee() {
        var $track = $('#current-track');
        var $container = $track.parent();
        
        // Adiciona estilos necessários ao container
        $container.css({
            'position': 'relative',
            'overflow': 'hidden',
            'width': '100%'
        });
        
        // Adiciona estilos necessários ao track
        $track.css({
            'position': 'absolute',
            'white-space': 'nowrap'
        });
        
        var containerWidth = $container.width();
        var textWidth = $track.outerWidth();
        
        // Se o texto for maior que o container, inicia a animação
        if (textWidth > containerWidth) {
            // Reset para posição inicial (direita)
            $track.css('left', containerWidth + 'px');
            
            // Animar da direita para a esquerda
            $track.animate({
                left: -textWidth + 'px'
            }, 15000, 'linear', function() {
                // Reiniciar quando terminar
                startMarquee();
            });
        } else {
            // Se não precisa animar, mantém posição normal
            $track.css({
                'position': 'static',
                'left': 'auto'
            });
        }
    }
    
    // Espera um pouco para garantir que o DOM esteja totalmente carregado
    setTimeout(function() {
        startMarquee();
    }, 500);
    
    // Pausar ao passar o mouse
    $('#current-track').hover(
        function() {
            $(this).stop();
        },
        function() {
            startMarquee();
        }
    );
    
    // Reiniciar animação quando a janela for redimensionada
    $(window).on('resize', function() {
        $('#current-track').stop().css('left', 'auto');
        setTimeout(startMarquee, 100);
    });
});