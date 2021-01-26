const path = require('path');
const Record = require('../models/record');
const { spawn } = require('child_process');
const config = require('../config');

const login = config.login;
const password = config.password;


function render_booking(req, res) {
    res.render('booking', {
        tables: ['1ый столик', '2ой столик', '3ий столик', '4ый столик'],
        min_date: new Date().toISOString().split('T')[0],
        haveRecord: false
    });
}

function render_record(req, res) {
    Record.findById(req.params.id).exec(function (err, record) {
        if (err || !record) {
            console.log(err);
            res.render('record', {
                existsID: false,
                text: 'Записи с таким ID не существует'
            });
        } else {
            res.render('record', {
                record,
                existsID: true
            });
        }
    });
}

function render_all_records(req, res, next) {
    Record.find().exec(function (err, records) {
        if (err) {
            return next(err);
        }
        res.render('all_records', {records});
    });
}

function send_confirm_letter(recipient, name_recipient, id) {
    const path_to_script = path.join(__dirname, '..', 'smtp', 'smtp-client.py');
    const letter = `Здравствуйте уважаемый, ${name_recipient}\n\nЧтобы подтвердить и/или удалить запись просим вас перейти по этой ссылке: http://127.0.0.1:3000/booking/${id}\n\nС уважением, Ваш Ресторан\n\nЭто сообщение сгенерированно автоматически, на него не надо отвечать`;

    spawn('python', [path_to_script, letter, recipient, login, password]);

}

const create_record = [
    (req, res, next) => {
        const name_people = req.body.name;
        const tel = req.body.tel;
        const mail = req.body.mail;
        const date = req.body.date;
        const table = req.body.table;

        const record = new Record({
            name_people,
            tel,
            mail,
            date,
            table,
            confirm: false,
            time_create: Date.now()
        });

        Record.find({date, table})
            .$where(function () {
                return this.confirm || this.time_create > new Date(new Date().getMilliseconds() - 15 * 60 * 1000);
            })
            .exec(function (err, records_info) {
                if (err) {
                    console.log(err);
                } else {
                    if (records_info.length === 0) {
                        record.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                        });
                        send_confirm_letter(mail, name_people, record._id);
                        res.redirect('/');
                    } else {
                        res.render('booking', {
                            tables: ['1ый столик', '2ой столик', '3ий столик', '4ый столик'],
                            min_date: new Date().toISOString().split('T')[0],
                            error: `К сожалению столик, что вы выбрали занят, пожалуйста выберите другой столик`,
                            record: record,
                            haveRecord: true
                        });
                    }
                }
            });
    }
];

function render_record_confirm(req, res) {
    const id = req.params.id;
    const title = 'Подтверждение брони';
    Record.findById(id).exec((err, record) => {
        if (err || !record) {
            res.render('confirm_delete_record', {title, text: 'Записи с таким ID не существует'});
        } else {
            Record.findByIdAndUpdate(id, {confirm: true}, {}, function (err) {
                if (err) {
                    console.log(err);
                    res.render('confirm_delete_record', {title, text: 'Мы не смогли подтвердить вашу запись, пожалуйста свяжитесь с нами'});
                } else {
                    res.render('confirm_delete_record', {title, text: 'Ваша запись успешно подтверждена'})
                }
            })
        }
    });
}

function render_record_delete(req, res) {
    const id = req.params.id;
    const title = 'Удаление записи'
    Record.findById(id).exec((err, record) => {
        if (err || !record) {
            res.render('confirm_delete_record', {title, text: 'Записи с таким ID не существует'});
        } else {
            Record.findByIdAndDelete(id, {}, function (err) {
                if (err) {
                    console.log(err);
                    res.render('confirm_delete_record', {title, text: 'Мы не смогли удалить вашу запись, пожалуйста свяжитесь с нами'});
                } else {
                    res.render('confirm_delete_record', {title, text: 'Ваша запись успешно удалена'})
                }
            })
        }
    });
}

module.exports = {
    render_booking,
    create_record,
    render_record,
    render_record_confirm,
    render_record_delete,
    render_all_records
}