const Router = require("express");
const router = new Router();
const DeviceController = require("./../controllers/typeController");

router.post("/", DeviceController.create);
router.get("/");
router.get("/:id");

module.exports = router;
