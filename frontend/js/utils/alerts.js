class VisitPassAlert {
  static show(title, message, type = "success") {
    const isSuccess = type === "success";

    const backdrop = document.getElementById(
      isSuccess ? "modal-success" : "modal-error",
    );
    const box = document.getElementById(
      isSuccess ? "success-box" : "error-box",
    );
    const titleEl = backdrop.querySelector(".modal-title");
    const messageEl = backdrop.querySelector(".modal-message");

    titleEl.textContent = title;
    messageEl.textContent = message;

    backdrop.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.add("opacity-100");
    box.classList.remove("scale-90");
    box.classList.add("scale-100", "modal-show");
  }

  static hide(type = "success") {
    const isSuccess = type === "success";
    const backdrop = document.getElementById(
      isSuccess ? "modal-success" : "modal-error",
    );
    const box = document.getElementById(
      isSuccess ? "success-box" : "error-box",
    );

    backdrop.classList.add("opacity-0", "pointer-events-none");
    backdrop.classList.remove("opacity-100");
    box.classList.add("scale-90");
    box.classList.remove("scale-100", "modal-show");
  }
}
