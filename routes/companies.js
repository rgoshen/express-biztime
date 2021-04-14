/** Routes for companies. */

const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

/** GET / => list of companies.
 *
 * =>  {companies: [{code, name, descrip}, {code, name, descrip}, ...]}
 *
 * */

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT code, name
           FROM companies
           ORDER BY name`
    );

    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /[code] => detail on company
 *
 * =>  {company: {code, name, description, invoices: [id, ...]}}
 *
 * */

router.get("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const compResult = await db.query(
      `SELECT code, name, description
           FROM companies
           WHERE code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    const company = compResult.rows[0];

    return res.json({ company: company });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
