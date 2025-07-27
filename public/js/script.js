// Wait for the DOM to be fully loaded before running any JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // ===== MOBILE HAMBURGER MENU =====

  // Show hamburger menu when closed icon is clicked (mobile only)
  if (document.getElementById("hamburger-menu-not-open")) {
    document
      .getElementById("hamburger-menu-not-open")
      .addEventListener("click", function () {
        // Hide the closed hamburger icon
        document
          .getElementById("hamburger-menu-not-open")
          .classList.add("hidden");
        // Show the open hamburger icon (X)
        document
          .getElementById("hamburger-menu-open")
          .classList.remove("hidden");
        // Show the mobile menu
        document.getElementById("hidden-menu").classList.remove("hidden");
      });
  }

  // Hide hamburger menu when open icon is clicked (mobile only)
  if (document.getElementById("hamburger-menu-open")) {
    document
      .getElementById("hamburger-menu-open")
      .addEventListener("click", function () {
        // Show the closed hamburger icon
        document
          .getElementById("hamburger-menu-not-open")
          .classList.remove("hidden");
        // Hide the open hamburger icon (X)
        document.getElementById("hamburger-menu-open").classList.add("hidden");
        // Hide the mobile menu
        document.getElementById("hidden-menu").classList.add("hidden");
      });
  }

  // ===== COPY TO CLIPBOARD FUNCTIONALITY =====

  // Copy short URL to clipboard when "Copier" button is clicked
  if (typeof isURLCreated !== "undefined" && isURLCreated) {
    document.getElementById("copy").addEventListener("click", function () {
      // Get the input field containing the short URL
      var input = document.getElementById("shorturl");

      // Select all text in the input field
      input.select();
      input.setSelectionRange(0, 99999); // Ensure selection works on mobile devices

      // Copy the selected text to clipboard
      navigator.clipboard.writeText(input.value).then(() => {
        // Update button text to show "Copié !"
        this.innerHTML =
          "<i class='bxr  bxs-copy' style='color:#838383'></i> Copié !";

        // Reset button text back to "Copier" after 1.5 seconds, keeps the icon
        setTimeout(() => {
          this.innerHTML =
            "<i class='bxr  bxs-copy' style='color:#838383'></i> Copier";
        }, 1500);
      });
    });
  }
});

// Global function for copying to clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      input.select();
    })
    .catch(function (err) {
      console.error("Erreur lors de la copie :", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("URL copiée dans le presse-papiers !");
    });
}
function showUrlAlert(url) {
  alert("URL originale : " + url);
}
