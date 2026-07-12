import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('==================================================');
  console.log('🚀 STARTING TRANSITOPS BACKEND TEST SUITE');
  console.log('==================================================\n');

  let token = '';

  // 1. Health Check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check: PASSED', health.data);
  } catch (error: any) {
    console.error('❌ Health Check: FAILED', error.message);
    return;
  }

  // 2. Authentication: Login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'manager@transitops.com',
      password: 'password123',
    });
    token = loginResponse.data.token;
    console.log('✅ Authentication (Login): PASSED. Token received.');
  } catch (error: any) {
    console.error('❌ Authentication (Login): FAILED', error.response?.data || error.message);
    return;
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // 3. User Registration (Signup) (fleet_manager only, self-elevation blocked)
  try {
    const randomEmail = `operator-${Math.floor(Math.random() * 10000)}@transitops.com`;
    await axios.post(
      `${BASE_URL}/auth/signup`,
      {
        email: randomEmail,
        password: 'password123',
        name: 'Operation Staff',
        role: 'driver',
      },
      authHeader
    );
    console.log(`✅ Signup Route (fleet_manager authorized): PASSED. User created: ${randomEmail}`);
  } catch (error: any) {
    console.error('❌ Signup Route: FAILED', error.response?.data || error.message);
  }

  // 4. Vehicles Registry with filters (?status=&type=&region=)
  try {
    const filterQuery = 'status=Available&region=North';
    const vehiclesFiltered = await axios.get(`${BASE_URL}/vehicles?${filterQuery}`, authHeader);
    console.log(`✅ Vehicles List Fetch (Filtered by ${filterQuery}): PASSED. Found ${vehiclesFiltered.data.length} vehicles.`);
    if (vehiclesFiltered.data.length > 0) {
      console.log(`   └─ Sample: ${vehiclesFiltered.data[0].registrationNumber} (Status: ${vehiclesFiltered.data[0].status}, Region: ${vehiclesFiltered.data[0].region})`);
    }
  } catch (error: any) {
    console.error('❌ Vehicles List Fetch: FAILED', error.response?.data || error.message);
  }

  // 5. Drivers Registry with filter (?status=)
  try {
    const driversFiltered = await axios.get(`${BASE_URL}/drivers?status=Available`, authHeader);
    console.log(`✅ Drivers List Fetch (Filtered by status=Available): PASSED. Found ${driversFiltered.data.length} drivers.`);
  } catch (error: any) {
    console.error('❌ Drivers List Fetch: FAILED', error.response?.data || error.message);
  }

  // 6. AI Dispatch Suggestions (Wow Feature 1)
  try {
    const suggest = await axios.post(
      `${BASE_URL}/ai/dispatch-suggest`,
      { cargoWeight: 4.5 },
      authHeader
    );
    console.log('✅ AI Dispatch Suggestion: PASSED');
    console.log(`   └─ Recommend Vehicle ID: ${suggest.data.vehicleId}`);
    console.log(`   └─ Recommend Driver ID: ${suggest.data.driverId}`);
    console.log(`   └─ AI Reason: "${suggest.data.reason}"`);
  } catch (error: any) {
    console.error('❌ AI Dispatch Suggestion: FAILED', error.response?.data || error.message);
  }

  // 7. AI Fleet Insights Query (Wow Feature 2)
  try {
    const insights = await axios.post(
      `${BASE_URL}/ai/fleet-insights`,
      { query: 'Which vehicles are costing the most this month?' },
      authHeader
    );
    console.log('✅ AI Fleet Insights Query: PASSED');
    console.log(`   └─ AI Answer: "${insights.data.answer}"`);
  } catch (error: any) {
    console.error('❌ AI Fleet Insights Query: FAILED', error.response?.data || error.message);
  }

  // 8. AI Cost Forecasting (Wow Feature 2 - Cost Forecast)
  try {
    const forecast = await axios.post(
      `${BASE_URL}/ai/cost-forecast`,
      {},
      authHeader
    );
    console.log('✅ AI Cost Forecasting: PASSED');
    console.log(`   └─ Forecast Next Month: $${forecast.data.forecastNextMonth} (${forecast.data.projectedChange})`);
  } catch (error: any) {
    console.error('❌ AI Cost Forecasting: FAILED', error.response?.data || error.message);
  }

  // 9. AI License Risk (Wow Feature 3)
  try {
    const risk = await axios.get(`${BASE_URL}/ai/license-risk`, authHeader);
    console.log('✅ AI License Risk Assessment: PASSED');
    console.log(`   └─ Expired: ${risk.data.expiredCount}, Critical: ${risk.data.criticalCount}`);
  } catch (error: any) {
    console.error('❌ AI License Risk Assessment: FAILED', error.response?.data || error.message);
  }

  // 10. Dashboard KPIs
  try {
    const kpis = await axios.get(`${BASE_URL}/dashboard/kpis`, authHeader);
    console.log('✅ Dashboard KPIs Fetch: PASSED');
    console.log(`   └─ Active Trips: ${kpis.data.activeTrips}`);
    console.log(`   └─ Available Vehicles: ${kpis.data.fleet.available}/${kpis.data.fleet.total}`);
  } catch (error: any) {
    console.error('❌ Dashboard KPIs Fetch: FAILED', error.response?.data || error.message);
  }

  // 11. Cost Reports
  try {
    const cost = await axios.get(`${BASE_URL}/reports/cost`, authHeader);
    console.log('✅ Cost Report: PASSED');
    console.log(`   └─ Total Spent: $${cost.data.total}`);
  } catch (error: any) {
    console.error('❌ Cost Report: FAILED', error.response?.data || error.message);
  }

  // 12. CSV Export
  try {
    const csvExport = await axios.get(`${BASE_URL}/reports/export?format=csv`, authHeader);
    console.log('✅ CSV Report Export: PASSED. Headers:');
    console.log(`   └─ Content-Type: ${csvExport.headers['content-type']}`);
  } catch (error: any) {
    console.error('❌ CSV Report Export: FAILED', error.response?.data || error.message);
  }

  console.log('\n==================================================');
  console.log('🏁 TRANSITOPS BACKEND TESTING COMPLETE');
  console.log('==================================================');
}

testBackend();
