// Pega os elementos do HTML
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("fullImage");
const span = document.getElementsByClassName("close")[0];
const track = document.querySelector('.slide-track');

// Pega todas as imagens dentro dos slides do carrossel
const images = document.querySelectorAll('.slide img');

// Para cada imagem do carrossel, adiciona um "ouvidor de cliques"
images.forEach(img => {
    img.addEventListener('click', function () {
        modal.style.display = "flex"; // Mostra o modal (usando flex para centralizar)
        modal.style.alignItems = "center"; // Centraliza verticalmente
        modal.style.justifyContent = "center"; // Centraliza horizontalmente
        modalImg.src = this.src; // Pega o SRC da imagem clicada e põe no modal

        // Opcional: Pausa o carrossel enquanto o modal está aberto
        track.style.animationPlayState = 'paused';
    });
});

// Quando clicar no 'X' (span), fecha o modal
span.onclick = function () {
    modal.style.display = "none";
    // Opcional: Retoma o carrossel
    track.style.animationPlayState = 'running';
}

// Se clicar fora da imagem (no fundo preto), também fecha
modal.onclick = function (event) {
    // Certifica-se de que o clique foi exatamente no fundo do modal e não na imagem
    if (event.target === modal) {
        modal.style.display = "none";
        // Opcional: Retoma o carrossel
        track.style.animationPlayState = 'running';
    }
}

