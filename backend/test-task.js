async function run() {
  try {
    let token;
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikash@example.com', password: 'password123' })
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      console.log('Login successful');
    } else {
      console.log('Login failed, registering...');
      const registerRes = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })
      });
      const data = await registerRes.json();
      token = data.token;
      console.log('Registered', data);
    }
    
    const taskRes = await fetch('http://localhost:5001/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ title: 'Test Task', projectId: '' })
    });
    const taskData = await taskRes.json();
    console.log('Task Response Status:', taskRes.status);
    console.log('Task Data:', taskData);
  } catch (e) {
    console.error('Error', e);
  }
}
run();
