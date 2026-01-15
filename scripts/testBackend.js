const BASE_URL = 'http://localhost:3001/api';

const runTests = async () => {
    console.log('🚀 Starting Backend Integration Tests...\n');

    let token = '';
    let userId = '';
    const randomEmail = `testuser_${Date.now()}@example.com`;

    // 1. Test Registration
    console.log('1. Testing Registration...');
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: randomEmail,
                password: 'password123'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Registration Successful');
            token = data.token;
            userId = data._id;
        } else {
            console.error('❌ Registration Failed:', data.message);
        }
    } catch (e) {
        console.error('❌ Registration Error:', e.message);
    }

    // 2. Test Login (Validation Check)
    console.log('\n2. Testing Login Validation (Invalid Email)...');
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'invalid-email',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (res.status === 400) {
            console.log('✅ Validation Working: Detected invalid email');
        } else {
            console.error('❌ Validation Failed:', res.status, data);
        }
    } catch (e) { console.error(e.message); }

    // 3. Test Trip Search (Dynamic Config Check)
    console.log('\n3. Testing Trip Search...');
    let tripId = '';
    try {
        // Search for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString(); // Send ISO string

        const res = await fetch(`${BASE_URL}/trips/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: dateStr,
                vehicleType: 'limo',
                type: 'oneway'
            })
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
            console.log(`✅ Trip Search Successful. Found ${data.length} trips.`);
            tripId = data[0].id; // Save for booking test
        } else {
            console.error('❌ Trip Search Failed or No Trips Found:', data);
        }
    } catch (e) { console.error('❌ Search Error:', e.message); }

    // 4. Test Booking Creation
    if (token && tripId) {
        console.log('\n4. Testing Booking Creation...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const bookingData = {
                tripId: tripId, // Use ID from search result
                bookingDate: tomorrow.toISOString(),
                seats: ['A1'], // Assuming A1 is available in seeded config
                totalPrice: 250000,
                departureTime: '08:00',
                vehicleType: 'limo',
                pickup: 'Hanoi',
                destination: 'Ha Long',
                customerName: 'Test User',
                customerPhone: '0901234567',
                customerEmail: randomEmail
            };

            const res = await fetch(`${BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();
            if (res.status === 201) {
                console.log('✅ Booking Created Successfully:', data._id);
            } else {
                console.error('❌ Booking Creation Failed:', res.status, data);
            }
        } catch (e) { console.error('❌ Booking Error:', e.message); }
    } else {
        console.log('\n⚠️ Skipping Booking Test (Missing token or tripId)');
    }

    console.log('\n🏁 Tests Completed.');
};

runTests();
