document
  .getElementById("shortenUrl")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("shortenUrl").classList.add("button-blue");
    document.getElementById("createQrCode").classList.remove("button-blue");
    document.getElementById("shortenUrlForm").style.display = "";
    document.getElementById("createQrCodeForm").style.display = "none";
  });
document
  .getElementById("createQrCode")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("shortenUrl").classList.remove("button-blue");
    document.getElementById("createQrCode").classList.add("button-blue");
    document.getElementById("shortenUrlForm").style.display = "none";
    document.getElementById("createQrCodeForm").style.display = "";
  });

document
  .getElementById("hamburger-menu-not-open")
  .addEventListener("click", function () {
    document.getElementById("hamburger-menu-not-open").classList.add("hidden");
    document.getElementById("hamburger-menu-open").classList.remove("hidden");
    document.getElementById("hidden-menu").classList.remove("hidden");
  });

document
  .getElementById("hamburger-menu-open")
  .addEventListener("click", function () {
    document
      .getElementById("hamburger-menu-not-open")
      .classList.remove("hidden");
    document.getElementById("hamburger-menu-open").classList.add("hidden");
    document.getElementById("hidden-menu").classList.add("hidden");
  });
