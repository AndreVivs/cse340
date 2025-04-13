"use strict";

const classificationList = document.querySelector("#classification_id");
const deleteButtonContainer = document.getElementById("classificationButton");

/* ****************************************
 *  Classification List
 * *************************************** */
classificationList.addEventListener("change", async () => {
  const classification_id = classificationList.value;

  try {
    const inventoryRes = await fetch(`/inv/getInventory/${classification_id}`);
    const data = inventoryRes.ok ? await inventoryRes.json() : [];
    buildInventoryList(data);
  } catch (error) {
    console.error("Error fetching inventory:", error);
  }

  try {
    const res = await fetch(
      `/inv/can-delete-classification/${classification_id}`
    );
    const { canDelete } = await res.json();

    if (canDelete) {
      renderDeleteButton(classification_id);
    } else {
      removeDeleteButton();
    }
  } catch (error) {
    console.error("Error checking if can delete classification:", error);
  }
});

/* ****************************************
 *  Delete Button for Classification
 * *************************************** */
function renderDeleteButton(classification_id) {
  removeDeleteButton();
  const buttonHTML = `
    <button
      id="deleteClassificationBtn"
      class="btn-delete-classification"
    > 🗑️ </button>
  `;

  deleteButtonContainer.innerHTML = buttonHTML;
  const deleteBtn = document.getElementById("deleteClassificationBtn");

  deleteBtn.addEventListener("click", async () => {
    const confirmed = confirm(
      "⚠️ WARNING: Deleting this classification will also permanently delete ALL associated vehicles. Continue?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/inv/delete-classification/${classification_id}`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        window.location.href = "/inv/";
      } else {
        const result = await res.json();
        alert(result.message || "Could not delete classification.");
      }
    } catch (err) {
      console.error("Error deleting classification:", err);
      alert("Something went wrong.");
    }
  });
}

/* ****************************************
 *  Remove Delete Button Just in Case
 * *************************************** */
function removeDeleteButton() {
  const existingBtn = document.getElementById("deleteClassificationBtn");
  if (existingBtn) existingBtn.remove();
}

/* ****************************************
 *  Build Inventory List - Table
 * *************************************** */
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");

  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";
  dataTable += "<tbody>";

  if (data === undefined || data.length === 0) {
    dataTable += `<tr><td>No Vehicle Found</td>`;
  } else {
    data.forEach(function (element) {
      console.log(element.inv_id + ", " + element.inv_model);
      dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
      dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
      dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
    });
  }

  dataTable += "</tbody>";

  inventoryDisplay.innerHTML = dataTable;
}
