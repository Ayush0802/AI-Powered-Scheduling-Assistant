const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    fontstyle: {
        type: String,
        required: true
    },
    fontsize: {
        type: String,
        required: true
    },
    notiftime: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);