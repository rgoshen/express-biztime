/** Routes for companies. */

const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");
const slugify = require("slugify");

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

/** POST / => add new company
 *
 * {name, description}  =>  {company: {code, name, description}}
 *
 * */

router.post("/", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true });

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[code] => update company
 *
 * {name, description}  =>  {company: {code, name, description}}
 *
 * */

router.put("/:code", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = req.params.code;

    const result = await db.query(
      `UPDATE companies
           SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ company: result.rows[0] });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
