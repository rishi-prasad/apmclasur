const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    receiptNo: {
        type: String,
        required: true,
    },
    farmerName: {
        type: String,
        required: true
    },
    dateOfFormSubmitted: {
        type: String,
        required: true
    },
    aadhar: {
        type: String,
        required: true
    },
    passbook: {
        type: String,
        required: true
    },
    landDoc: {
        type: String,
        required: true
    },
    outputFile: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Farmers', farmerSchema);