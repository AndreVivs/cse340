const form = document.querySelector("#updateForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button");
  updateBtn.removeAttribute("disabled");
});

const Updatingform = document.querySelector("#updateAccountForm");
Updatingform.addEventListener("change", function () {
  const updateBtn = document.querySelector("button");
  updateBtn.removeAttribute("disabled");
});
