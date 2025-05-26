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

function read(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === Number(dishId);
  
  if (foundDish) {
    res.json({ data: foundDish });
  } else {
    next({
      status: 404,
      message: `Dish id not exist: ${dishId}`,
    });
  }
}

function update(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === Number(dishId));
  
  if (foundDish) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    
    // Update the dish
    foundDish.name = name;
    foundDish.description = description;
    foundDish.image_url = image_url;
    foundDish.price = price;
    
    res.json({ data: foundDish });
  }
  else {
    next({
      status: 404,
      message: `Dish id not exist: ${dishId}`,
    });
  }
}


