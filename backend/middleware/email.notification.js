import nodemailer from "nodemailer";

const sendEmail = async (to, subject, content) => {

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mail = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: content,
        };

        const info = await transporter.sendMail(mail);
        console.log("Email sent: ", info.response);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export { sendEmail };
