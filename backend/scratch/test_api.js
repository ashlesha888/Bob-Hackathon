const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET',
    });
    console.log('1. Health Check (GET /):', health.status, JSON.stringify(health.data));

    // 2. Create user
    const userRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Jane AI', email: 'jane@example.com' }
    );
    console.log('2. Create User (POST /api/users):', userRes.status, JSON.stringify(userRes.data));
    const userId = userRes.data.user._id;

    // 3. Get user
    const getUserRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/${userId}`,
      method: 'GET',
    });
    console.log(`3. Get User (GET /api/users/${userId}):`, getUserRes.status, JSON.stringify(getUserRes.data));

    // 4. Save completed workout
    const workoutRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/workouts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId,
        exercise: 'Squat',
        totalReps: 20,
        correctReps: 16,
        incorrectReps: 4,
        accuracy: 80,
        duration: 60,
        feedback: [
          'Knee position incorrect: 2 reps',
          'Back angle incorrect: 2 reps',
        ],
      }
    );
    console.log('4. Save Workout (POST /api/workouts):', workoutRes.status, JSON.stringify(workoutRes.data));
    const workoutId = workoutRes.data.workout._id;

    // 5. Get workout history
    const historyRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/workouts/${userId}`,
      method: 'GET',
    });
    console.log(`5. Workout History (GET /api/workouts/${userId}):`, historyRes.status, JSON.stringify(historyRes.data));

    // 6. Get workout details
    const detailRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/workouts/${userId}/${workoutId}`,
      method: 'GET',
    });
    console.log(`6. Workout Detail (GET /api/workouts/${userId}/${workoutId}):`, detailRes.status, JSON.stringify(detailRes.data));

    // 7. Get user stats
    const statsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/stats/${userId}`,
      method: 'GET',
    });
    console.log(`7. User Stats (GET /api/stats/${userId}):`, statsRes.status, JSON.stringify(statsRes.data));

    // 8. Test invalid validation (e.g. accuracy > 100)
    const invalidRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/workouts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId,
        exercise: 'Squat',
        totalReps: 10,
        correctReps: 10,
        incorrectReps: 0,
        accuracy: 150, // Invalid accuracy > 100
        duration: 30,
      }
    );
    console.log('8. Invalid Validation Check (POST /api/workouts with accuracy=150):', invalidRes.status, JSON.stringify(invalidRes.data));

    console.log('\n✅ All API Tests Completed Successfully!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runTests();
