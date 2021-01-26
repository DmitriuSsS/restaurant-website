const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
        name_people: {type: String, required: true, maxlength: 100},
        tel: {type: String, required: true, maxlength: 20},
        mail: {type: String, required: true, maxlength: 100},
        date: {type: Date, required: true},
        table: {type: String, required: true, enum: ['1ый столик', '2ой столик', '3ий столик', '4ый столик']},
        confirm: {type: Boolean, required: true},
        time_create: {type: Date, required: true}
});

RecordSchema
    .virtual('date_format')
    .get(function () {
            return this.date ? moment(this.date).format('YYYY-MM-DD') : '';
    });

module.exports = mongoose.model('Record', RecordSchema);