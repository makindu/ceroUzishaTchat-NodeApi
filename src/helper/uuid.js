function generatePrefixedUUID(prefix) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    // Générer une chaîne aléatoire de 8 caractères (a-z, A-Z, 0-9) sans doublons
    const randomString = generateRandomString(8);

    return `${prefix}-${formattedDate}${randomString}`;
}
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let availableCharacters = characters.split('');
    let result = '';

    for (let i = 0; i < length; i++) {
        if (availableCharacters.length === 0) {
            throw new Error('Not enough unique characters to generate the string');
        }

        const randomIndex = Math.floor(Math.random() * availableCharacters.length);
        result += availableCharacters[randomIndex];
        availableCharacters.splice(randomIndex, 1); // Remove the used character
    }

    const date = new Date();
    const timestamp = date.getTime().toString(); // Get time in milliseconds and convert to string

    // Get the last 5 characters of result and timestamp
    const last5Result = result.slice(-5).toUpperCase();
    const last5Timestamp = timestamp.slice(-5);

    return `${last5Result}-${last5Timestamp}`;
}
module.exports = { generatePrefixedUUID, generateRandomString };