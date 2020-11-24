const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

// mongodb+srv://user:rishiprasad@123@cluster0.749kx.mongodb.net/allFarmers?retryWrites=true&w=majority {  }
// Setting up mongodb connection   mongodb+srv://rishiprasad:rishiprasad@123@cluster0.vhyhx.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect('mongodb://localhost/newFarmers', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', error => console.log(error));
db.once('open', () => console.log('Connected to mongodb'));


const Farmers = require('./farmer');

function zeroPad(num) {
    let string = String(num);
    while (string.length <= 7) {
        string = "0" + string;
    }
    return string;
}

// pdf modules

const PDFdocument = require('pdfkit');
const fs = require('fs');


const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');


app.use(express.static('public'));

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json());

// multer configuration

let Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: function(req, file, callback) {
        console.log(file.originalname);
        callback(null, `${file.fieldname}_${Date.now() + (Math.random() * 10000000000000000123)}_${file.originalname}`);
    }
});

let upload = multer({
    storage: Storage,
}).fields([{name: 'aadharFile', maxCount: 1}, {name: 'farmFile', maxCount: 1}, {name: 'passbook', maxCount: 1}]);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/facilities', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'facilities.html'));
});

app.get('/gallary', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallary.html'));
});




// form section =======================================



app.get('/registration', (req, res) => {
    res.render('form');
});

app.post('/registration', (req, res) => {

    // const doc = new PDFdocument();
    // const receiver = new PDFdocument();
    // doc.pipe(fs.createWriteStream(path.join(__dirname, 'pdfOutput', `output_${Date.now()}.pdf`)));
    // receiver.pipe(fs.createWriteStream(path.join(__dirname, 'receiverOutput', `output_${Date.now()}.pdf`)));

    // doc.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(18).text(`शेतकर्‍याचे नाव: ${req.body.name}\nआधार कार्ड क्रमांक: ${req.body.aadharNumber}\nफोन.नं / मो.नं: ${req.body.phoneNumber}\nगाव: ${req.body.village}\nतालुका: ${req.body.taluka}\nजिल्हा: ${req.body.district}\nजतीचे प्रवर्ग: ${req.body.castClass}\nबँकेचे नाव: ${req.body.bankName}\nशाखा: ${req.body.bankBranch}\nबँकेचे IFSC कोड क्रमांक: ${req.body.bankIFSC}\n7/12 गट क्रमांक: ${req.body.gutNumber}\nजमीन क्षेत्र: ${req.body.area}`)
    // receiver.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(26).text(`पोच पावती \n नाव: ${req.body.name} \n फॉर्म जमा करण्याची तारीख: ${new Date()}`);

    // doc.end();
    // receiver.end();

    upload(req, res, err => {
        if (err) {
            console.log(err);
            res.send(err);
        } else if (req.files['aadharFile'][0].size > 1049000 || req.files['passbook'][0].size > 1049000 || req.files['farmFile'][0].size > 1049000) {
            res.render('form', { err: 'खाली दिलेली कागदपत्राची साईज प्रत्येकी 1mb पेक्षा कमी असावी' });
        } else {
            global.receiverFile = `reveiver_${Date.now()}.pdf`;
            global.outputFile = `output_${Date.now()}.pdf`;

            console.log(req.files['aadharFile'][0].size);

            Farmers.find({}, (e, findFarmers) => {
                if (e) {
                    console.log(e);
                }
                const farmer = new Farmers({
                    receiptNo: `${zeroPad(findFarmers[0] === undefined ? 1 : Number(findFarmers[findFarmers.length - 1].receiptNo) + 1)}`,
                    farmerName: req.body.name,
                    dateOfFormSubmitted: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                    aadhar: `${req.files['aadharFile'][0].filename}`,
                    passbook: `${req.files['passbook'][0].filename}`,
                    landDoc: `${req.files['farmFile'][0].filename}`,
                    outputFile: `${global.outputFile}`
                });

                console.log(global.receiverFile);
                console.log(global.outputFile);
                farmer.save((e, result) => {
                    if (e) console.log(e);
                    else {
                        console.log('New field created');
                        const doc = new PDFdocument();
                        const receiver = new PDFdocument();
                        doc.pipe(fs.createWriteStream(path.join(__dirname, 'pdfOutput', global.outputFile)));
                        receiver.pipe(fs.createWriteStream(path.join(__dirname, 'receiverOutput', global.receiverFile)));

                        console.log(result);

                        doc.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(15).text(`पावती क्रमांक: ${result.receiptNo}\n\nनाव: ${req.body.name}\n\nआधार कार्ड क्रमांक: ${req.body.aadharNumber}\n\nफोन.नं / मो.नं: ${req.body.phoneNumber}\n\nगाव: ${req.body.village}\n\nतालुका: ${req.body.taluka}\n\nजिल्हा: ${req.body.district}\n\nजातीचे प्रवर्ग: ${req.body.castClass}\n\nबँकेचे नाव: ${req.body.bankName}\n\n बँकेचे खाते क्रमांक: ${req.body.bankAc}\n\nशाखा: ${req.body.bankBranch}\n\nबँकेचे IFSC कोड क्रमांक: ${req.body.bankIFSC}\n\n7/12 गट क्रमांक: ${req.body.gutNumber}\n\nजमीन क्षेत्र: ${req.body.area}`);

                        receiver.image(path.join(__dirname, 'public', 'images', 'logo.jpg'), 290, 50, {
                            fit: [60, 60],
                            align: 'center',
                            valign: 'top' 
                        });
                        receiver.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(26).text(`\nकृषि उत्पन्न बाजार समिती, सचिव,`, 150, 80);   
                        receiver.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(20).text(`\nलासूर स्टेशन, ता. गंगापूर, जि. औरंगाबाद`, 165, 120);
                        receiver.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(22).text(`\n\n पोच पावती`, 250, 160);
                        receiver.font(path.join(__dirname, 'fonts', 'NotoSans.ttf')).fontSize(20).text(`\nपावती क्रमांक: ${result.receiptNo}\n नाव: ${req.body.name} \n फॉर्म जमा करण्याची तारीख: ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`, 140, 230);

                        doc.end();
                        receiver.end();
                    }
                });
                res.render('sent');
            });
        }
    });
});

app.get('/pdf', (req, res) => {
    res.contentType('application/pdf');
    res.sendFile(path.join(__dirname, 'receiverOutput', global.receiverFile));
    // global.receiverFile = null;
    global.outputFile = null;
});

app.get('/all_farmers_list', (req, res) => {
    //try {
    //    const allFarmers = await Farmers.find({});
    //    res.render('allfarmers', { farmers: allFarmers });
    //} catch (e) {
    //    console.log(e);
    //}

    Farmers.find({}, (e, result) => {
        if (e) {
	    console.log(e);
	} else {
	    res.render('allfarmers', { farmers: result });
	}
    });
});

app.get('/pdfOutput/:file', (req, res) => {
    res.contentType('application/pdf');
    res.sendFile(path.join(__dirname, 'pdfOutput', req.params.file));
});

app.get('/public/uploads/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'uploads', req.params.file));
});

app.post('/all_farmers_list/sorted_list', (req, res) => {
    Farmers.find({}, (e, results) => {
        let sorted = results.filter(result => Number(result.receiptNo) >= req.body.from && Number(result.receiptNo) <= req.body.to);
        res.render('sorted', {sorted: sorted});
    });
});

app.listen(port, () => console.log(`Server started at port ${port}`));