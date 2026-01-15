const bookingRepository = require('../repositories/bookingRepository');
const tripConfigRepository = require('../repositories/tripConfigRepository');
const { getDayRange } = require('../utils/dateHelpers');
const AppError = require('../utils/AppError');

// Note: In production, caching (e.g., Redis) should be used here to avoid hitting DB every request
const getVehicleConfig = async (vehicleType) => {
    const config = await tripConfigRepository.findByVehicleType(vehicleType);
    if (!config) {
        // Fallback or Error if config not found in DB
        throw new AppError(400, `Cấu hình cho loại xe ${vehicleType} không tồn tại.`);
    }
    return config;
};

const generateTripsForDay = (date, vehicleConfig) => {
    const trips = [];
    const { startTime, endTime, intervalMinutes, vehicleType, holidaySurcharges, ...restConfig } = vehicleConfig;

    // Check holiday surcharge
    let surcharge = { percent: 0, amount: 0 };
    if (holidaySurcharges && holidaySurcharges.length > 0) {
        const tripDate = new Date(date);
        for (const h of holidaySurcharges) {
            const start = new Date(h.startDate);
            const end = new Date(h.endDate);
            if (tripDate >= start && tripDate <= end) {
                surcharge.percent = h.surchargePercent || 0;
                surcharge.amount = h.surchargeAmount || 0;
                break; // Apply strict priority or first match
            }
        }
    }

    let currentTime = new Date(date);
    currentTime.setHours(startTime, 0, 0, 0);

    let endOfDay = new Date(date);
    endOfDay.setHours(endTime, 0, 0, 0);

    while (currentTime < endOfDay) {
        const timeStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

        // Calculate dynamic price
        let finalPrice = restConfig.price;
        let finalPriceInfo = restConfig.priceInfo;

        if (surcharge.percent > 0 || surcharge.amount > 0) {
            if (finalPrice) {
                finalPrice = finalPrice * (1 + surcharge.percent / 100) + surcharge.amount;
            }
            if (finalPriceInfo) {
                // Clone map to avoid mutating original config in memory if it was persistent (though here it's fresh object usually)
                // Need to handle Map conversion if it comes from Mongoose lean() or object
                const newPriceInfo = {};
                // Handle if priceInfo is Map or Object (lean returns object usually)
                const entries = finalPriceInfo instanceof Map ? finalPriceInfo.entries() : Object.entries(finalPriceInfo);
                for (const [key, val] of entries) {
                    newPriceInfo[key] = val * (1 + surcharge.percent / 100) + surcharge.amount;
                }
                finalPriceInfo = newPriceInfo;
            }
        }

        trips.push({
            id: `trip_${vehicleType}_${timeStr.replace(':', '')}`,
            time: timeStr,
            duration: vehicleType === 'taxi' ? '4h 00p' : '3h 45p',
            vehicleType: vehicleType,
            price: finalPrice,          // Updated price
            priceInfo: finalPriceInfo,  // Updated priceInfo
            ...restConfig
        });

        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    return trips;
};

const searchTrips = async ({ date, vehicleType, type }) => {
    const searchVehicleType = type === 'airport' ? 'taxi' : vehicleType;

    // Fetch Dynamic Config
    const vehicleConfig = await getVehicleConfig(searchVehicleType);

    const dayRange = getDayRange(date);
    if (!dayRange) {
        throw new AppError(400, "Ngày không hợp lệ");
    }

    // 1. Generate potential trips
    const potentialTrips = generateTripsForDay(date, vehicleConfig);

    // 2. Fetch bookings
    const tripIds = potentialTrips.map(t => t.id);
    const bookings = await bookingRepository.findByTripIdsAndDateRange(tripIds, dayRange.start, dayRange.end);

    // 3. Map seats
    const seatsTakenMap = {};
    for (const booking of bookings) {
        if (!seatsTakenMap[booking.tripId]) {
            seatsTakenMap[booking.tripId] = [];
        }
        seatsTakenMap[booking.tripId].push(...booking.seats);
    }

    // 4. Filter available trips
    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = selectedDate.toDateString() === now.toDateString();

    const availableTrips = potentialTrips.filter(trip => {
        trip.seatsTaken = seatsTakenMap[trip.id] || [];

        const isFull = trip.seatsTaken.length >= trip.totalSeats;
        if (isFull) return false;

        if (isToday) {
            const [hours, minutes] = trip.time.split(':');
            const tripTime = new Date();
            tripTime.setHours(hours, minutes, 0, 0);

            const departureThreshold = new Date(tripTime.getTime() - 30 * 60000);
            if (departureThreshold < now) {
                return false;
            }
        }
        return true;
    });

    return availableTrips;
};

module.exports = {
    searchTrips,
    generateTripsForDay
};
