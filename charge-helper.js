import CryptoJS from 'crypto-js'

// Define the encryption key and IV
const key = CryptoJS.enc.Utf8.parse('85281581');
const iv = CryptoJS.enc.Utf8.parse('univlive');

// Function to encrypt rawOrder
function encrypt(rawOrder) {
    const encrypted = CryptoJS.DES.encrypt(CryptoJS.enc.Utf8.parse(rawOrder), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

// Function to decrypt the response
function decrypt(encryptedOrder) {
    const decrypted = CryptoJS.DES.decrypt(encryptedOrder, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    const byteArray = new Uint8Array(decrypted.words.flatMap(word => [
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff
    ]));

    // Decode the decrypted data using GBK encoding
    const decoder = new TextDecoder('gbk');
    return decoder.decode(byteArray);
}

// Function to handle the encryption, POST request, and decryption
export async function processOrder(rawOrder, url) {
    // Encrypt the order
    const order = encrypt(rawOrder);

    // Prepare the request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `order=${encodeURIComponent(order)}`
    };

    try {
        // Send the POST request
        const response = await fetch(url, requestOptions);
        const responseText = await response.text();

        // Decrypt the response
        const decryptedResponse = decrypt(responseText.match(/\<string xmlns\=\"http\:\/\/tempuri\.org\/\"\>(.*?)\<\/string\>/)[1]);
        return JSON.parse(decryptedResponse.match(/(\{.*\})/)[1]);
    } catch (error) {
        console.error('Error:', error);
    }
}
