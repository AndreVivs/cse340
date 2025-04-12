const pool = require("../database/");

/* ***************************
 *  Get All Classification Data
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return data;
  } catch (error) {
    console.error("getClassifications error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get All Inventory Items and Classification_name By Classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get Specific Inventory Item by ID
 * ************************** */
async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [invId]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error " + error);
    throw error;
  }
}

/* ***************************
 *  Insert a new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const checkSql =
      "SELECT * FROM classification WHERE classification_name = $1";
    const checkResult = await pool.query(checkSql, [classification_name]);

    if (checkResult.rows.length > 0) {
      return { exists: true };
    }
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const data = await pool.query(sql, [classification_name]);
    return { success: true, row: data.rows[0] };
  } catch (error) {
    console.error("insertClassification error:", error);
    return { success: false, error };
  }
}

/* ***************************
 *  Insert a new Inventory Item
 * ************************** */
async function addInventoryItem(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
         INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description,
           inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *;
       `;
    const result = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("addInventoryItem error:", error);
    return null;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount > 0; // If rowCount is greater than 0, delete was successful
  } catch (error) {
    throw new Error("Delete Inventory Error");
  }
}

/* ***************************
 *  Check if a classification already exists
 * ************************** */
async function checkClassificationExists(classification_name) {
  try {
    const sql =
      "SELECT classification_id FROM classification WHERE classification_name = $1";
    const result = await pool.query(sql, [classification_name]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking classification existence:", error);
    return false;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  insertClassification,
  addInventoryItem,
  updateInventory,
  deleteInventoryItem,
  checkClassificationExists,
};
