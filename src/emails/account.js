const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// This is the most basic example of sending an email. In the following we will integrate it with our application to send email
// whenever someone creates or deletes his accounts
// sgMail.send({
//     to: 'cfcfahim26@gmail.com',
//     from: 'c181118@ugrad.iiuc.ac.bd',
//     subject: 'Testing out SendGrid library for the second time',
//     text: 'Hi receiver, This is a test mail sent to you by SendGrid, I hope this one actually gets to you'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'c181118@ugrad.iiuc.ac.bd',
        subject: 'Thanks for joining in!',
        text: `Hello, ${name}, We are delighted to have you on board. We are open to your suggestions. If you have any queries or suggestions please let us know. We are open to changes and improve our application. Thank you and Welcome onboard :)`
    })
}

const sendCancellationEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'c181118@ugrad.iiuc.ac.bd',
        subject: 'Sorry to see you go!',
        text: `Sorry to see you go, ${name}, Hope we meet sometime soon`
    })
}



module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}