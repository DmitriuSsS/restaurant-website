const express = require('express');
const router = express.Router();

const booking_controller = require('../controllers/booking_controller')
const password_for_view_all_records = require('../config').password_for_view_all_records


router.get('/', booking_controller.render_booking);

router.post('/', booking_controller.create_record);

router.get(`/all/${password_for_view_all_records}`, booking_controller.render_all_records);

router.get('/:id', booking_controller.render_record);

router.get('/:id/confirm', booking_controller.render_record_confirm);

router.get('/:id/delete', booking_controller.render_record_delete);


module.exports = router
