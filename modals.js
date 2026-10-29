/**
 * NutriTrack Interactive Modals & Toast Notification System
 * - Food Detail & Calculator Modal (Live quantity/unit scaler)
 * - Smart NLP Entry Review Modal
 * - Custom Recipe Builder Modal
 * - Edit Diary Entry Modal
 * - Toast Notifications with Undo Capability
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.Modals = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  let activeModal = null;
  let toastTimer = null;
  let undoCallback = null;

  function showToast(message, options = {}) {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "app-toast";
      document.body.appendChild(toast);
    }

    clearTimeout(toastTimer);
    undoCallback = options.onUndo || null;

    let contentHtml = `<span class="toast-text">${message}</span>`;
    if (options.onUndo) {
      contentHtml += `<button type="button" class="toast-undo-btn" id="toastUndoBtn">Undo</button>`;
    }
    contentHtml += `<button type="button" class="toast-close" id="toastCloseBtn">×</button>`;

    toast.innerHTML = contentHtml;
    toast.classList.add("visible");

    if (options.onUndo) {
      document.getElementById("toastUndoBtn").onclick = () => {
        if (undoCallback) undoCallback();
        hideToast();
      };
    }
    document.getElementById("toastCloseBtn").onclick = hideToast;

    const duration = options.duration || (options.onUndo ? 6000 : 3500);
    toastTimer = setTimeout(hideToast, duration);
  }

  function hideToast() {
    const toast = document.getElementById("appToast");
    if (toast) {
      toast.classList.remove("visible");
    }
  }

  function openModal(modalId) {
    closeActiveModal();
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add("open");
      activeModal = el;
      document.body.classList.add("modal-open");
      const firstInput = el.querySelector("input:not([type=hidden]), button");
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  }

  function closeActiveModal() {
    if (activeModal) {
      activeModal.classList.remove("open");
      activeModal = null;
      document.body.classList.remove("modal-open");
    }
  }

  // Setup backdrop click and escape key closing
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeModal) {
      closeActiveModal();
    }
  });

  return {
    showToast: showToast,
    hideToast: hideToast,
    openModal: openModal,
    closeActiveModal: closeActiveModal
  };
}));
