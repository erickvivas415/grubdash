const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { router } = require("../../../../starter-robust-server-structure-paste/src/app");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: dishes });
  }
  
  function validateDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    if (!name || name.trim() === "") return next({ status: 400, message: "Dish must include a name" });
    if (!description || description.trim() === "") return next({ status: 400, message: "Dish must include a description" });
    if (!price || typeof price !== "number" || price <= 0) return next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    if (!image_url || image_url.trim() === "") return next({ status: 400, message: "Dish must include a image_url" });
  
    next();
  }
  
  function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = { id: nextId(), name, description, price, image_url };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
  
  function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((d) => d.id === dishId);
    if (!foundDish) return next({ status: 404, message: `Dish does not exist: ${dishId}` });
    res.locals.dish = foundDish;
    next();
  }
  
  function read(req, res) {
    res.json({ data: res.locals.dish });
  }
  
  function update(req, res, next) {
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
  
    if (id && id !== dishId) return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
  
    Object.assign(res.locals.dish, { name, description, price, image_url });
    res.json({ data: res.locals.dish });
  }
  
  module.exports = {
    list,
    create: [validateDish, create],
    read: [dishExists, read],
    update: [dishExists, validateDish, update],
  };