import dotenv from 'dotenv';
dotenv.config();

const testOpenAI = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing API Key! Please check your .env file.');
      return;
    }

    console.log('🔍 Checking OpenAI API Key...');
    console.log('✅ API Key found (hidden for security)');

    console.log('\n🤖 Testing OpenAI API...\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello, I am working!" in one sentence.' }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! OpenAI API is working!');
      console.log('Response:', data.choices[0].message.content);
      console.log('\n🎉 Your OpenAI API key is valid!\n');
    } else {
      console.error('❌ ERROR:', data.error?.message || 'Unknown error');
      console.error('\n🔧 Please check:');
      console.error('1. Your API key is valid and active');
      console.error('2. You have credits/quota available');
      console.error('3. The API key has correct permissions');
    }

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
  }
};

testOpenAI();
