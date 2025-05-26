const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: orders });
  }
  
  function orderExists(req, res, next) {
    const { orderId } = req.params;
    const found = orders.find((o) => o.id === orderId);
    if (!found) return next({ status: 404, message: `Order not found: ${orderId}` });
    res.locals.order = found;
    next();
  }
  
  function validateOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    if (!deliverTo || deliverTo.trim() === "") return next({ status: 400, message: "Order must include a deliverTo" });
    if (!mobileNumber || mobileNumber.trim() === "") return next({ status: 400, message: "Order must include a mobileNumber" });
    if (!Array.isArray(dishes) || dishes.length === 0) return next({ status: 400, message: "Order must include at least one dish" });
  
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      if (!dish.quantity || typeof dish.quantity !== "number" || dish.quantity <= 0) {
        return next({ status: 400, message: `Dish ${i} must have a quantity that is an integer greater than 0` });
      }
    }
  
    next();
  }
  
  function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = { id: nextId(), deliverTo, mobileNumber, status, dishes };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
  
  function read(req, res) {
    res.json({ data: res.locals.order });
  }
  
  function update(req, res, next) {
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    if (id && id !== orderId) return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.` });
    if (!status || !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
      return next({ status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
    }
    if (res.locals.order.status === "delivered") {
      return next({ status: 400, message: "A delivered order cannot be changed" });
    }
  
    Object.assign(res.locals.order, { deliverTo, mobileNumber, status, dishes });
    res.json({ data: res.locals.order });
  }
  
  function destroy(req, res, next) {
    const { orderId } = req.params;
    if (res.locals.order.status !== "pending") {
      return next({ status: 400, message: "An order cannot be deleted unless it is pending" });
    }
  
    const index = orders.findIndex((o) => o.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
  }
  
  module.exports = {
    list,
    read: [orderExists, read],
    create: [validateOrder, create],
    update: [orderExists, validateOrder, update],
    delete: [orderExists, destroy],
  };