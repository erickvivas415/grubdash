const path = require("path");

const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const found = orders.find((order) => order.id === orderId);
  if (!found) return next({ status: 404, message: `Order not found: ${orderId}` });
  res.locals.order = found;
  next();
}

function validateOrderFields(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, id, status } = {} } = req.body;

  if (!deliverTo || deliverTo.trim() === "")
    return next({ status: 400, message: "Order must include a deliverTo" });

  if (!mobileNumber || mobileNumber.trim() === "")
    return next({ status: 400, message: "Order must include a mobileNumber" });

  if (!Array.isArray(dishes) || dishes.length === 0)
    return next({ status: 400, message: "Order must include at least one dish" });

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    if (
      dish.quantity === undefined ||
      typeof dish.quantity !== "number" ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  res.locals.validatedOrder = { deliverTo, mobileNumber, dishes, status, id };
  next();
}

function validateOrderStatus(req, res, next) {
  const { status, id } = res.locals.validatedOrder;
  const { orderId } = req.params;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }

  if (!status || !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
    return next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (res.locals.order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  next();
}

function create(req, res) {
  const { deliverTo, mobileNumber, dishes } = res.locals.validatedOrder;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const { deliverTo, mobileNumber, status, dishes } = res.locals.validatedOrder;

  Object.assign(res.locals.order, {
    deliverTo,
    mobileNumber,
    status,
    dishes,
  });

  res.json({ data: res.locals.order });
}

function destroy(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  const index = orders.findIndex((order) => order.id === res.locals.order.id);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateOrderFields, create],
  update: [orderExists, validateOrderFields, validateOrderStatus, update],
  delete: [orderExists, destroy],
};