document.getElementById("year").textContent = new Date().getFullYear();

const shareButton = document.getElementById("shareButton");
const shareStatus = document.getElementById("shareStatus");

shareButton.addEventListener("click", async () => {
  const data = {
    title: "Hasta el Rabo Todo es Toro",
    text: "Escucha el podcast Hasta el Rabo Todo es Toro",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
      shareStatus.textContent = "¡Gracias por compartir!";
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      shareStatus.textContent = "Enlace copiado al portapapeles.";
    } else {
      shareStatus.textContent = "Copia la dirección de esta página para compartirla.";
    }
  } catch {
    shareStatus.textContent = "";
  }
});
