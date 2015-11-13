'use strict';

var Joi = require('joi');

module.exports = {
    body: {
        data: {
        salutation: Joi.string().required(),
        forename: Joi.string().required(),
        surname: Joi.string().required(),
        street: Joi.string().required(),
        street_nr: Joi.string().required(),
        po_box: Joi.string(),
        zip: Joi.string().required(),
        city: Joi.string().required(),
        email: Joi.string().required(),
        telephone: Joi.string().required(),
        bank_name: Joi.string(),
        bank_city:Joi.string(),
        bank_iban: Joi.string(),
        bank_account: Joi.string(),
        upload_file: Joi.string().required()
        }
    }
};