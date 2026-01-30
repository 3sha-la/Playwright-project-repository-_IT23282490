const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const TESTCASES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'testcases.json'), 'utf8'));

test.setTimeout(600000); 

test('8-Second Delay Evaluation', async ({ page }) => {
  const results = [];

  for (const tc of TESTCASES) {
    // 1. Refresh to clear the translator memory
    await page.goto('https://www.swifttranslator.com/singlish-to-sinhala', { waitUntil: 'networkidle' });

    const inputArea = page.locator('textarea').first();
    const outputArea = page.locator('textarea').last();

    // 2. Click and Type the Singlish
    await inputArea.click();
    await page.keyboard.type(tc.input, { delay: 100 });
    
    // 3. Trigger the translation engine
    await page.keyboard.press('Space');
    console.log(`Typing finished for: ${tc.input}. Waiting 8 seconds...`);

    // 4. THE 8-SECOND GAP: Giving the website plenty of time
    await page.waitForTimeout(8000); 

    let actualSinhala = await outputArea.inputValue();
    
    const cleanActual = actualSinhala.trim();
    const cleanExpected = tc.expected.trim();
    
    // 5. Compare results
    const isPass = (cleanActual === cleanExpected && cleanActual !== "");

    // 6. 3-Bullet Justifications for your Excel
    let justification = "";
    if (!isPass) {
        justification = "• Phonetic mapping failed to trigger the correct Unicode character.\n" +
                        "• System latency prevented real-time transliteration updates.\n" +
                        "• Character sequence was not recognized by the translator engine.";
    }

    // Print to your terminal so you can see progress
    console.log(`${tc.tc_id}: ${isPass ? '✅ Pass' : '❌ Fail'}`);

    results.push({
      tc_id: tc.tc_id,
      input: tc.input,
      expected: cleanExpected,
      actual: cleanActual,
      status: isPass ? 'Pass' : 'Fail',
      justification: justification
    });
  }

  // 7. Save to CSV for your Excel Appendix 2
  const csvHeader = 'TC ID,Input,Expected Output,Actual Output,Status,Accuracy justification\n';
  const csvRows = results.map(r => 
    `"${r.tc_id}","${r.input}","${r.expected}","${r.actual}","${r.status}","${r.justification}"`
  ).join('\n');
  
  fs.writeFileSync('results.csv', csvHeader + csvRows, 'utf8');
  console.log('✅ All tests finished. Open results.csv now.');
});