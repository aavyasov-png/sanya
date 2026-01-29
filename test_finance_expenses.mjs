#!/usr/bin/env node

/**
 * Test script for Uzum Finance Expenses API
 */

const PROXY_URL = 'https://ykbouygdeqrohizeqlmc.supabase.co/functions/v1/uzum-proxy';
const TOKEN = '17Z3s6FTmT6A/GJuWemvD3Y2jxowB3av9kTwB4S5N5I=';
const SHOP_ID = '96273';

async function testFinanceExpenses() {
  console.log('🧪 Testing Uzum Finance Expenses API...\n');

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: `/v1/finance/expenses?page=0&size=20&shopIds=${SHOP_ID}`,
        method: 'GET',
        headers: {
          'Authorization': TOKEN,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received\n');

    // Check structure
    if (data.payload && data.payload.payments) {
      console.log(`📊 Structure: {payload: {payments: [...]}}`);
      console.log(`📦 Total expenses: ${data.payload.payments.length}\n`);

      // Show first 3 expenses
      console.log('First 3 expenses:');
      data.payload.payments.slice(0, 3).forEach((expense, i) => {
        console.log(`\n${i + 1}. ${expense.name}`);
        console.log(`   Source: ${expense.source}`);
        console.log(`   Amount: ${expense.paymentPrice} x ${expense.amount} = ${expense.paymentPrice * expense.amount}`);
        console.log(`   Code: ${expense.code}`);
        console.log(`   Status: ${expense.status}`);
        console.log(`   Date: ${new Date(expense.dateCreated).toLocaleDateString('ru-RU')}`);
      });

      // Calculate totals by source
      console.log('\n\n📊 Totals by source:');
      const totals = {};
      data.payload.payments.forEach(payment => {
        const source = payment.source || 'Unknown';
        if (!totals[source]) {
          totals[source] = { count: 0, total: 0 };
        }
        totals[source].count++;
        totals[source].total += payment.paymentPrice * payment.amount;
      });

      Object.entries(totals).forEach(([source, data]) => {
        console.log(`   ${source}: ${data.count} payments, ${data.total.toLocaleString('ru-RU')} сум`);
      });

      // Calculate totals by code
      console.log('\n📊 Totals by code:');
      const codeMap = {};
      data.payload.payments.forEach(payment => {
        const code = payment.code || 'Unknown';
        if (!codeMap[code]) {
          codeMap[code] = { count: 0, total: 0 };
        }
        codeMap[code].count++;
        codeMap[code].total += payment.paymentPrice * payment.amount;
      });

      Object.entries(codeMap)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([code, data]) => {
          console.log(`   ${code}: ${data.count} payments, ${data.total.toLocaleString('ru-RU')} сум`);
        });

    } else {
      console.log('⚠️ Unexpected structure:', JSON.stringify(data, null, 2).substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFinanceExpenses();
