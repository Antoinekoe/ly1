if (entryInDB === true) {
  // Handle "Raccourcir lien" button click: show URL form, hide QR form, update button styles
  document
    .getElementById("shortenUrl")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("shortenUrl").classList.add("button-blue");
      document.getElementById("createQrCode").classList.remove("button-blue");
      document.getElementById("createQrCodeFormResult").classList.add("hidden");
      document
        .getElementById("shortenUrlFormResult")
        .classList.remove("hidden");
      document.getElementById("createQrCodeForm").classList.add("hidden");
      document.getElementById("shortenUrlForm").classList.add("hidden");
    });

  // Handle "Créer QR Code" button click: show QR form, hide URL form, update button styles
  document
    .getElementById("createQrCode")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("shortenUrl").classList.remove("button-blue");
      document.getElementById("createQrCode").classList.add("button-blue");
      document
        .getElementById("createQrCodeFormResult")
        .classList.remove("hidden");
      document.getElementById("shortenUrlFormResult").classList.add("hidden");
    });
} else {
  // Handle "Raccourcir lien" button click: show URL form, hide QR form, update button styles
  document
    .getElementById("shortenUrl")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("shortenUrl").classList.add("button-blue");
      document.getElementById("createQrCode").classList.remove("button-blue");
      document.getElementById("createQrCodeForm").classList.add("hidden");
      document.getElementById("shortenUrlForm").classList.remove("hidden");
    });

  // Handle "Créer QR Code" button click: show QR form, hide URL form, update button styles
  document
    .getElementById("createQrCode")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("shortenUrl").classList.remove("button-blue");
      document.getElementById("createQrCode").classList.add("button-blue");
      document.getElementById("createQrCodeForm").classList.remove("hidden");
      document.getElementById("shortenUrlForm").classList.add("hidden");
    });
}

// Show hamburger menu (mobile)
document
  .getElementById("hamburger-menu-not-open")
  .addEventListener("click", function () {
    document.getElementById("hamburger-menu-not-open").classList.add("hidden");
    document.getElementById("hamburger-menu-open").classList.remove("hidden");
    document.getElementById("hidden-menu").classList.remove("hidden");
  });

// Hide hamburger menu (mobile)
document
  .getElementById("hamburger-menu-open")
  .addEventListener("click", function () {
    document
      .getElementById("hamburger-menu-not-open")
      .classList.remove("hidden");
    document.getElementById("hamburger-menu-open").classList.add("hidden");
    document.getElementById("hidden-menu").classList.add("hidden");
  });

// Copy short URL to clipboard when "Copier" button is clicked
document.getElementById("copy").addEventListener("click", function () {
  var input = document.getElementById("shorturl");
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    this.textContent = "Copié !";
    setTimeout(() => {
      this.innerHTML =
        "<i class='bxr  bxs-copy' style='color:#838383'></i> Copier";
    }, 1500);
  });
});
