document
  .getElementById("shortenUrl")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("shortenUrlForm").style.display = "";
    document.getElementById("createQrCodeForm").style.display = "none";
  });
document
  .getElementById("createQrCode")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("shortenUrlForm").style.display = "none";
    document.getElementById("createQrCodeForm").style.display = "";
  });
