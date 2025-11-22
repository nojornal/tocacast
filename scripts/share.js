
document.querySelector(".share-btn").addEventListener("click", () => {
    const modal = document.getElementById("share-modal");
    const modalContent = document.getElementById("share-modal-content");

    modal.classList.remove("hidden");

    setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
    }, 20);
});

// Fechar modal
document.querySelectorAll(".close-share-modal, #close-modal-x").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = document.getElementById("share-modal");
        const modalContent = document.getElementById("share-modal-content");

        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");

        setTimeout(() => {
            modal.classList.add("hidden");
        }, 200);
    });
});

function gerarCardPadrao() {
 
    const iconeProjeto = "🎙️";   
    const iconeAutor   = "@";    
    const iconeAudio   = "🎧";   
    const iconeLink    = "🔗";   

    const nomeProjeto = "Podcast";

    const titulo = document.getElementById("banner-title")?.innerText || "Episódio";
    const autor  = document.getElementById("banner-author")?.innerText || "Autor";
    const link   = window.location.href;
 
    return (
`${iconeProjeto} *${nomeProjeto}*

${iconeAudio} *${titulo}*
${iconeAutor} Autor: ${autor}

${iconeLink} Ouça agora:
${link}`
    );
}

 
function compartilharNativo(texto) {
    if (navigator.share) {
        navigator.share({
            title: "Podcast",
            text: texto,
            url: window.location.href
        }).catch(err => {
            console.log("Compartilhamento cancelado", err);
        });
    }
}

 
document.querySelectorAll(".share-option").forEach(btn => {
    btn.addEventListener("click", () => {

        const plataforma = btn.dataset.platform;
        const card = gerarCardPadrao();

        // WHATSAPP
        if (plataforma === "whatsapp") {
            const url = "https://wa.me/?text=" + encodeURIComponent(card);
            window.open(url, "_blank");
        } 
        else if (plataforma === "instagram") {
            navigator.clipboard.writeText(card);
            alert("O card foi copiado! Agora é só colar no Instagram.");
            window.open("https://instagram.com/", "_blank");
        }

        // COPIAR
        else if (plataforma === "copy") {
            navigator.clipboard.writeText(card);
            alert("Card copiado!");
        }

    });
});
 
document.querySelector(".share-btn").addEventListener("click", () => {
    const texto = gerarCardPadrao();
    compartilharNativo(texto);
});
