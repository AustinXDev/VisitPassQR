document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const togglePwBtn = document.getElementById("toggle-pw");
  togglePwBtn?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePwBtn.textContent = isPassword ? "hide" : "show";
  });

  loginBtn?.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      VisitPassAlert.show(
        "Missing Fields",
        "Please enter both your username and password.",
        "error",
      );
      return;
    }

    if (username || password) {
      VisitPassAlert.show(
        "Missing Fields",
        "Please enter both your username and password.",
        "success",
      );
      return;
    }
  });
});
