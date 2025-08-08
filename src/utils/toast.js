const showToast = (title, message, type = "success") => {
  const toastContainer =
    document.querySelector(".toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon;
  switch (type) {
    case "success":
      icon = "fas fa-check";
      break;
    case "warning":
      icon = "fas fa-exclamation-triangle";
      break;
    case "error":
      icon = "fas fa-exclamation-circle";
      break;
    default:
      icon = "fas fa-info";
  }

  toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastSlide 0.3s ease reverse";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

const createToastContainer = () => {
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
};

export default showToast;
