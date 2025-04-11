
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function getHtmlContent(filePath, replacements) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                // Remplacer les marqueurs par les valeurs réelles
                let htmlContent = data;
                for (const key in replacements) {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    htmlContent = htmlContent.replace(regex, replacements[key]);
                }
                resolve(htmlContent);
            }
        });
    });
}

async function emailing(email, subject, html, replacements, text = '') {


    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Votre serveur SMTP
        port: 587, // Port SMTP
        secure: false, // true pour le port 465, false pour les autres ports
        auth: {
            user: 'wekaakibac@gmail.com', // Votre adresse e-mail
            pass: 'svpi sjzp rjsz pvtm' // Votre mot de passe
        },
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        }
    });

    let htmlContent;
    try {
        htmlContent = await getHtmlContent(html, replacements);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier HTML :', error);
        return;
    }


    // Définir les options de l'e-mail
    const mailOptions = {
        from: 'wekaakibac@gmail.com', // Adresse de l'expéditeur
        to: email.trim(), // Adresse du destinataire
        subject: subject, // Sujet de l'e-mail
        text: text, // Contenu textuel de l'e-mail
        html: htmlContent,
        attachments: [
            {
                filename: 'favicon.png', // Nom du fichier
                path: path.join(__dirname, 'assets/images/favicon.png'), // Chemin absolu de l'image
                cid: 'favicon'
            }
        ]
        // Contenu HTML de l'e-mail
    };

    try {
        // Envoyer l'e-mail
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('E-mail sent: ' + info.response);
        });
    } catch (error) {
        console.log(error);
    }
}
function findHtmlFile(dir, fileName, callback) {
    let found = false;

    function searchDirectory(currentDir) {
        fs.readdir(currentDir, (err, files) => {
            if (err) {
                return callback(err);
            }

            files.forEach((file) => {
                const filePath = path.join(currentDir, file);
                fs.stat(filePath, (err, stat) => {
                    if (err) {
                        return callback(err);
                    }

                    if (stat.isDirectory()) {
                        searchDirectory(filePath);
                    } else if (file === fileName && !found) {
                        found = true;
                        callback(null, filePath);
                    }
                });
            });
        });
    }

    searchDirectory(dir);
}


module.exports = { emailing, findHtmlFile };