const nodemailer = require('nodemailer');


function sendMail(){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'paintings.app@gmail.com',
            pass: 'bFVeQN2cGPA3UB6'
        }
    });
    
    let mailOptions = {
        from: 'paintings.app@gmail.com',
        to: 'mada.madautza@gmail.com',
        subject: 'Hello, Madalina',
        text: 'Test nodemailer'
    };
    
    transporter.sendMail(mailOptions, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            console.log('Nodemailer has sent an email!');
        }
        
    });
}
