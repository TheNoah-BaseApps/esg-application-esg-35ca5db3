import { query } from '@/lib/database/aurora';

export async function generateEnergyRecordId() {
  try {
    const result = await query(
      `SELECT energy_record_id FROM energy_records 
       WHERE energy_record_id LIKE 'EN-%' 
       ORDER BY created_at DESC LIMIT 1`
    );

    let nextNumber = 1;
    
    if (result.rows.length > 0) {
      const lastId = result.rows[0].energy_record_id;
      const match = lastId.match(/EN-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `EN-${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating energy record ID:', error);
    const randomNum = Math.floor(Math.random() * 1000000);
    return `EN-${String(randomNum).padStart(6, '0')}`;
  }
}

export async function generateWasteRecordId() {
  try {
    const result = await query(
      `SELECT waste_record_id FROM waste_records 
       WHERE waste_record_id LIKE 'WS-%' 
       ORDER BY created_at DESC LIMIT 1`
    );

    let nextNumber = 1;
    
    if (result.rows.length > 0) {
      const lastId = result.rows[0].waste_record_id;
      const match = lastId.match(/WS-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `WS-${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating waste record ID:', error);
    const randomNum = Math.floor(Math.random() * 1000000);
    return `WS-${String(randomNum).padStart(6, '0')}`;
  }
}