const notifications = document.getElementById("notifications");

// Object containing details for different types of toasts
const toastDetails = {
  success: {
    icon: "fa-circle-check",
    timer: 3000,
  },
  error: {
    icon: "fa-circle-xmark",
    timer: 5000,
  },
  warning: {
    icon: "fa-triangle-exclamation",
    timer: 4000,
  },
  info: {
    icon: "fa-circle-info",
    timer: 2000,
  },
};
const removeToast = (toast) => {
  toast.classList.remove("opacity-100");
  toast.classList.add("opacity-0");

  // After the transition duration, remove the element from the DOM
  setTimeout(() => {
    toast.remove();
  }, 500); // 500ms is the duration of the transition
};
const createToast = (id, text, timer) => {
  // Getting the icon and text for the toast based on the id passed
  const { icon } = toastDetails[id];
  const toast = document.createElement("div"); // Creating a new 'li' element for the toast
  const thisTimer = timer || toastDetails[id].timer;
  toast.style.setProperty("--animation-duration", thisTimer + "ms");
  toast.className = `alert alert-${id} cursor-pointer transition duration-200 opacity-0 hover:opacity-50`; // Setting the classes for the toast including opacity-0
  toast.role = "alert";
  // Setting the inner HTML for the toast
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <span>${text}</span>
  `;

  notifications.appendChild(toast); // Append the toast to the notification ul

  // Triggering reflow to apply transition effect on newly added toast
  void toast.offsetWidth;

  toast.classList.remove("opacity-0");
  // Adding the class to transition the toast in
  toast.classList.add("opacity-100");

  // Setting a timeout to remove the toast after the specified duration
  toast.timeoutId = setTimeout(() => removeToast(toast), thisTimer);
  toast.addEventListener("click", () => toast.remove());
};
