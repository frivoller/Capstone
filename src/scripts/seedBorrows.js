const axios = require('axios');
const borrows = require('../data/borrows.json');

const API_URL = 'https://advisory-slug-frivoller-95937079.koyeb.app/api/v1/borrows';

async function seedBorrows() {
  try {
    for (const borrow of borrows) {
      const response = await axios.post(API_URL, borrow);
      console.log(`Ödünç alma kaydı oluşturuldu: ${response.data.id}`);
    }
    console.log('Tüm ödünç alma kayıtları başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Hata:', error.response?.data || error.message);
  }
}

seedBorrows(); 