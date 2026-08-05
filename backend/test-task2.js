async function run() {
  try {
    let token;
    const loginRes = await fetch('http://127.0.0.1:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      console.log('Login successful');
    } else {
      console.log('Login failed');
      return;
    }
    
    const taskRes = await fetch('http://127.0.0.1:5001/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ title: 'Test Task 2', projectId: '' })
    });
    const taskData = await taskRes.json();
    console.log('Task Response Status:', taskRes.status);
    console.log('Task Data:', taskData);
  } catch (e) {
    console.error('Error', e);
  }
}
run();
